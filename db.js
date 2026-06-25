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

async function getRanking() {
  const res = await pool.query(
    "SELECT * FROM leitores ORDER BY paginas DESC LIMIT 5",
  );
  return res.rows;
}

module.exports = { inicializarDB, getLeitor, atualizarLeitor, getRanking };
