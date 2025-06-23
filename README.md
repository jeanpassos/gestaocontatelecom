# 📱 Sistema de Gestão de Contas de Telefonia
**Versão 0.78** | Sistema para controle e gerenciamento de contas telefônicas empresariais

![Versão](https://img.shields.io/badge/Versão-0.78-blue)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB)
![Backend](https://img.shields.io/badge/Backend-NestJS%20%2B%20TypeORM-E0234E)
![Banco](https://img.shields.io/badge/Banco-MariaDB-003545)

---

## 🎯 **Objetivo do Sistema**

Sistema completo para gerenciamento de contas de telefonia empresarial, permitindo:
- 🏢 **Gestão de Empresas**: Cadastro completo com informações corporativas
- 📞 **Controle de Linhas**: Monitoramento de linhas telefônicas e planos
- 📱 **Gestão de Aparelhos**: Controle de dispositivos móveis e atribuições
- 🌐 **Dados de Internet**: Configurações de rede e provedores
- 📄 **Processamento de Faturas**: Extração automática de dados de PDFs
- 👥 **Controle de Usuários**: Sistema de autenticação e permissões

---

## 🏗️ **Arquitetura do Sistema**

### **Microserviços Principais**

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   telefonia-frontend │    │  telefonia-backend  │    │    pdf-service      │
│                     │    │                     │    │                     │
│  React + TypeScript │◄───┤   NestJS + TypeORM  │◄───┤  Flask + pdfplumber │
│  Material-UI (MUI)  │    │      MariaDB        │    │      PyPDF2        │
│  Porta: 3000        │    │    Porta: 3001      │    │    Porta: 5000     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

---

## 🚀 **Início Rápido**

### **Pré-requisitos**
- **Node.js** >= 16.x
- **Python** >= 3.8
- **MariaDB** >= 10.6
- **npm** ou **yarn**

### **Instalação**

1. **Clone o repositório:**
```bash
git clone https://github.com/jeanpassos/contastelefonia.git
cd contastelefonia
```

2. **Configure o Backend:**
```bash
cd telefonia-backend
npm install
```

3. **Configure o Frontend:**
```bash
cd telefonia-frontend
npm install
```

4. **Configure o PDF Service:**
```bash
cd pdf-service
python -m venv .venv
.venv\Scripts\activate  # Windows
# ou
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### **Configuração do Banco de Dados**

1. **Crie o arquivo `.env` no `telefonia-backend`:**
```env
# Configuração do Banco de Dados
DB_HOST=201.91.93.55
DB_PORT=3306
DB_USERNAME=telefonia
DB_PASSWORD=ZHADyZKreJLjh6RM
DB_DATABASE=telefonia_db

# JWT Secret
JWT_SECRET=seu_jwt_secret_aqui

# Configuração da Aplicação
PORT=3001
NODE_ENV=development
```

2. **Execute as migrações:**
```bash
cd telefonia-backend
node scripts/run-mariadb-migrations-safe.js
```

### **Execução**

**Inicie todos os serviços simultaneamente:**

1. **Backend (Terminal 1):**
```bash
cd telefonia-backend
npm run start:dev
```

2. **Frontend (Terminal 2):**
```bash
cd telefonia-frontend
npm start
```

3. **PDF Service (Terminal 3):**
```bash
cd pdf-service
python app.py
```

**Sistema acessível em:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PDF Service: http://localhost:5000

---

## 📚 **Módulos e Funcionalidades**

### **📱 Frontend (React + TypeScript + MUI)**

#### **Páginas Principais:**
- **🏠 Dashboard**: Visão geral do sistema
- **🏢 Empresas**: CRUD completo de empresas
  - Informações básicas (CNPJ, razão social, etc.)
  - Endereço completo
  - Dados do gestor responsável
  - Configurações de internet e rede
  - Linhas telefônicas
  - Aparelhos móveis e atribuições
  - TV e outros serviços
- **👥 Usuários**: Gestão de usuários do sistema
- **📄 Faturas**: Upload e processamento de PDFs

#### **Componentes Reutilizáveis:**
- **CompaniesPage**: Tela principal de gestão de empresas
- **Modal de Detalhes**: Visualização completa da empresa
- **Modal de Edição**: Formulário de edição com validações
- **Cards de Informação**: Exibição organizada dos dados

#### **Tecnologias Utilizadas:**
```json
{
  "react": "^18.x",
  "typescript": "^4.x",
  "@mui/material": "^5.x",
  "@mui/icons-material": "^5.x",
  "axios": "^1.x",
  "react-router-dom": "^6.x",
  "react-webcam": "^7.x",
  "recharts": "^2.x",
  "notistack": "^3.x"
}
```

### **🔧 Backend (NestJS + TypeORM + MariaDB)**

#### **Módulos Principais:**

**🔐 Auth Module**
- JWT authentication
- Login/logout
- Proteção de rotas

**🏢 Companies Module**
- CRUD de empresas
- Relacionamentos com usuários
- Upload de dados JSON complexos
- Filtros e busca

**👥 Users Module**
- Gestão de usuários
- Relacionamento com empresas
- Controle de permissões

**📊 Providers Module**
- Gestão de operadoras
- Dados para formulários

#### **Entidades do Banco:**

**🏢 Company**
```typescript
{
  id: number;
  cnpj: string;
  corporateName: string;
  fantasyName: string;
  type: 'matriz' | 'filial';
  segmentId: number;
  contractDate: Date;
  renewalDate: Date;
  address: AddressData;
  manager: ManagerData;
  assets: AssetsData;
  phoneLines: string[];
  observation: string;
  // ... timestamps
}
```

**👤 User**
```typescript
{
  id: number;
  name: string;
  email: string;
  password: string;
  active: boolean;
  companyId?: number;
  // ... timestamps e relacionamentos
}
```

**🏷️ Segment**
```typescript
{
  id: number;
  name: string;
  description: string;
  // ... timestamps
}
```

**📡 Provider**
```typescript
{
  id: number;
  name: string;
  value: string;
  // ... timestamps
}
```

#### **APIs Disponíveis:**

```typescript
// Autenticação
POST /auth/login
POST /auth/logout

// Empresas
GET    /companies          // Listar com JOIN de segment
POST   /companies          // Criar nova empresa
GET    /companies/:id      // Buscar por ID
PUT    /companies/:id      // Atualizar empresa
DELETE /companies/:id      // Deletar empresa

// Usuários
GET    /users             // Listar usuários
POST   /users             // Criar usuário
PUT    /users/:id         // Atualizar usuário
DELETE /users/:id         // Deletar usuário

// Segmentos
GET    /segments          // Listar segmentos

// Provedores
GET    /providers         // Listar provedores
```

### **📄 PDF Service (Flask + Python)**

#### **Funcionalidades:**
- **📤 Upload de PDFs**: Recebimento de arquivos via API
- **🔍 Extração de Texto**: Usando pdfplumber e PyPDF2
- **🖼️ OCR**: Processamento de imagens com pytesseract
- **📊 Análise de Dados**: Extração de informações estruturadas

#### **Dependências:**
```python
flask==2.3.3
pdfplumber==0.9.0
PyPDF2==3.0.1
pytesseract==0.3.10
Pillow==10.0.0
```

---

## 🗄️ **Banco de Dados**

### **Estrutura MariaDB**

#### **Tabelas Principais:**

**📋 company**
```sql
CREATE TABLE company (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  corporate_name VARCHAR(255) NOT NULL,
  fantasy_name VARCHAR(255),
  type ENUM('matriz', 'filial') DEFAULT 'matriz',
  segment_id INT,
  contract_date DATE,
  renewal_date DATE,
  address JSON,
  manager JSON,
  assets JSON,
  phone_lines JSON,
  observation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (segment_id) REFERENCES segment(id)
);
```

**👤 user**
```sql
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  company_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES company(id)
);
```

### **Migrações Aplicadas:**
1. **001**: Schema inicial (users, companies)
2. **002**: Dados iniciais (admin user)
3. **003**: Atualização schema user
4. **004**: Criação tabela segment
5. **007**: Coluna active em user
6. **008**: Relacionamento segment em company
7. **009**: Campos adicionais em company
8. **010**: Criação tabela provider
9. **011**: Dados iniciais providers
10. **012**: Relacionamento provider em company
11. **013**: Criação tabela contract
12. **014**: Coluna phone_lines em company
13. **015**: Colunas contract_date e renewal_date

---

## 📱 **Fluxo de Uso**

### **1. Login no Sistema**
```
👤 Usuário → 🔐 Autenticação → 🏠 Dashboard
```

### **2. Cadastro de Empresa**
```
📝 Formulário → ✅ Validação → 💾 Persistência → 🔄 Atualização da Lista
```

### **3. Gestão de Linhas**
```
📞 Cadastro → 📱 Atribuição a Aparelhos → 👥 Vínculo com Usuários
```

### **4. Processamento de Faturas**
```
📄 Upload PDF → 🔍 Extração → 📊 Análise → 💾 Armazenamento
```

---

## 🧪 **Comandos de Desenvolvimento**

### **Backend**
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Testes
npm run test
npm run test:e2e

# Lint
npm run lint
```

### **Frontend**
```bash
# Desenvolvimento
npm start

# Build de produção
npm run build

# Testes
npm test

# Análise do bundle
npm run analyze
```

### **PDF Service**
```bash
# Desenvolvimento
python app.py

# Com debug
python app.py --debug

# Testes
python -m pytest tests/
```

---

## 🔧 **Configurações Importantes**

### **Variáveis de Ambiente**

**Backend (.env)**
```env
# Banco de Dados
DB_HOST=201.91.93.55
DB_PORT=3306
DB_USERNAME=telefonia
DB_PASSWORD=ZHADyZKreJLjh6RM
DB_DATABASE=telefonia_db

# Autenticação
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=24h

# Aplicação
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_PDF_SERVICE_URL=http://localhost:5000
```

---

## 📊 **Estado Atual (v0.78)**

### **✅ Funcionalidades Implementadas**
- ✅ Sistema de autenticação JWT
- ✅ CRUD completo de empresas
- ✅ Gestão de usuários
- ✅ Integração com MariaDB
- ✅ Interface responsiva (MUI)
- ✅ Upload e visualização de dados
- ✅ Relacionamentos entre entidades
- ✅ Validações de formulário
- ✅ Feedback visual (snackbars)
- ✅ Modais de edição e visualização
- ✅ Sistema de segmentos e provedores
- ✅ Gestão de linhas telefônicas
- ✅ Controle de aparelhos móveis
- ✅ Configurações de rede
- ✅ Dados de contratos
- ✅ Exibição da operadora do cliente

### **🚧 Em Desenvolvimento**
- 🚧 Dashboard com métricas
- 🚧 Relatórios avançados
- 🚧 Integração completa PDF Service
- 🚧 Sistema de notificações
- 🚧 Backup automatizado
- 🚧 Logs de auditoria

### **📋 Próximas Versões**
- 📋 Sistema de faturas
- 📋 Controle de custos
- 📋 API para integrações
- 📋 App mobile
- 📋 Relatórios em PDF
- 📋 Dashboard executivo

---

## 🐛 **Problemas Conhecidos**

### **Críticos (🔴)**
- Nenhum identificado

### **Menores (🟡)**
- Performance em listas muito grandes
- Validação de CNPJ poderia ser mais robusta
- Alguns warnings do TypeScript em desenvolvimento

---

## 🤝 **Contribuição**

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Código**
- **Frontend**: ESLint + Prettier
- **Backend**: ESLint + Prettier
- **Python**: PEP8 + Black

---

## 📞 **Suporte e Contato**

- **Desenvolvedor**: Jean Passos
- **GitHub**: [@jeanpassos](https://github.com/jeanpassos)
- **Repositório**: [contastelefonia](https://github.com/jeanpassos/contastelefonia)

---

## 📝 **Changelog**

### **v0.78 (2024-12-22)**
- ✅ Migração para MariaDB concluída
- ✅ Sistema de operadoras implementado
- ✅ Grid de operadora na visualização
- ✅ Correções de TypeScript
- ✅ Melhorias na interface

### **v0.75 (2024-12-20)**
- ✅ Implementação do sistema de segmentos
- ✅ Adição de campos de contrato
- ✅ Sistema de gestão de usuários

### **v0.70 (2024-12-15)**
- ✅ Base do sistema criada
- ✅ Autenticação implementada
- ✅ CRUD de empresas básico

---

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**🚀 Sistema em constante evolução - Versão 0.78 | Dezembro 2024**
