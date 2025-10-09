# Documentação Auth Node API

## 🎯 Visão Geral

A API de autenticação é uma aplicação Node.js com TypeScript que fornece funcionalidades de autenticação usando AWS Cognito. A API inclui:

- **Registro e Login** de usuários
- **Confirmação de email** via código
- **Gestão de perfis** de usuário
- **Listagem de usuários** (admin)
- **Edição de conta**
- **Health check**

### Tecnologias Utilizadas

- **Framework**: Koa.js
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Autenticação**: AWS Cognito
- **Testes**: Jest + Supertest

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL
- AWS Cognito configurado
- Postman (para testes manuais)

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Local
NODE_ENV=localhost
DB_HOST=localhost

Production
# NODE_ENV=production
# DB_HOST=db

# Database
DB_PORT=5432
DB_USER=myuser
DB_PASSWORD=mypassword
DB_NAME=auth_database

# AWS Cognito
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=cognito-user-pool-id
COGNITO_CLIENT_ID=cognito-client-id
COGNITO_CLIENT_SECRET=cognito-client-secret

AWS_ACCESS_KEY_ID=aws-access-key-id
AWS_SECRET_ACCESS_KEY=aws-secret-access-key
```

### 3. Inicialização da aplicação e banco de dados

```bash
# Compilar e subir o projeto
docker-compose up
# ou
make up

# Inicializar o banco
docker-compose up db
# ou
make up-db

# Inicializar aplicação
docker-compose up app
# ou
make up-app
```

## 📮 Collection do Postman

### Importação da Collection

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo [`auth-node-api-with-flow.postman_collection.json`](./auth-node-api-with-flow.postman_collection.json)
4. A collection será importada com todas as requisições configuradas

### Variáveis da Collection

A collection já está configurada com as seguintes variáveis:

| Variável   | Descrição                                    |
| ---------- | -------------------------------------------- |
| `baseUrl`  | URL base da API                              |
| `email`    | Email para testes                            |
| `password` | Senha para testes                            |
| `name`     | Nome do usuário                              |
| `code`     | Código de confirmação enviado por email      |
| `role`     | Role do usuário (user/admin)                 |
| `token`    | Token de acesso (preenchido automaticamente) |

## 🔗 Endpoints da API

### 1. Health Check

**GET** `/health`

Verifica se a API está funcionando.

**Resposta:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Autenticação

**POST** `/auth`

Registra um novo usuário ou faz login de um usuário existente.

**Body:**

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "user"
}
```

**Resposta de Sucesso:**

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

### 3. Confirmação de Email

**POST** `/confirm`

Confirma o email do usuário usando o código enviado por email.

**Body:**

```json
{
  "email": "usuario@exemplo.com",
  "code": "123456"
}
```

**Resposta:**

```json
{
  "message": "Email confirmed successfully"
}
```

### 4. Perfil do Usuário

**GET** `/me`

Retorna informações do usuário autenticado.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Resposta:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "role": "user",
  "confirmed": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 5. Listar Usuários (Admin)

**GET** `/users`

Lista todos os usuários (apenas para administradores).

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `page`: Número da página (padrão: 1)
- `limit`: Limite de itens por página (padrão: 10)

**Resposta:**

```json
{
  "users": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário",
      "role": "user",
      "confirmed": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 6. Editar Conta

**PUT** `/edit-account`

Edita informações da conta do usuário autenticado.

**Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**

```json
{
  "email": "novoemail@exemplo.com",
  "name": "Novo Nome",
  "role": "admin"
}
```

**Resposta:**

```json
{
  "message": "Account updated successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "novoemail@exemplo.com",
    "name": "Novo Nome",
    "role": "admin",
    "confirmed": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🔄 Fluxo de Testes

### Cenário 1: Registro e Confirmação de Novo Usuário

1. **Health Check**
   - Execute `GET /health` para verificar se a API está funcionando

2. **Registro**
   - Execute `POST /auth` com dados de um novo usuário
   - Verifique se retorna tokens de acesso
   - **Nota**: O token será salvo automaticamente na variável `token`

3. **Confirmação de Email**
   - Verifique seu email para o código de confirmação
   - Execute `POST /confirm` com o código recebido
   - Verifique se a confirmação foi bem-sucedida

4. **Login**
   - Execute `POST /auth` novamente com as mesmas credenciais
   - Verifique se retorna os tokens de acesso

### Cenário 2: Teste de Autenticação e Autorização

1. **Login**
   - Execute `POST /auth` com credenciais válidas
   - O token será salvo automaticamente

2. **Acessar Perfil**
   - Execute `GET /me`
   - Verifique se retorna as informações do usuário

3. **Listar Usuários (Admin)**
   - Execute `GET /users`
   - **Nota**: Apenas usuários com role "admin" podem acessar

4. **Editar Conta**
   - Execute `PUT /edit-account`
   - Verifique se as alterações foram aplicadas

### Cenário 3: Teste de Erros

1. **Login com Credenciais Inválidas**
   - Execute `POST /auth` com email/senha incorretos
   - Verifique se retorna erro 401

2. **Acesso sem Token**
   - Execute `GET /me` sem o header Authorization
   - Verifique se retorna erro 401

3. **Confirmação com Código Inválido**
   - Execute `POST /confirm` com código incorreto
   - Verifique se retorna erro 400

## 🤖 Testes Automatizados

### Executar Todos os Testes

```bash
# Executar todos os testes
npm test

# Executar com coverage
npm run test:coverage

# Executar em modo watch
npm run test:watch
```

### Executar Testes Específicos

```bash
# Apenas testes unitários
npm run test:unit

# Apenas testes e2e
npm run test:e2e
```
