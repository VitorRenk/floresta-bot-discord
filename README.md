# TokoBot

TokoBot é um bot para Discord que ajuda a registrar páginas lidas e transforma esse hábito em uma floresta visual.

## Exemplo da floresta

![Floresta com 500 paginas lidas](assets/readme/forest-500.png)

## O que o bot faz

O bot responde a comandos no Discord para:

- `!li [páginas]` → registra páginas lidas no dia
- `!floresta` → mostra uma imagem da sua floresta atual
- `!resetar` → zera suas páginas lidas sem alterar seu streak
- `!ranking` → exibe os top 5 leitores
- `!ajuda` → mostra os comandos disponíveis

A floresta visual cresce a cada 50 páginas lidas. Páginas parciais mostram o próximo espaço da floresta em estágio de crescimento.

Os dados do usuário são salvos em um banco PostgreSQL.

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

## Como manter o bot online 24/7 no Railway

O Railway é uma forma simples de deixar o bot sempre ativo.

### Passos

1. Acesse o Railway e crie uma conta.
2. Crie um novo projeto e conecte este repositório do GitHub.
3. No serviço do bot, defina o comando de start como:
   ```bash
   npm start
   ```
4. Adicione as variáveis de ambiente:
   - `TOKEN` → token do bot do Discord
   - `DATABASE_URL` → URL do banco PostgreSQL do Railway
5. Se quiser, adicione também um banco PostgreSQL no Railway e conecte-o ao projeto.
6. Faça o deploy e o bot ficará disponível enquanto o serviço estiver ativo.

## Observação

O bot precisa de um token válido do Discord e de um banco PostgreSQL configurado para funcionar corretamente.
