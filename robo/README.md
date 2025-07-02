# Microserviço Robô com Playwright

Serviço de automação web com Playwright para mapeamento e coleta de dados de páginas web. Inclui uma interface visual para criação, gerenciamento e execução de robôs de automação.

## Funcionalidades

- 🚀 Automação de navegação web com Playwright
- 🔍 Mapeamento de elementos em páginas
- 📊 Extração de dados estruturados
- 📸 Captura de screenshots
- 🔄 Execução de fluxos de ações sequenciais
- 💾 Armazenamento de resultados em formato JSON
- 🖱️ Interface visual para marcação de elementos
- 🧩 Editor visual de fluxos de automação
- 📁 Gerenciamento de múltiplos robôs
- 🔄 Reutilização de blocos de ações

## Requisitos

- Node.js 14+
- NPM ou Yarn

## Instalação

1. Instale as dependências:

```bash
npm install
```

2. Instale os navegadores necessários para o Playwright:

```bash
npx playwright install chrome
```

## Uso

### API de Automação

Inicie o servidor da API:

```bash
npm start
```

O servidor da API estará rodando em `http://localhost:3030`.

### Interface Visual de Gerenciamento

Para usar a interface visual de criação e gerenciamento de robôs:

```bash
npx http-server public -p 3040
```

A interface estará disponível em `http://localhost:3040`.

> **Nota**: A interface visual está em fase de desenvolvimento e algumas funcionalidades podem estar em implementação.

## API Endpoints

### 1. Executar robô com fluxo de ações

**Endpoint:** `POST /api/robot/run`

**Corpo da requisição:**
```json
{
  "url": "https://www.example.com",
  "actions": [
    {
      "type": "click",
      "selector": ".button-class"
    },
    {
      "type": "fill",
      "selector": "input[name='search']",
      "value": "busca exemplo"
    },
    {
      "type": "extract",
      "name": "resultados",
      "selector": ".results-list .item",
      "multiple": true,
      "saveAs": "resultados_busca"
    }
  ],
  "options": {
    "headless": false,
    "slowMo": 50
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "url": "https://www.example.com",
  "actionsExecuted": 3,
  "results": {
    "resultados_busca": [
      "Item 1",
      "Item 2",
      "Item 3"
    ]
  },
  "screenshot": "/static/screenshots/final_result_1234567890.png",
  "resultFile": "/static/results/robot_execution_1234567890.json"
}
```

### 2. Mapear elementos de uma página

**Endpoint:** `POST /api/robot/map`

**Corpo da requisição:**
```json
{
  "url": "https://www.example.com",
  "selectors": [
    ".header",
    ".menu",
    ".content article",
    "form input"
  ],
  "options": {
    "headless": false
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "url": "https://www.example.com",
  "mappingResults": {
    ".header": {
      "count": 1,
      "elements": [
        {
          "tagName": "header",
          "id": "main-header",
          "className": "header",
          "text": "Exemplo de Header",
          "position": {
            "x": 0,
            "y": 0,
            "width": 1280,
            "height": 80
          },
          "attributes": [
            {
              "name": "id",
              "value": "main-header"
            },
            {
              "name": "class",
              "value": "header"
            }
          ]
        }
      ],
      "hasMore": false
    },
    // Outros resultados...
  },
  "screenshot": "/static/screenshots/mapping_1234567890.png",
  "resultFile": "/static/results/element_mapping_1234567890.json"
}
```

### 3. Extrair dados de uma página

**Endpoint:** `POST /api/robot/extract`

**Corpo da requisição:**
```json
{
  "url": "https://www.example.com",
  "extractions": [
    {
      "name": "titulo",
      "selector": "h1",
      "multiple": false
    },
    {
      "name": "links",
      "selector": "a",
      "attribute": "href",
      "multiple": true
    },
    {
      "name": "imagens",
      "selector": "img",
      "attribute": "src",
      "multiple": true
    }
  ],
  "options": {
    "headless": true
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "url": "https://www.example.com",
  "extractionResults": {
    "titulo": "Página de Exemplo",
    "links": [
      "https://www.example.com/link1",
      "https://www.example.com/link2"
    ],
    "imagens": [
      "https://www.example.com/image1.jpg",
      "https://www.example.com/image2.jpg"
    ]
  },
  "screenshot": "/static/screenshots/extraction_1234567890.png",
  "resultFile": "/static/results/data_extraction_1234567890.json"
}
```

### 4. Obter lista de resultados

**Endpoint:** `GET /api/robot/results`

**Resposta:**
```json
{
  "results": [
    {
      "name": "data_extraction_1234567890.json",
      "url": "/static/results/data_extraction_1234567890.json",
      "size": 1234,
      "created": "2025-07-01T12:34:56.789Z"
    }
  ]
}
```

### 5. Obter lista de screenshots

**Endpoint:** `GET /api/robot/screenshots`

**Resposta:**
```json
{
  "screenshots": [
    {
      "name": "extraction_1234567890.png",
      "url": "/static/screenshots/extraction_1234567890.png",
      "size": 12345,
      "created": "2025-07-01T12:34:56.789Z"
    }
  ]
}
```

## Tipos de Ações Disponíveis

| Tipo | Descrição | Parâmetros |
|------|-----------|------------|
| `navigate` | Navega para uma URL | `url` |
| `click` | Clica em um elemento | `selector` |
| `fill` | Preenche um campo | `selector`, `value` |
| `select` | Seleciona uma opção em dropdown | `selector`, `value` |
| `wait` | Aguarda um tempo em milissegundos | `milliseconds` |
| `waitForSelector` | Aguarda um seletor ficar disponível | `selector`, `state` (opcional), `timeout` (opcional) |
| `screenshot` | Tira um screenshot | `name` (opcional), `saveAs` (opcional) |
| `extract` | Extrai dados de um elemento | `name`, `selector`, `attribute` (opcional), `multiple` (opcional), `saveAs` (opcional) |

## Exemplo de Uso Prático

### Extrair dados de uma tabela de preços

```json
{
  "url": "https://www.example.com/precos",
  "actions": [
    {
      "type": "click",
      "selector": "#categoria-produtos"
    },
    {
      "type": "extract",
      "name": "produtos",
      "selector": "table tr",
      "multiple": true,
      "saveAs": "lista_produtos"
    }
  ]
}
```

### Fazer login em um sistema

```json
{
  "url": "https://www.sistema.com/login",
  "actions": [
    {
      "type": "fill",
      "selector": "#username",
      "value": "usuario@exemplo.com"
    },
    {
      "type": "fill",
      "selector": "#password",
      "value": "senha123"
    },
    {
      "type": "click",
      "selector": "#login-button"
    },
    {
      "type": "waitForSelector",
      "selector": ".dashboard",
      "state": "visible",
      "timeout": 5000
    },
    {
      "type": "screenshot",
      "name": "dashboard-logado"
    }
  ]
}
```

## Integração com outros Sistemas

O microserviço pode ser facilmente integrado com outros sistemas através de sua API REST. Para automações recorrentes, considere a utilização de tarefas agendadas que enviam requisições para os endpoints.

## Licença

Este projeto está sob licença MIT.
