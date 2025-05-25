# Microserviço de Processamento de PDFs de Faturas

Este microserviço é responsável por extrair informações de faturas de telefonia em formato PDF.

## Funcionalidades

- Extração automática de dados de faturas das principais operadoras (Vivo, Claro, Tim, Oi)
- Detecção automática da operadora
- Extração de número da fatura, valor total, data de vencimento e detalhes de serviços
- API REST para integração com outros sistemas

## Requisitos

- Python 3.8 ou superior
- Bibliotecas listadas em `requirements.txt`
- Tesseract OCR (para reconhecimento de texto em imagens)

## Instalação

1. Clone este repositório
2. Crie um ambiente virtual Python:
   ```
   python -m venv venv
   ```
3. Ative o ambiente virtual:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```
     source venv/bin/activate
     ```
4. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```
5. Crie um arquivo `.env` baseado no `.env.example`
6. Crie a pasta `uploads` para armazenar os PDFs temporariamente

## Executando o serviço

```
python app.py
```

Por padrão, o serviço será executado na porta 5000.

## Endpoints da API

### Verificação de saúde

```
GET /health
```

Retorna o status do serviço.

### Processamento de PDF

```
POST /process
```

Parâmetros:
- `file`: Arquivo PDF da fatura (obrigatório)
- `provider`: Operadora (opcional, detectada automaticamente se não fornecida)

Retorna um JSON com os dados extraídos da fatura:
```json
{
  "invoiceNumber": "123456789",
  "amount": 149.90,
  "dueDate": "2025-06-15T00:00:00",
  "provider": "vivo",
  "invoiceDetails": {
    "services": [
      {
        "name": "Plano Controle",
        "amount": 89.90
      },
      {
        "name": "Serviços Adicionais",
        "amount": 29.90
      }
    ],
    "taxes": 30.10
  }
}
```

## Integração com o Backend NestJS

Para integrar este microserviço com o backend NestJS, você precisará atualizar o método `processPdf` no `InvoicesService` para fazer uma chamada HTTP para este microserviço em vez de usar a implementação mock.

Exemplo de integração:

```typescript
// No arquivo invoices.service.ts
import axios from 'axios';

// ...

async processPdf(pdfPath: string, provider?: string): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath));
    
    if (provider) {
      formData.append('provider', provider);
    }
    
    const response = await axios.post('http://localhost:5000/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    throw new Error('Falha ao processar o PDF da fatura');
  }
}
```

## Suporte a Novas Operadoras

Para adicionar suporte a uma nova operadora, edite o dicionário `PROVIDERS` no arquivo `app.py` e adicione os padrões de expressão regular para extrair as informações necessárias.
