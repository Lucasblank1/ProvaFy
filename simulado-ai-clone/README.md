# SimuladoAI (ProvaFy)

Gerador de simulados a partir de PDF ou texto, com histórico de resultados por usuário (login e senha).

## Requisitos

- Node.js 18+
- Chave da API Gemini (`GEMINI_API_KEY`)

## Configuração local

1. Entre na pasta do app:

```bash
cd simulado-ai-clone
```

2. Copie as variáveis de ambiente:

```bash
copy .env.example .env
```

Edite `.env` e defina `GEMINI_API_KEY` e, se quiser, `NEXTAUTH_SECRET`.

3. Instale dependências e crie o banco SQLite:

```bash
npm install
npm run db:migrate
```

4. Inicie o servidor:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Uso

1. **Cadastrar** em `/cadastro` ou **Entrar** em `/login`.
2. Gere e resolva um simulado na página inicial.
3. Ao finalizar, o resultado é salvo automaticamente (usuário logado).
4. Veja tudo em **Histórico** — clique em um simulado para revisar erros e explicações.

## Banco de dados

- SQLite em `prisma/dev.db` (arquivo local, ignorado pelo Git).
- Painel visual: `npm run db:studio`

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run db:migrate` | Aplicar migrations |
| `npm run db:studio` | Prisma Studio |
