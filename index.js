require("dotenv").config();
const {
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
} = require("discord.js");
const {
  TREE_PAGE_GOAL,
  generateForestImage,
  getForestProgress,
} = require("./forestImage");
const {
  inicializarDB,
  getLeitor,
  atualizarLeitor,
  registrarPaginasDia,
  getPaginasPeriodo,
  corrigirPaginasDia,
  resetarPaginasLeitor,
  getRankingMensal,
  getMelhorMes,
  getPosicaoRankingMensal,
} = require("./db");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const BOT_TIME_ZONE = "America/Sao_Paulo";
const STREAK_BADGES = [
  { days: 3, label: "🌱 Constância Inicial" },
  { days: 7, label: "🔥 Semana Perfeita" },
  { days: 14, label: "🌿 Ritmo Forte" },
  { days: 30, label: "🌳 Hábito Enraizado" },
  { days: 60, label: "🏕️ Leitor Persistente" },
  { days: 100, label: "🏔️ Lenda da Floresta" },
];

function getTodayDateString() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BOT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function addDaysToDateString(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function getWeekPeriod(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const start = addDaysToDateString(dateString, -date.getUTCDay());

  return {
    start,
    end: addDaysToDateString(start, 6),
  };
}

function getMonthPeriod(dateString) {
  const [year, month] = dateString.split("-").map(Number);
  const start = `${dateString.slice(0, 7)}-01`;
  const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

  return { start, end };
}

function formatDateBR(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function formatMonthBR(monthString) {
  const [year, month] = monthString.split("-");
  return `${month}/${year}`;
}

function formatForestProgress(progress) {
  if (progress.remainingPages === 0) {
    return progress.completeTrees > 0
      ? "Próxima árvore: 0%"
      : `Próxima árvore: 0/${TREE_PAGE_GOAL} páginas`;
  }

  return `Próxima árvore: ${progress.remainingPages}/${TREE_PAGE_GOAL} páginas (${progress.nextTreeProgress}%)`;
}

function formatStreakBadges(streak) {
  const unlockedBadges = STREAK_BADGES.filter((badge) => streak >= badge.days);

  if (unlockedBadges.length === 0) {
    return "Nenhuma ainda. Alcance 3 dias de streak para ganhar a primeira.";
  }

  return unlockedBadges.map((badge) => badge.label).join("\n");
}

function getUnlockedStreakBadge(previousStreak, currentStreak) {
  return STREAK_BADGES.find(
    (badge) => previousStreak < badge.days && currentStreak >= badge.days,
  );
}

async function criarRespostaFlorestaPeriodo(user, nome, userId, periodo, tipo) {
  const paginas = await getPaginasPeriodo(userId, periodo.start, periodo.end);
  const progress = getForestProgress(paginas);
  const image = await generateForestImage(paginas, userId);
  const attachment = new AttachmentBuilder(image, { name: "floresta.png" });
  const periodoTexto = `${formatDateBR(periodo.start)} a ${formatDateBR(periodo.end)}`;
  const periodoNome = tipo === "semana" ? "Semana" : "Mês";

  const embed = new EmbedBuilder()
    .setColor(0x2d6a4f)
    .setTitle(`🌲 Floresta de ${nome} - ${periodoNome}`)
    .setDescription(periodoTexto)
    .setImage("attachment://floresta.png")
    .addFields(
      { name: "📚 Páginas no período", value: `${paginas}`, inline: true },
      {
        name: "🌲 Árvores completas",
        value: `${progress.completeTrees}`,
        inline: true,
      },
      {
        name: "🌱 Crescimento",
        value: formatForestProgress(progress),
        inline: false,
      },
      { name: "🔥 Streak", value: `${user.streak} dia(s)`, inline: true },
    );

  return { embeds: [embed], files: [attachment] };
}

client.on("clientReady", async () => {
  await inicializarDB();
  console.log(`✅ TokoBot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const conteudo = message.content.trim().toLowerCase();
  const userId = message.author.id;
  const nome = message.member?.displayName || message.author.username;
  const hoje = getTodayDateString();

  if (conteudo.startsWith("!li ")) {
    const partes = conteudo.split(" ");
    const paginasNovas = parseInt(partes[1]);

    if (isNaN(paginasNovas) || paginasNovas <= 0) {
      return message.reply(
        "❌ Use assim: `!li 30` (número de páginas que você leu hoje)",
      );
    }

    const user = await getLeitor(userId, nome);
    let { paginas, streak, ultimo_dia } = user;
    const streakAnterior = streak;

    const ontem = addDaysToDateString(hoje, -1);

    if (ultimo_dia === hoje) {
      paginas += paginasNovas;
    } else {
      if (ultimo_dia === ontem) {
        streak += 1;
      } else {
        streak = 1;
      }
      paginas += paginasNovas;
      ultimo_dia = hoje;
    }

    await atualizarLeitor(userId, paginas, streak, ultimo_dia);
    await registrarPaginasDia(userId, hoje, paginasNovas);

    const progress = getForestProgress(paginas);
    const badgeDesbloqueada = getUnlockedStreakBadge(streakAnterior, streak);
    const embed = new EmbedBuilder()
      .setColor(0x2d6a4f)
      .setTitle(`🌿 ${nome} leu ${paginasNovas} páginas hoje!`)
      .setDescription(
        "Use `!floresta-semana` ou `!floresta-mes` para ver sua floresta visual atualizada.",
      )
      .addFields(
        { name: "📚 Total de páginas", value: `${paginas}`, inline: true },
        {
          name: "🌲 Árvores completas",
          value: `${progress.completeTrees}`,
          inline: true,
        },
        { name: "🔥 Streak", value: `${streak} dia(s)`, inline: true },
      );

    if (badgeDesbloqueada) {
      embed.addFields({
        name: "🏅 Nova badge desbloqueada!",
        value: badgeDesbloqueada.label,
        inline: false,
      });
    }

    return message.reply({ embeds: [embed] });
  }

  if (conteudo.startsWith("!corrigir ")) {
    const partes = conteudo.split(" ");
    const delta = parseInt(partes[1]);

    if (!/^[+-]?\d+$/.test(partes[1] || "") || delta === 0) {
      return message.reply(
        "❌ Use assim: `!corrigir -10` ou `!corrigir 10`.",
      );
    }

    await getLeitor(userId, nome);
    const resultado = await corrigirPaginasDia(userId, hoje, delta);

    if (!resultado.found) {
      return message.reply(
        "Use `!li [páginas]` para registrar sua leitura de hoje primeiro.",
      );
    }

    const embed = new EmbedBuilder()
      .setColor(0x2d6a4f)
      .setTitle(`Correção de leitura de ${nome}`)
      .setDescription("Sua leitura de hoje foi corrigida.")
      .addFields(
        {
          name: "Correção solicitada",
          value: `${delta > 0 ? "+" : ""}${delta}`,
          inline: true,
        },
        {
          name: "Correção aplicada",
          value: `${resultado.deltaAplicado > 0 ? "+" : ""}${resultado.deltaAplicado}`,
          inline: true,
        },
        {
          name: "Páginas de hoje",
          value: `${resultado.paginasAntes} → ${resultado.paginasDepois}`,
          inline: true,
        },
        {
          name: "Total acumulado",
          value: `${resultado.totalPaginas}`,
          inline: true,
        },
      )
      .setFooter({
        text: "Seu streak e seu último dia lido foram preservados.",
      });

    return message.reply({ embeds: [embed] });
  }

  if (conteudo === "!floresta-semana") {
    const user = await getLeitor(userId, nome);
    const periodo = getWeekPeriod(hoje);
    return message.reply(
      await criarRespostaFlorestaPeriodo(user, nome, userId, periodo, "semana"),
    );
  }

  if (conteudo === "!floresta-mes" || conteudo === "!floresta-mês") {
    const user = await getLeitor(userId, nome);
    const periodo = getMonthPeriod(hoje);
    return message.reply(
      await criarRespostaFlorestaPeriodo(user, nome, userId, periodo, "mes"),
    );
  }

  if (conteudo === "!floresta") {
    return message.reply(
      "O comando `!floresta` foi dividido em `!floresta-semana` e `!floresta-mes`.",
    );
  }

  if (conteudo === "!resetar") {
    const user = await getLeitor(userId, nome);

    if (user.paginas === 0) {
      return message.reply("Você ainda não tem páginas para resetar.");
    }

    await resetarPaginasLeitor(userId);

    const embed = new EmbedBuilder()
      .setColor(0x2d6a4f)
      .setTitle(`Páginas de ${nome} resetadas!`)
      .setDescription("Seu total de páginas voltou para 0.")
      .addFields(
        { name: "Total de páginas", value: "0", inline: true },
        { name: "Streak", value: `${user.streak} dia(s)`, inline: true },
      )
      .setFooter({
        text: "Seu streak e seu último dia lido foram preservados.",
      });

    return message.reply({ embeds: [embed] });
  }

  if (conteudo === "!perfil") {
    const user = await getLeitor(userId, nome);
    const periodoSemana = getWeekPeriod(hoje);
    const periodoMes = getMonthPeriod(hoje);
    const [paginasSemana, paginasMes, melhorMes, posicaoRanking] =
      await Promise.all([
        getPaginasPeriodo(userId, periodoSemana.start, periodoSemana.end),
        getPaginasPeriodo(userId, periodoMes.start, periodoMes.end),
        getMelhorMes(userId),
        getPosicaoRankingMensal(userId, periodoMes.start, periodoMes.end),
      ]);
    const ultimoDia = user.ultimo_dia
      ? formatDateBR(user.ultimo_dia)
      : "Ainda não registrado";
    const melhorMesTexto = melhorMes
      ? `${formatMonthBR(melhorMes.mes)} (${melhorMes.paginas} páginas)`
      : "Ainda sem registros";
    const rankingTexto = posicaoRanking
      ? `#${posicaoRanking.posicao} (${posicaoRanking.paginas} páginas)`
      : "Sem posição neste mês";
    const badgesTexto = formatStreakBadges(user.streak);

    const embed = new EmbedBuilder()
      .setColor(0x2d6a4f)
      .setTitle(`Perfil de leitura de ${nome}`)
      .addFields(
        {
          name: "Total acumulado",
          value: `${user.paginas} páginas`,
          inline: true,
        },
        {
          name: "Semana atual",
          value: `${paginasSemana} páginas`,
          inline: true,
        },
        {
          name: "Mês atual",
          value: `${paginasMes} páginas`,
          inline: true,
        },
        { name: "Streak", value: `${user.streak} dia(s)`, inline: true },
        { name: "Último dia lido", value: ultimoDia, inline: true },
        { name: "Melhor mês", value: melhorMesTexto, inline: true },
        { name: "Ranking mensal", value: rankingTexto, inline: false },
        { name: "Badges de streak", value: badgesTexto, inline: false },
      )
      .setFooter({
        text: `Semana: ${formatDateBR(periodoSemana.start)} a ${formatDateBR(periodoSemana.end)} | Mês: ${formatDateBR(periodoMes.start)} a ${formatDateBR(periodoMes.end)}`,
      });

    return message.reply({ embeds: [embed] });
  }

  if (conteudo === "!ranking") {
    const periodo = getMonthPeriod(hoje);
    const ranking = await getRankingMensal(periodo.start, periodo.end);

    if (ranking.length === 0) {
      return message.reply(
        "Ninguém registrou páginas neste mês ainda! Use `!li 30` para começar.",
      );
    }

    const medalhas = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    let lista = "";

    for (let i = 0; i < ranking.length; i++) {
      lista += `${medalhas[i]} **${ranking[i].nome}** — ${ranking[i].paginas} páginas\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(0x2d6a4f)
      .setTitle("🏆 Ranking Mensal de Leitores")
      .setDescription(lista)
      .setFooter({
        text: `Período: ${formatDateBR(periodo.start)} a ${formatDateBR(periodo.end)}`,
      });

    return message.reply({ embeds: [embed] });
  }

  if (conteudo === "!ajuda") {
    const embed = new EmbedBuilder()
      .setColor(0x2d6a4f)
      .setTitle("🌱 TokoBot — Comandos")
      .addFields(
        {
          name: "!li [páginas]",
          value: "Registra páginas lidas hoje. Ex: `!li 30`",
        },
        {
          name: "!corrigir [ajuste]",
          value: "Corrige a leitura de hoje. Ex: `!corrigir -10`",
        },
        {
          name: "!floresta-semana",
          value: "Mostra sua floresta da semana atual, de domingo a sábado",
        },
        {
          name: "!floresta-mes",
          value: "Mostra sua floresta do mês atual",
        },
        {
          name: "!perfil",
          value: "Mostra seu resumo de leitura e posição mensal",
        },
        {
          name: "!resetar",
          value: "Zera suas páginas lidas sem alterar seu streak",
        },
        { name: "!ranking", value: "Top 5 leitores do mês atual" },
        { name: "!ajuda", value: "Mostra essa mensagem" },
      );

    return message.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
