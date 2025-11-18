# 🎥 Sentinel Safe

Sistema completo de monitoramento e gerenciamento de câmeras de segurança em tempo real, com interface moderna e recursos avançados de streaming.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Segurança](#segurança)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Sobre o Projeto

Sentinel Safe é uma plataforma completa de monitoramento de câmeras de segurança que permite aos usuários:
- Gerenciar múltiplas câmeras IP em uma interface centralizada
- Visualizar streams de vídeo em tempo real
- Receber notificações sobre mudanças de status das câmeras
- Organizar câmeras através de drag-and-drop
- Acessar diferentes tipos de protocolos de streaming (RTSP, MJPEG, HLS, DASH)
- Sistema de notificações em tempo real com histórico completo
- Interface moderna com tema claro/escuro

## ✨ Funcionalidades

### Gerenciamento de Câmeras
- ✅ **CRUD Completo** - Criar, visualizar, editar e excluir câmeras
- 🔄 **Drag & Drop** - Reorganize câmeras com interface intuitiva
- 🎨 **Interface Responsiva** - Design adaptável para desktop e mobile
- 🌓 **Modo Escuro/Claro** - Tema personalizável para melhor experiência visual
- 📝 **Validação Avançada** - Validação de URLs RTSP/HTTP em tempo real
- 🏷️ **Categorização** - Organize câmeras por localização e tipo

### Streaming de Vídeo
- 📹 **Múltiplos Protocolos** - Suporte para RTSP, MJPEG, HTTP, HLS e DASH
- ⚡ **Streaming em Tempo Real** - Visualização instantânea das câmeras
- 🔌 **WebSocket** - Atualizações de status em tempo real
- 🎬 **Player Integrado** - Reprodução otimizada de diferentes formatos
- 🖼️ **Múltiplas Visualizações** - Grade, lista e visualização individual
- 🔄 **Auto-reconexão** - Reconexão automática em caso de perda de conexão

### Segurança
- 🔐 **Autenticação JWT** - Sistema seguro de login e registro
- 🔒 **Criptografia AES-256** - Proteção das credenciais das câmeras
- 👤 **Controle de Acesso** - Cada usuário visualiza apenas suas câmeras
- 🛡️ **Middleware de Proteção** - Rotas protegidas com autenticação
- 🚫 **Rate Limiting** - Proteção contra brute force
- 🔍 **Sanitização XSS** - Proteção contra ataques XSS
- 🎯 **CSP Headers** - Content Security Policy configurada
- 🔑 **Helmet.js** - Headers de segurança hardened

### Monitoramento
- 📊 **Dashboard Centralizado** - Visão geral de todas as câmeras
- 🔔 **Notificações em Tempo Real** - Alertas sobre mudanças de status
- 📈 **Status das Câmeras** - Monitoramento online/offline automático
- ⏰ **Atualização Automática** - Verificação periódica do status
- 📜 **Histórico de Eventos** - Registro completo de todas as ações
- 🔍 **Filtros Avançados** - Filtre notificações por tipo e data
- 💾 **Persistência Local** - Notificações salvas no localStorage

### Sistema de Notificações
- 🎨 **4 Tipos de Notificações** - Success, Info, Warning, Error
- 🔔 **Badge de Contador** - Número de notificações não lidas
- 📱 **Painel Deslizante** - Interface moderna e intuitiva
- ⏱️ **Timestamps** - Data e hora de cada notificação
- 🗑️ **Gerenciamento** - Marcar como lida, apagar individual ou limpar tudo
- 🔊 **Notificações Toast** - Alertas visuais temporários
- 📊 **Estatísticas** - Total de notificações e não lidas

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web minimalista
- **MySQL** - Banco de dados relacional
- **WebSocket (ws)** - Comunicação em tempo real
- **JSON Web Token (JWT)** - Autenticação stateless
- **bcryptjs** - Hash de senhas
- **dotenv** - Gerenciamento de variáveis de ambiente
- **helmet** - Segurança de headers HTTP
- **xss** - Sanitização contra XSS
- **express-rate-limit** - Rate limiting
- **crypto** - Criptografia AES-256-CBC

### Frontend
- **React 18** - Biblioteca JavaScript para UI
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e dev server rápido
- **React Router** - Roteamento de páginas
- **Axios** - Cliente HTTP
- **Framer Motion** - Animações fluidas
- **Tailwind CSS** - Framework CSS utility-first
- **@dnd-kit** - Drag and drop
- **React Hot Toast** - Notificações toast
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   Frontend      │◄────────┤   Backend API   │◄────────┤   MySQL DB      │
│   (React)       │  HTTP   │   (Express)     │         │                 │
│                 │         │                 │         │                 │
└────────┬────────┘         └────────┬────────┘         └─────────────────┘
         │                           │
         │    WebSocket Connection   │
         │◄──────────────────────────┤
         │    (Real-time Updates)    │
         │                           ▼
         │                  ┌─────────────────┐
         │                  │  Notification   │
         │                  │    Service      │
         │                  └────────┬────────┘
         │                           │
         │                           ▼
         │                  ┌─────────────────┐
         │                  │  Stream Manager │
         │                  │   (RTSP/MJPEG)  │
         │                  └────────┬────────┘
         │                           │
         │                           ▼
         │                  ┌─────────────────┐
         └─────────────────►│   IP Cameras    │
                            │   (RTSP/HTTP)   │
                            └─────────────────┘
```

## 📦 Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [MySQL](https://www.mysql.com/) (versão 8 ou superior)
- [Git](https://git-scm.com/)
- Um editor de código (recomendado: [VS Code](https://code.visualstudio.com/))

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/sentinel-safe.git
cd sentinel-safe
```

### 2. Configure o Banco de Dados

```sql
-- Crie o banco de dados
CREATE DATABASE sentinel_safe;
USE sentinel_safe;

-- Tabela de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de câmeras
CREATE TABLE cameras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    streamType VARCHAR(20) DEFAULT 'rtsp',
    username VARCHAR(50),
    password VARCHAR(255),
    location VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'offline',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Instale as dependências do Backend

```bash
cd backend
npm install
```

### 4. Instale as dependências do Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuração

### Backend (.env)

Crie um arquivo `.env` na pasta `backend/` com as seguintes variáveis:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=sentinel_safe

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d

# Criptografia (32 caracteres para a chave, 16 para o IV)
CRYPTO_SECRET_KEY=sua_chave_de_criptografia_32_caracteres
CRYPTO_IV=seu_iv_de_16_caracteres

# RTSP Stream
RTSP_PORT_START=9999

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Login Protection
LOGIN_MAX_ATTEMPTS=5
LOGIN_LOCKOUT_DURATION=900000
```

### Frontend (ambiente de desenvolvimento)

O frontend está configurado para se conectar ao backend em `http://localhost:3000` por padrão.

Para modificar, edite `frontend/src/services/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

Crie um arquivo `.env` na pasta `frontend/` (opcional):

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## 🎮 Como Usar

### Iniciando o Backend

```bash
cd backend
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Iniciando o Frontend

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Primeiro Acesso

1. Acesse `http://localhost:5173`
2. Clique em **"Registrar"**
3. Crie sua conta com e-mail e senha
4. Faça login com suas credenciais
5. Adicione suas câmeras no menu **"Gerenciar Câmeras"**

### Adicionando uma Câmera

1. No menu lateral, clique em **"Gerenciar Câmeras"**
2. Clique em **"Adicionar Câmera"**
3. Preencha os dados:
   - **Nome**: Nome identificador da câmera
   - **URL RTSP/HTTP**: Endereço do stream (ex: `rtsp://192.168.1.100:554/stream`)
   - **Tipo de Stream**: Selecione o protocolo (RTSP, MJPEG, etc.)
   - **Usuário/Senha**: Credenciais da câmera (opcional)
   - **Localização**: Onde a câmera está instalada
   - **Descrição**: Informações adicionais
4. Clique em **"Salvar"**

### Visualizando Câmeras

1. Acesse o **Dashboard**
2. Clique em qualquer card de câmera para visualizar o stream
3. Use drag & drop para reorganizar as câmeras
4. O status (online/offline) é atualizado automaticamente

### Gerenciando Notificações

1. Clique no ícone de sino 🔔 no canto superior direito
2. Visualize todas as notificações no painel deslizante
3. Clique em uma notificação para marcá-la como lida
4. Use os botões para:
   - **Marcar todas como lidas** - Limpa o contador
   - **Limpar todas** - Remove todas as notificações
   - **Apagar individual** - Remove uma notificação específica

## 📁 Estrutura do Projeto

```
sentinel-safe/
├── backend/
│   ├── config/
│   │   └── db.js                    # Configuração do MySQL
│   ├── middleware/
│   │   ├── authMiddleware.js        # Middleware de autenticação JWT
│   │   └── rateLimiter.js           # Rate limiting configurado
│   ├── routes/
│   │   ├── auth.js                  # Rotas de autenticação
│   │   ├── cameras.js               # Rotas de câmeras
│   │   ├── streams.js               # Rotas de streaming
│   │   └── users.js                 # Rotas de usuários
│   ├── services/
│   │   ├── monitoringService.js     # Serviço de monitoramento
│   │   ├── streamManager.js         # Gerenciador de streams
│   │   └── notificationService.js   # Serviço de notificações
│   ├── utils/
│   │   ├── crypto.js                # Utilitários de criptografia
│   │   └── validators.js            # Validadores de entrada
│   ├── scripts/
│   │   └── encryptExistingCameraUrls.js
│   ├── app.js                       # Configuração do Express
│   ├── index.js                     # Entry point do servidor
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── cameras/
    │   │   │   ├── CameraCard.tsx
    │   │   │   ├── CameraForm.tsx
    │   │   │   ├── CameraFormModal.tsx
    │   │   │   ├── CameraGrid.tsx
    │   │   │   ├── CameraView.tsx
    │   │   │   └── StreamPlayer.tsx
    │   │   ├── common/
    │   │   │   ├── AnimatedPage.tsx
    │   │   │   ├── ConfirmationModal.tsx
    │   │   │   ├── Modal.tsx
    │   │   │   └── ThemeToggle.tsx
    │   │   ├── layout/
    │   │   │   ├── Layout.tsx
    │   │   │   ├── Navbar.tsx
    │   │   │   └── Sidebar.tsx
    │   │   └── notifications/
    │   │       ├── NotificationPanel.tsx    # Painel de notificações
    │   │       └── NotificationBadge.tsx    # Badge com contador
    │   ├── contexts/
    │   │   ├── AuthContext.tsx              # Contexto de autenticação
    │   │   ├── CameraContext.tsx            # Contexto de câmeras
    │   │   ├── NotificationContext.tsx      # Contexto de notificações
    │   │   └── ThemeContext.tsx             # Contexto de tema
    │   ├── pages/
    │   │   ├── CameraManagement.tsx         # Página de gerenciamento
    │   │   ├── Cameras.tsx
    │   │   ├── Dashboard.tsx                # Dashboard principal
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   └── Settings.tsx
    │   ├── services/
    │   │   ├── api.ts                       # Cliente Axios
    │   │   ├── cameras.ts                   # API de câmeras
    │   │   └── websocket.ts                 # Cliente WebSocket
    │   ├── types/
    │   │   ├── camera.ts                    # TypeScript types
    │   │   └── notification.ts              # Types de notificações
    │   ├── utils/
    │   │   └── storage.ts                   # LocalStorage helpers
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    └── package.json
```

## 🔌 API Endpoints

### Autenticação

```
POST   /api/auth/register    # Registrar novo usuário
POST   /api/auth/login       # Login de usuário
GET    /api/auth/me          # Obter dados do usuário autenticado
POST   /api/auth/logout      # Logout de usuário
```

### Câmeras

```
GET    /api/cameras          # Listar câmeras do usuário
POST   /api/cameras          # Criar nova câmera
GET    /api/cameras/:id      # Obter câmera específica
PUT    /api/cameras/:id      # Atualizar câmera
DELETE /api/cameras/:id      # Excluir câmera
PATCH  /api/cameras/reorder  # Reordenar câmeras
GET    /api/cameras/:id/status  # Verificar status da câmera
```

### Streams

```
GET    /api/streams/mjpeg/:id    # Stream MJPEG
GET    /api/streams/ws/:id       # WebSocket stream
GET    /api/streams/hls/:id      # Stream HLS
```

### WebSocket Events

```
connection                    # Conexão estabelecida
camera:status:update         # Atualização de status de câmera
camera:added                 # Nova câmera adicionada
camera:updated               # Câmera atualizada
camera:deleted               # Câmera removida
notification:new             # Nova notificação
```

### Exemplo de Request

**Criar Câmera:**

```bash
curl -X POST http://localhost:3000/api/cameras \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Câmera Frontal",
    "url": "rtsp://192.168.1.100:554/stream",
    "streamType": "rtsp",
    "location": "Entrada Principal",
    "description": "Câmera de monitoramento da entrada"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "senha123"
  }'
```

## 🔐 Segurança

### Autenticação
- ✅ Todas as rotas de câmeras requerem autenticação JWT
- ✅ Tokens expiram em 7 dias (configurável)
- ✅ Senhas são hashadas com bcrypt (10 rounds)
- ✅ Refresh token automático
- ✅ Logout seguro com invalidação de token

### Criptografia
- ✅ URLs das câmeras criptografadas com AES-256-CBC
- ✅ Credenciais sensíveis nunca expostas no frontend
- ✅ Chaves de criptografia em variáveis de ambiente
- ✅ IV único para cada criptografia

### Proteção de Dados
- ✅ Cada usuário acessa apenas suas próprias câmeras
- ✅ Validação de propriedade em todas as operações
- ✅ CORS configurado para origens específicas
- ✅ SQL Injection protection via prepared statements
- ✅ Input validation com sanitização

### Proteções Implementadas

#### Rate Limiting
- ✅ Limite global: 100 requisições por 15 minutos
- ✅ Login: 5 tentativas por 15 minutos
- ✅ Atraso progressivo em tentativas falhadas
- ✅ Bloqueio temporário após múltiplas falhas

#### Headers de Segurança (Helmet)
- ✅ Content Security Policy (CSP) configurada
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Strict-Transport-Security
- ✅ X-XSS-Protection

#### Proteção XSS
- ✅ Sanitização de inputs com biblioteca `xss`
- ✅ Validação de campos em câmeras
- ✅ Escape de caracteres especiais
- ✅ Content-Type enforcement

#### Proteção SQL Injection
- ✅ Prepared statements em todas as queries
- ✅ Validação de tipos de dados
- ✅ Sanitização de parâmetros
- ✅ ORM-like patterns

#### Token Hardening
- ✅ Verificação de prefixo Bearer
- ✅ Algoritmo explícito HS256
- ✅ Validação de estrutura do token
- ✅ Verificação de expiração

## 🚀 Performance

### Otimizações Implementadas
- ⚡ Lazy loading de componentes
- ⚡ Memoização com React.memo
- ⚡ Debounce em buscas e filtros
- ⚡ Virtual scrolling para listas grandes
- ⚡ Compressão de assets
- ⚡ Code splitting automático

### Monitoramento
- 📊 WebSocket para atualizações em tempo real
- 📊 Reconexão automática em falhas
- 📊 Heartbeat para manter conexões ativas
- 📊 Logs estruturados no backend

## 🧪 Testes

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Build para Produção

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contribuindo

Contribuições são sempre bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Guidelines
- Siga o padrão de código existente
- Adicione testes para novas funcionalidades
- Atualize a documentação
- Faça commits semânticos

## 📝 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👥 Autores

 Eduardo Gabriel Bezerra da Silva - 01753880
- GitHub: [@dedueardo](https://github.com/dedueardo)
- Email: dedue147@gmail.com

 Danie José dos Santos Júnior
- GitHub:  [@Redarsene2](https://github.com/Redarsene2)

 Bruno João da Silva

 Bruno Rafael Bezerra Filho

 Higor Manoel Gomes de Lima

## 📞 Contato

- GitHub: [@dedueardo](https://github.com/dedueardo)
- LinkedIn: [Seu LinkedIn]
- Email: seu-email@exemplo.com

## 🙏 Agradecimentos

- [Node.js](https://nodejs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Express](https://expressjs.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)


⭐ Se este projeto te ajudou, considere dar uma estrela!

💬 Sugestões e feedback são sempre bem-vindos!
