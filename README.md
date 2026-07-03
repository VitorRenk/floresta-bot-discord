# TokoBot

TokoBot é um bot para Discord que transforma páginas lidas em uma floresta visual. Ele foi pensado para ajudar comunidades de leitura, estudo e produtividade a registrarem progresso diário de um jeito mais motivador do que uma simples contagem.

## Exemplo da floresta

Esta é uma simulação de uma floresta com **525 páginas lidas**:

![Floresta com 525 páginas lidas](assets/readme/forest-525.png)

Com 525 páginas, o usuário já tem **10 árvores completas** e mais **25 páginas de progresso** para a próxima árvore.

## Como funciona

Cada usuário registra quantas páginas leu usando o comando `!li`. O bot soma esse total, acompanha o streak de leitura e gera uma imagem PNG da floresta pelo comando `!floresta`.

- A cada **50 páginas**, nasce uma árvore completa.
- Páginas parciais mostram a próxima árvore em crescimento.
- O progresso é individual por usuário do Discord.
- O streak aumenta quando o usuário registra leitura em dias consecutivos.
- A floresta é enviada diretamente no Discord como imagem anexada ao embed.
- Os dados são salvos em PostgreSQL.

## Comandos

- `!li [páginas]` - registra páginas lidas no dia. Exemplo: `!li 30`
- `!floresta` - mostra sua floresta visual, total de páginas, árvores completas, progresso da próxima árvore e streak
- `!ranking` - exibe os 5 leitores com mais páginas registradas
- `!resetar` - zera suas páginas lidas sem alterar seu streak
- `!ajuda` - mostra os comandos disponíveis

## Uso para produtividade

TokoBot funciona como um marcador visual de hábito. A floresta cria uma recompensa visual para a leitura, ajudando o usuário a perceber evolução acumulada, manter constância e participar de desafios do servidor.

Ele pode ser usado para:

- clubes de leitura;
- grupos de estudo;
- desafios pessoais de páginas por semana;
- acompanhamento de streaks;
- rankings amigáveis entre membros do servidor.

## Tecnologias

- Node.js
- Discord.js
- PostgreSQL
- Sharp para gerar a imagem PNG da floresta

## Como usar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env` com:
   ```env
   TOKEN=seu_token_do_discord
   DATABASE_URL=sua_url_do_postgres
   ```
3. Inicie o bot:
   ```bash
   npm start
   ```

## Deploy no Railway

1. Crie um projeto no Railway.
2. Conecte este repositório ao projeto.
3. Configure o comando de start:
   ```bash
   npm start
   ```
4. Adicione as variáveis de ambiente:
   - `TOKEN` - token do bot do Discord
   - `DATABASE_URL` - URL do banco PostgreSQL
5. Adicione ou conecte um banco PostgreSQL.
6. Faça o deploy.

## Observação

O bot precisa de um token válido do Discord e de um banco PostgreSQL configurado para funcionar corretamente.
