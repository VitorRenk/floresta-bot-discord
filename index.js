require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const dados = {}; // { userId: { paginas: 0, streak: 0, ultimoDia: '' } }

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

client.on("clientReady", () => {
  console.log(`✅ TokoBot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  console.log(`Mensagem recebida: ${message.content}`);
  if (message.author.bot) return;

  const conteudo = message.content.trim().toLowerCase();
  const userId = message.author.id;
  const nome = message.member?.displayName || message.author.username;
  const hoje = new Date().toISOString().slice(0, 10);

  // Inicializa usuário
  if (!dados[userId]) {
    dados[userId] = { paginas: 0, streak: 0, ultimoDia: "" };
  }

  const user = dados[userId];

  // !li 30
  if (conteudo.startsWith("!li ")) {
    const partes = conteudo.split(" ");
    const paginas = parseInt(partes[1]);

    if (isNaN(paginas) || paginas <= 0) {
      return message.reply(
        "❌ Use assim: `!li 30` (número de páginas que você leu hoje)",
      );
    }

    // Streak
    if (user.ultimoDia === hoje) {
      user.paginas += paginas;
    } else {
      const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (user.ultimoDia === ontem) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
      user.paginas += paginas;
      user.ultimoDia = hoje;
    }

    const floresta = gerarFloresta(user.paginas);

    const embed = new EmbedBuilder()
      .setColor(0x2d6a4f)
      .setTitle(`🌿 ${nome} leu ${paginas} páginas hoje!`)
      .setDescription(`**Sua floresta:**\n${floresta}`)
      .addFields(
        { name: "📚 Total de páginas", value: `${user.paginas}`, inline: true },
        { name: "🔥 Streak", value: `${user.streak} dia(s)`, inline: true },
      )
      .setFooter({
        text: "Use !floresta para ver sua floresta a qualquer hora",
      });

    return message.reply({ embeds: [embed] });
  }

  // !floresta
  if (conteudo === "!floresta") {
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

  // !ranking
  if (conteudo === "!ranking") {
    const ranking = Object.entries(dados)
      .sort((a, b) => b[1].paginas - a[1].paginas)
      .slice(0, 5);

    if (ranking.length === 0) {
      return message.reply(
        "Ninguém registrou páginas ainda! Use `!li 30` para começar.",
      );
    }

    const medalhas = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    let lista = "";

    for (let i = 0; i < ranking.length; i++) {
      const [id, info] = ranking[i];
      const membro = await message.guild.members.fetch(id).catch(() => null);
      const nomeMembro = membro ? membro.user.username : "Leitor";
      lista += `${medalhas[i]} **${nomeMembro}** — ${info.paginas} páginas\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(0x2d6a4f)
      .setTitle("🏆 Ranking de Leitores")
      .setDescription(lista);

    return message.reply({ embeds: [embed] });
  }

  // !ajuda
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
        { name: "!ranking", value: "Top 5 leitores do servidor" },
        { name: "!ajuda", value: "Mostra essa mensagem" },
      );

    return message.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
