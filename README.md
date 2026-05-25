# Desafio Backend naPorta

API REST para gerenciamento de pedidos, desenvolvida em NestJS para o desafio backend da naPorta.

## Tecnologias

- Node.js
- NestJS
- PostgreSQL
- Prisma
- JWT
- Docker
- Swagger
- ESLint
- Jest

## Funcionalidades

- Autenticação JWT com Bearer Token
- Criar pedido com itens
- Listar pedidos
- Buscar pedido por ID
- Filtrar pedidos por número, período e status
- Atualizar pedido
- Excluir pedido com exclusão lógica
- Gerar `orderNumber` automaticamente
- Seed com usuário e pedidos fictícios

## Pré-requisitos

- Node.js
- Docker
- npm

## Variáveis de ambiente

Copie o arquivo `.env.example` para `.env` ou crie um arquivo `.env` na raiz do projeto.

Para rodar a API localmente e apenas o banco no Docker, use `localhost` na `DATABASE_URL`:

```env
DATABASE_URL="postgresql://admin:admin@localhost:5432/db-naporta?schema=public"
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=db-naporta
POSTGRES_PORT=5432
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
PORT=3000
```

Para rodar banco e API dentro do Docker Compose, use o host `db` na `DATABASE_URL`:

```env
DATABASE_URL="postgresql://admin:admin@db:5432/db-naporta?schema=public"
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=db-naporta
POSTGRES_PORT=5432
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
PORT=3000
```

## Formas de execução

### A) Banco no Docker e API local

Nesta forma, a API roda na sua máquina e se conecta ao PostgreSQL exposto em `localhost`.

```bash
docker compose up -d db
npm install
npx prisma migrate dev
npx prisma generate
npx prisma db seed
npm run start:dev
```

### B) Banco e API com Docker Compose

Nesta forma, banco e API rodam em containers. A `DATABASE_URL` deve usar o host `db`.

```bash
docker compose up --build
```

## Swagger

A documentação da API fica disponível em:

```txt
http://localhost:3000/api
```

## Fluxo de teste no Swagger

1. Acesse:

```txt
http://localhost:3000/api
```

2. Execute `POST /auth/login`.
3. Copie o `access_token` retornado.
4. Clique em `Authorize`.
5. Cole o token no campo de autenticação.
6. Teste as rotas protegidas de pedidos.

## Usuário Seed

O seed cria um usuário administrador para testes:

```txt
email: admin@email.com
password: 123456
```

## Rotas Principais

```http
POST   /auth/login
POST   /orders
GET    /orders
GET    /orders/:id
PATCH  /orders/:id
DELETE /orders/:id
```

As rotas de pedidos exigem Bearer Token no header:

```http
Authorization: Bearer <token>
```

## Rotas auxiliares de itens

```http
POST   /orders/:orderId/items
PATCH  /orders/:orderId/items/:itemId
DELETE /orders/:orderId/items/:itemId
```

Essas rotas são auxiliares para manipular itens de um pedido já existente. O endpoint `POST /orders` também permite criar um pedido com itens na mesma requisição.

## Login

Exemplo de body para `POST /auth/login`:

```json
{
  "email": "admin@email.com",
  "password": "123456"
}
```

## Criar Pedido

O cliente não envia `orderNumber`. O backend gera automaticamente esse campo no padrão `PED-000001`, `PED-000002`, e assim por diante.

Exemplo de body para `POST /orders`:

```json
{
  "expectedDeliveryDate": "2026-06-01",
  "customerName": "João Silva",
  "customerDocument": "123.456.789-00",
  "deliveryAddress": "Rua das Flores, 100 - Campo Grande/MS",
  "status": "PENDING",
  "items": [
    {
      "description": "Notebook Dell Inspiron",
      "price": 3500
    },
    {
      "description": "Mouse sem fio",
      "price": 89.9
    }
  ]
}
```

## Filtros de Pedidos

Os filtros podem ser combinados para buscar pedidos por número, status e período de criação.

Exemplo:

```http
GET /orders?orderNumber=PED&status=PENDING&startDate=2026-01-01&endDate=2026-12-31
```

Filtros disponíveis:

- `orderNumber`
- `status`
- `startDate`
- `endDate`

## Exclusão Lógica

A rota `DELETE /orders/:id` preenche o campo `deletedAt` e não remove fisicamente o registro do banco.

Pedidos excluídos logicamente não aparecem em `GET /orders` e não são retornados em `GET /orders/:id`.

## Scripts úteis

```bash
npm run start:dev
npm run build
npm run lint
npm run test
npx prisma studio
npx prisma db seed
```
