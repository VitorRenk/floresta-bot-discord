# TokoBot

TokoBot é um bot para Discord que transforma páginas lidas em uma floresta visual. Ele foi pensado para comunidades de leitura, estudos e produtividade que querem acompanhar o hábito diário de um jeito mais motivador do que uma contagem simples.

## Exemplo

Esta é uma simulação de uma floresta com **500 páginas lidas no período**:

<p align="center">
  <img src="assets/readme/forest-500.png" alt="Floresta com 500 páginas lidas" width="520">
</p>

Com 500 páginas no período, o usuário tem **10 árvores completas**, sem árvore parcial.

## Funcionalidades

- Registro diário de páginas lidas com `!li`.
- Floresta visual semanal com `!floresta-semana`.
- Floresta visual mensal com `!floresta-mes`.
- Ranking mensal dos leitores com mais páginas no mês atual.
- Reset individual de páginas com preservação de streak e último dia lido.
- Imagens PNG geradas dinamicamente com `sharp` e enviadas no Discord como anexo do embed.
- Sprites locais para ilha, macieira, pinheiro, carvalho e estágios de crescimento.
- Persistência em PostgreSQL.

## Como a floresta cresce

- A cada **50 páginas no período**, nasce uma árvore completa.
- Páginas restantes mostram a próxima árvore em crescimento.
- A floresta da semana usa a semana atual do calendário, de domingo a sábado.
- A floresta do mês usa o mês atual.
- A aparência das árvores é pseudoaleatória e estável por usuário, então a floresta não muda de forma a cada chamada.
- O bot salva um histórico diário em `leituras_diarias` para calcular semana e mês.
- O ranking usa o mesmo período de `!floresta-mes`, incentivando uma nova disputa a cada mês.

## Comandos

| Comando | Descrição |
| --- | --- |
| `!li [páginas]` | Registra páginas lidas hoje. Exemplo: `!li 30` |
| `!floresta-semana` | Mostra sua floresta da semana atual, de domingo a sábado |
| `!floresta-mes` | Mostra sua floresta do mês atual |
| `!ranking` | Exibe os 5 leitores com mais páginas no mês atual |
| `!resetar` | Zera suas páginas e histórico diário, sem alterar streak e último dia lido |
| `!ajuda` | Mostra os comandos disponíveis |

O comando antigo `!floresta` foi substituído pelas versões de semana e mês. Se usado, ele apenas orienta o usuário para `!floresta-semana` e `!floresta-mes`.

## Uso para produtividade

TokoBot funciona como um marcador visual de hábito. A floresta cria uma recompensa visual para leitura e ajuda o usuário a perceber evolução semanal, mensal e acumulada.

Ele pode ser usado para:

- clubes de leitura;
- grupos de estudo;
- desafios pessoais de páginas por semana;
- metas mensais de leitura;
- acompanhamento de streaks;
- rankings mensais amigáveis entre membros do servidor.

## Estrutura do projeto

- `index.js`: comandos do Discord e fluxo principal do bot.
- `db.js`: conexão com PostgreSQL e funções de persistência.
- `forestImage.js`: composição da floresta em PNG.
- `scripts/generateForestAssets.js`: geração dos sprites PNG da floresta.
- `assets/forest/`: sprites usados pelo bot em produção.
- `assets/readme/`: imagens usadas na documentação.
- `tmp/`: prévias locais geradas durante testes, ignoradas pelo Git.

## Requisitos

- Node.js
- PostgreSQL
- Token de bot do Discord

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
TOKEN=seu_token_do_discord
DATABASE_URL=sua_url_do_postgres
```

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o bot:

   ```bash
   npm start
   ```

Na primeira inicialização, o bot cria automaticamente as tabelas `leitores` e `leituras_diarias`, caso elas ainda não existam.

## Gerando assets da floresta

Os sprites da floresta ficam versionados em `assets/forest/`. Para regenerá-los:

```bash
node scripts/generateForestAssets.js
```

## Deploy no Railway

1. Crie um projeto no Railway.
2. Conecte este repositório ao projeto.
3. Adicione ou conecte um banco PostgreSQL.
4. Configure as variáveis de ambiente:
   - `TOKEN`
   - `DATABASE_URL`
5. Use o comando de start:

   ```bash
   npm start
   ```

6. Faça o deploy.

## Observações

- As florestas semanais e mensais só conseguem usar leituras registradas depois da criação do histórico diário.
- Arquivos em `tmp/` são apenas prévias locais e não devem ser versionados.
- Os assets em `assets/forest/` e `assets/readme/` devem permanecer versionados.
