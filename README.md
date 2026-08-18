# AprendIA

Site de estudo que gera **resumos**, **flashcards** e **questões** a partir de um assunto. A geração é feita em tempo real pelo **agente do Cursor** (`@cursor/sdk`) — o mesmo tipo de agente do chat do Cursor, acionado pelo backend.

## O que tem

- Pacote completo, só resumo, só flashcards ou só questões
- Níveis iniciante, intermediário e avançado
- Streaming ao vivo do raciocínio e da resposta do agente
- Flashcards com virada, teclado e marcação de “eu sei”
- Quiz de múltipla escolha com explicação
- Histórico no navegador

## Como rodar

Requisito: Node.js 22.13 ou superior.

```bash
cp .env.example .env.local
```

Preencha `CURSOR_API_KEY` com uma chave de [Cursor Dashboard → API Keys](https://cursor.com/dashboard/api).

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Como a geração funciona

1. O navegador envia o assunto, o modo e o nível para `POST /api/generate`.
2. O servidor cria um agente local do Cursor no diretório isolado `.agent-workspace`.
3. O agente gera o material e entrega JSON estruturado pela ferramenta `deliver_study_content`.
4. A interface recebe os eventos em SSE e monta o resumo, os cards e o quiz.

Sem a chave do Cursor o site abre, mas a geração fica indisponível.
