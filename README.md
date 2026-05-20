# Bulir - Desafio 1: API Plataforma de Reservas

Sistema de gestão de reservas construído com **NestJS**, **Prisma**, **PostgreSQL** e **JWT authentication**.

## Screenshots

### Documentação do Sweeger

![Dashboard Screenshot](./screenshot/image.png)

## Funcionalidades

- **Autenticação JWT** com papéis (CLIENT e PROVIDER)
- **Módulo de Usuários** com registro separado para clientes e prestadores
- **Módulo de Serviços** para gerenciamento de ofertas dos prestadores
- **Módulo de Reservas** com transações atômicas e reembolsos
- **Módulo de Carteira** com histórico de transações
- **Testes Unitários** com Jest (55+ testes)
- **CI/CD** com GitHub Actions

## Tech Stack

- **Runtime**: Node.js 18+ / 20+
- **Framework**: NestJS 10.0.0
- **Database**: PostgreSQL com Prisma ORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **CI**: GitHub Actions

## Instalação

### Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL rodando localmente
- npm ou yarn

### Setup Local

```bash
# Clonar repositório
git clone <repo-url>
cd Desafio-1

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais do PostgreSQL

# Executar migrações Prisma
npm run prisma:migrate

# Iniciar servidor em desenvolvimento
npm run start:dev
```

### Setup com Docker Compose

```bash
# Clonar repositório
git clone <repo-url>
cd Desafio-1

# Iniciar serviços (PostgreSQL + App)
docker-compose up -d

# Executar migrações (em outro terminal)
docker-compose exec app npm run prisma:migrate

# Aplicação rodando em http://localhost:3000
```

**Parar serviços**:
```bash
docker-compose down
```

## Disponível Scripts

```bash
# Build
npm run build

# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod

# Testes
npm test

# Cobertura de testes
npm test -- --coverage

# Lint
npm run lint

# Prisma
npm run prisma:generate   # Gerar cliente Prisma
npm run prisma:migrate    # Executar migrações
npm run prisma:studio     # Abrir Prisma Studio
```

## Estrutura do Projeto

```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   ├── guards/
│   └── utils/
├── modules/
│   ├── users/           # Autenticação e registro
│   ├── services/        # Gerenciamento de serviços
│   ├── bookings/        # Reservas e transações
│   ├── wallet/          # Histórico de transações
│   └── [module]/
│       ├── [module].controller.ts
│       ├── [module].service.ts
│       ├── [module].repository.ts
│       ├── [module].module.ts
│       ├── [module].service.spec.ts
│       └── dto/
└── prisma/
    └── prisma.service.ts

prisma/
├── schema.prisma        # Modelo de dados
└── migrations/          # Histórico de migrações
```

## Módulos

### 1. Users (Autenticação)
- Registro de clientes (sem NIF)
- Registro de prestadores (com NIF)
- Login com JWT
- Validação de saldo

**Endpoints**:
```
POST   /auth/register/client        # Registrar cliente
POST   /auth/register/provider      # Registrar prestador
POST   /auth/login                  # Login
```

### 2. Services (Gerenciamento)
- CRUD de serviços
- Apenas prestadores podem criar/editar
- Visualização pública

**Endpoints**:
```
POST   /services                    # Criar serviço (PROVIDER)
GET    /services                    # Listar todos
GET    /services/:id                # Obter um
PATCH  /services/:id                # Atualizar (PROVIDER)
DELETE /services/:id                # Deletar (PROVIDER)
GET    /services/my-services        # Meus serviços (PROVIDER)
```

### 3. Bookings (Reservas)
- Criação de reservas com transações atômicas
- Cancelamento com reembolso completo
- Visualização de histórico

**Endpoints**:
```
POST   /bookings                    # Criar reserva (CLIENT)
GET    /bookings/my-bookings        # Minhas reservas (CLIENT)
GET    /bookings/provider/bookings  # Reservas do prestador
GET    /bookings/:id                # Obter uma (owner/provider)
DELETE /bookings/:id                # Cancelar (CLIENT)
```

### 4. Wallet (Carteira)
- Saldo atual
- Histórico de transações
- Filtros por tipo (crédito/débito)

**Endpoints**:
```
GET    /wallet/balance              # Saldo atual
GET    /wallet/transactions         # Histórico completo
GET    /wallet/transactions/received # Créditos recebidos
GET    /wallet/transactions/sent    # Débitos realizados
```

## Autenticação

Todos os endpoints (exceto registro e login) requerem token JWT no header:

```
Authorization: Bearer <seu_token_jwt>
```

Obtenha o token fazendo login:
```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "sua_senha"
}
```

## Regras de Negócio

- **Clients**: Iniciam com saldo de 4000 KZ
- **Providers**: Iniciam com saldo de 0 KZ
- **Reserva**: Debita cliente, credita prestador (transação atômica)
- **Cancelamento**: Reembolso completo com reversão atômica
- **Data**: Agendamento não pode ser no passado

## Testes

Executar suite de testes:

```bash
npm test
```

Ver cobertura:

```bash
npm test -- --coverage
```

**Cobertura atual**: 55+ testes passando
- WalletService: 9 testes
- UsersService: 15 testes
- ServicesService: 12 testes
- BookingsService: 19 testes

## CI/CD

O projeto usa **GitHub Actions** para CI automático.

**Workflow**: `.github/workflows/ci.yml`
- Roda em: push para `main`/`develop` e PRs
- Node.js: 18.x e 20.x
- Etapas: Install → Test → Build → Lint

## Deployment

### Docker

```bash
# Build imagem
docker build -t plataforma-reservas:latest .

# Rodar container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  plataforma-reservas:latest
```

### Variáveis de Ambiente em Produção

```env
DATABASE_URL="postgresql://user:password@host:5432/db_name"
JWT_SECRET="chave_secreta_muito_segura"
JWT_EXPIRATION="24h"
NODE_ENV="production"
PORT=3000
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/plataforma_reservas"
JWT_SECRET="sua_chave_secreta_super_segura"
JWT_EXPIRATION="24h"
```

## API Documentation

Swagger docs disponível em: `http://localhost:3000/api`

### Testing com VS Code REST Client

Use a extensão [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) para VS Code.

Abra o arquivo `api-requests.http` e clique em "Send Request" para testar os endpoints.

**Instrções**:
1. Instale a extensão REST Client
2. Abra `api-requests.http`
3. Configure seu token JWT no header `Authorization: Bearer YOUR_TOKEN_HERE`
4. Clique em "Send Request" em cada endpoint

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

UNLICENSED

## Autor

Desenvolvido para o Desafio Bulir
