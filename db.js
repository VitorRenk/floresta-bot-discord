const { Pool } = require("pg");

console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "EXISTE" : "NAO EXISTE",
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function inicializarDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leituras_diarias (
      user_id TEXT NOT NULL,
      data TEXT NOT NULL,
      paginas INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, data)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_leituras_diarias_user_data
    ON leituras_diarias (user_id, data)
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leitores (
      user_id TEXT PRIMARY KEY,
      nome TEXT,
      paginas INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      ultimo_dia TEXT DEFAULT ''
    )
  `);
  console.log("✅ Banco de dados pronto!");
}

async function getLeitor(userId, nome) {
  await pool.query(
    `
    INSERT INTO leitores (user_id, nome, paginas, streak, ultimo_dia)
    VALUES ($1, $2, 0, 0, '')
    ON CONFLICT (user_id) DO NOTHING
  `,
    [userId, nome],
  );

  const res = await pool.query("SELECT * FROM leitores WHERE user_id = $1", [
    userId,
  ]);
  return res.rows[0];
}

async function atualizarLeitor(userId, paginas, streak, ultimoDia) {
  await pool.query(
    `
    UPDATE leitores SET paginas = $1, streak = $2, ultimo_dia = $3 WHERE user_id = $4
  `,
    [paginas, streak, ultimoDia, userId],
  );
}

async function registrarPaginasDia(userId, data, paginas) {
  await pool.query(
    `
    INSERT INTO leituras_diarias (user_id, data, paginas)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, data)
    DO UPDATE SET paginas = leituras_diarias.paginas + EXCLUDED.paginas
  `,
    [userId, data, paginas],
  );
}

async function getPaginasPeriodo(userId, dataInicio, dataFim) {
  const res = await pool.query(
    `
    SELECT COALESCE(SUM(paginas), 0)::INTEGER AS paginas
    FROM leituras_diarias
    WHERE user_id = $1
      AND data >= $2
      AND data <= $3
  `,
    [userId, dataInicio, dataFim],
  );

  return res.rows[0].paginas;
}

async function corrigirPaginasDia(userId, data, delta) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const leituraRes = await client.query(
      `
      SELECT paginas
      FROM leituras_diarias
      WHERE user_id = $1 AND data = $2
      FOR UPDATE
    `,
      [userId, data],
    );

    if (leituraRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return { found: false };
    }

    const paginasAntes = leituraRes.rows[0].paginas;
    const paginasDepois = Math.max(0, paginasAntes + delta);
    const deltaAplicado = paginasDepois - paginasAntes;

    await client.query(
      `
      UPDATE leituras_diarias
      SET paginas = $1
      WHERE user_id = $2 AND data = $3
    `,
      [paginasDepois, userId, data],
    );

    const totalRes = await client.query(
      `
      UPDATE leitores
      SET paginas = GREATEST(0, paginas + $1)
      WHERE user_id = $2
      RETURNING paginas
    `,
      [deltaAplicado, userId],
    );

    await client.query("COMMIT");

    return {
      found: true,
      paginasAntes,
      paginasDepois,
      deltaAplicado,
      totalPaginas: totalRes.rows[0]?.paginas ?? 0,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function resetarPaginasLeitor(userId) {
  await pool.query("UPDATE leitores SET paginas = 0 WHERE user_id = $1", [
    userId,
  ]);
  await pool.query("DELETE FROM leituras_diarias WHERE user_id = $1", [
    userId,
  ]);
}

async function getRankingMensal(dataInicio, dataFim) {
  const res = await pool.query(
    `
    SELECT
      leitores.user_id,
      leitores.nome,
      COALESCE(SUM(leituras_diarias.paginas), 0)::INTEGER AS paginas
    FROM leitores
    INNER JOIN leituras_diarias
      ON leituras_diarias.user_id = leitores.user_id
    WHERE leituras_diarias.data >= $1
      AND leituras_diarias.data <= $2
    GROUP BY leitores.user_id, leitores.nome
    HAVING COALESCE(SUM(leituras_diarias.paginas), 0) > 0
    ORDER BY paginas DESC
    LIMIT 5
  `,
    [dataInicio, dataFim],
  );
  return res.rows;
}

module.exports = {
  inicializarDB,
  getLeitor,
  atualizarLeitor,
  registrarPaginasDia,
  getPaginasPeriodo,
  corrigirPaginasDia,
  resetarPaginasLeitor,
  getRankingMensal,
};
