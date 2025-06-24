# 📋 Changelog - Sistema Contas de Telefonia

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

---

## [0.79.0] - 2025-06-23

### ✨ Novas Funcionalidades

#### 🕒 **Exibição Dinâmica de Contratos Vencidos**
- **Contratos vencidos** agora mostram **"Vencido há X dias"** em tempo real
- **Cálculo automático** de dias em atraso baseado na data de renovação
- **Atualização dinâmica** a cada minuto para manter informações precisas
- **Interface visual melhorada** com chips coloridos indicando status

#### 📞 **Exibição de Operadora na Tabela**
- **Coluna "Operadora"** agora exibe corretamente o nome da operadora
- **Fallback inteligente**: Prioriza `telephonyProvider.name` e usa `assets.internet.provider` como backup
- **Capitalização automática** dos nomes das operadoras
- **Chips estilizados** com ícone de telefone e hover effects

### 🔧 Melhorias Técnicas

#### 🗄️ **Backend & Banco de Dados**
- **Migrações MariaDB** para suporte a alocações de telefone
- **Scripts de teste** para validação de dados (`test-company-provider.js`, `test-assets-parsing.js`)
- **Otimização de queries** para melhor performance
- **Correções na entidade Company** para relação `telephonyProvider`

#### 🎨 **Frontend & UX**
- **Função `calculateRenewalTime`** otimizada para cálculos de tempo
- **Interface responsiva** com melhor feedback visual
- **Componentes React** otimizados para performance
- **Tratamento de erros** melhorado nas requisições

### 📊 Dados Suportados

#### 🏢 **Empresas Testadas**
- **SINTRAPAV-SC**: Operadora Claro detectada e exibida
- **GRUPO DE TECNOLOGIA JM LTDA**: Operadora Claro com dados completos
- **Assets.internet.provider**: Suporte completo para dados existentes

#### 📋 **Campos Funcionais**
- ✅ Nome da empresa
- ✅ CNPJ
- ✅ Operadora de telefonia
- ✅ Status do contrato
- ✅ Dias de vencimento
- ✅ Dados de rede (IP, DNS, Gateway)

### 🐛 Correções

#### 🔗 **Conectividade**
- **Network Error** identificado entre frontend e backend
- **Configuração de portas** validada (Frontend: 3001, Backend: 3000)
- **CORS e proxy** configurados corretamente

#### 📱 **Responsividade**
- **Tabela de empresas** otimizada para diferentes resoluções
- **Modal de detalhes** com layout responsivo
- **Chips e botões** com tamanhos adequados

### 🛠️ Arquivos Modificados

```
Frontend:
- telefonia-frontend/src/pages/Companies/CompaniesPage.tsx
- telefonia-frontend/package.json (versão 0.79.0)

Backend:
- telefonia-backend/core/src/companies/dto/create-company.dto.ts
- telefonia-backend/core/migrations/016-add-phone-allocations-mariadb.sql

Scripts e Testes:
- telefonia-backend/core/test-company-provider.js
- telefonia-backend/core/test-assets-parsing.js
- telefonia-backend/core/run-migration-016.js
- telefonia-backend/core/debug-phone-allocations.js
```

### 📈 Performance

- **Tempo de carregamento** da tabela otimizado
- **Cálculos em tempo real** sem impacto na performance
- **Renderização eficiente** dos componentes React
- **Queries de banco** otimizadas

### 🎯 Próximas Melhorias

- [ ] Resolver erro de conexão frontend ↔ backend
- [ ] Implementar filtros avançados na tabela
- [ ] Adicionar notificações para contratos próximos ao vencimento
- [ ] Dashboard analítico com gráficos de contratos

---

## [0.1.0] - 2025-06-21

### ✨ Versão Inicial
- Sistema base de gestão de contas de telefonia
- Cadastro de empresas e usuários
- Interface React com Material-UI
- Backend NestJS com TypeORM
- Banco de dados MariaDB

---

**🚀 Commit Hash:** `4d19155`  
**👨‍💻 Desenvolvido por:** Jean Passos  
**📅 Data de Release:** 23 de Junho de 2025
