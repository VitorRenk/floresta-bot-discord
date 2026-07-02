require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const {
  inicializarDB,
  getLeitor,
  atualizarLeitor,
  resetarPaginasLeitor,
  getRanking,
} = require("./db");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

function gerarFloresta(paginas) {
  const arvores = Math.floor(paginas / 10);
  const mudas = Math.floor((paginas % 10) / 3);
  const sementes = paginas % 3;

  let floresta = "";
  floresta += "🌳".repeat(arvores);
  floresta += "🌱".repeat(mudas);
  floresta += "🌰".repeat(sementes);

  if (floresta === "")
    floresta = "🪨 (leia páginas para crescer sua floresta!)";
  return floresta;
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
  const hoje = new Date().toISOString().slice(0, 10);

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

    const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

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

    const floresta = gerarFloresta(paginas);

    const embed = new EmbedBuilder()
      .setColor(0x2d6a4f)
      .setTitle(`🌿 ${nome} leu ${paginasNovas} páginas hoje!`)
      .setDescription(`**Sua floresta:**\n${floresta}`)
      .addFields(
        { name: "📚 Total de páginas", value: `${paginas}`, inline: true },
        { name: "🔥 Streak", value: `${streak} dia(s)`, inline: true },
      )
      .setFooter({
        text: "Use !floresta para ver sua floresta a qualquer hora",
      });

    return message.reply({ embeds: [embed] });
  }

  if (conteudo === "!floresta") {
    const user = await getLeitor(userId, nome);
    const floresta = gerarFloresta(user.paginas);

    const embed = new EmbedBuilder()
      .setColor(0x2d6a4f)
      .setTitle(`🌳 Floresta de ${nome}`)
      .setDescription(floresta)
      .addFields(
        { name: "📚 Total de páginas", value: `${user.paginas}`, inline: true },
        { name: "🔥 Streak", value: `${user.streak} dia(s)`, inline: true },
      );

    return message.reply({ embeds: [embed] });
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

  if (conteudo === "!ranking") {
    const ranking = await getRanking();

    if (ranking.length === 0) {
      return message.reply(
        "Ninguém registrou páginas ainda! Use `!li 30` para começar.",
      );
    }

    const medalhas = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    let lista = "";

    for (let i = 0; i < ranking.length; i++) {
      lista += `${medalhas[i]} **${ranking[i].nome}** — ${ranking[i].paginas} páginas\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(0x2d6a4f)
      .setTitle("🏆 Ranking de Leitores")
      .setDescription(lista);

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
        { name: "!floresta", value: "Veja sua floresta atual" },
        {
          name: "!resetar",
          value: "Zera suas páginas lidas sem alterar seu streak",
        },
        { name: "!ranking", value: "Top 5 leitores do servidor" },
        { name: "!ajuda", value: "Mostra essa mensagem" },
      );

    return message.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
