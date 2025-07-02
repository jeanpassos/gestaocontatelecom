# BACKLOG - Sistema Robo Manager

Este documento lista as tarefas pendentes e melhorias planejadas para o sistema de gerenciamento visual de robôs Playwright.

## Pendências Imediatas

### Integração com Microserviço
- [ ] Implementar integração com endpoints reais da API de robôs
- [ ] Substituir localStorage por armazenamento persistente via API
- [ ] Adaptar formato de envio de robôs para o esperado pelo backend
- [ ] Implementar autenticação para acesso à API

### Funcionalidades
- [ ] Completar mecanismo de execução real dos robôs via API
- [ ] Implementar visualização em tempo real da execução do robô
- [ ] Adicionar sistema de logs detalhados para cada execução
- [ ] Implementar sistema de tratamento de erros durante execução

### Testes
- [ ] Testar integração completa com o microserviço
- [ ] Validar funcionalidades em diferentes navegadores
- [ ] Realizar testes de usabilidade com usuários reais
- [ ] Validar desempenho com grandes conjuntos de dados

## Melhorias Futuras

### Interface
- [ ] Melhorar responsividade para dispositivos móveis
- [ ] Adicionar temas claro/escuro
- [ ] Implementar arrastar e soltar (drag-and-drop) para ordenação de ações
- [ ] Adicionar visualização de fluxo em formato de diagrama

### Funcionalidades Avançadas
- [ ] Sistema de agendamento de execuções
- [ ] Execução em lote de múltiplos robôs
- [ ] Variáveis de ambiente e parametrização avançada
- [ ] Condicionais e loops nos fluxos de ação
- [ ] Importação/exportação de robôs para compartilhamento

### Segurança e Administração
- [ ] Implementar sistema de usuários e permissões
- [ ] Adicionar logs de auditoria para ações administrativas
- [ ] Backup e restauração de configurações
- [ ] Limites e cotas por usuário/grupo
