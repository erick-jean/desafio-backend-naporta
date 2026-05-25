# Desafio Backend naPorta

API REST para gerenciamento de pedidos, desenvolvida em NestJS.

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
- Criar pedido
- Listar pedidos
- Filtrar pedidos por número, período e status
- Buscar pedido por ID
- Editar pedido
- Excluir pedido com exclusão lógica
- Seed com usuário e pedidos fictícios

## Pré-requisitos

- Node.js
- Docker
- npm

## Variáveis de ambiente

Copie o arquivo `.env.example` para `.env` ou crie um arquivo `.env` na raiz do projeto:

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

## Como Rodar

Instale as dependências:

```bash
npm install
```

Suba o banco com Docker:

```bash
docker compose up -d
```

Aplique as migrations:

```bash
npx prisma migrate dev
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Execute o seed:

```bash
npx prisma db seed
```

Inicie a aplicação em modo desenvolvimento:

```bash
npm run start:dev
```

## Swagger

A documentação da API fica disponível em:

```text
http://localhost:3000/api
```

## Usuário Seed

O seed cria um usuário administrador para testes:

```text
email: admin@email.com
password: 123456
```

## Rotas Principais

```text
POST   /auth/login
POST   /orders
GET    /orders
GET    /orders/:id
PATCH  /orders/:id
DELETE /orders/:id
```

As rotas de pedidos exigem Bearer Token no header:

```text
Authorization: Bearer <token>
```

## Rotas auxiliares de itens

```text
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

O campo `orderNumber` não deve ser enviado pelo cliente. Ele é gerado automaticamente pelo backend no formato `PED-000001`, `PED-000002`, e assim por diante, usando a sequence PostgreSQL `order_number_seq`.

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

Os filtros podem ser combinados:

```text
GET /orders?orderNumber=PED&status=PENDING&startDate=2026-01-01&endDate=2026-12-31
```

Filtros disponíveis:

- `orderNumber`
- `status`
- `startDate`
- `endDate`

## Exclusão Lógica

A rota `DELETE /orders/:id` não remove fisicamente o registro do banco.

Ela preenche o campo `deletedAt` com a data da exclusão. Pedidos excluídos logicamente não aparecem em `GET /orders` e não são retornados em `GET /orders/:id`.

## Scripts Úteis

```bash
npm run start:dev
npm run build
npm run lint
npm run test
npx prisma studio
npx prisma db seed
```
