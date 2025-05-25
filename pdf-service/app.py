from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pdfplumber
import json
import re
from datetime import datetime
import logging

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("pdf_service.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Pasta para armazenar os PDFs temporariamente
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Configurações para diferentes operadoras
PROVIDERS = {
    'vivo': {
        'invoice_number_pattern': r'Fatura\s+(\d+)',
        'amount_pattern': r'Total\s+a\s+pagar\s+R\$\s+([\d.,]+)',
        'due_date_pattern': r'Vencimento\s+(\d{2}/\d{2}/\d{4})',
    },
    'claro': {
        'invoice_number_pattern': r'Fatura\s+Nº\s+(\d+)',
        'amount_pattern': r'Valor\s+Total\s+R\$\s+([\d.,]+)',
        'due_date_pattern': r'Data\s+de\s+Vencimento\s+(\d{2}/\d{2}/\d{4})',
    },
    'tim': {
        'invoice_number_pattern': r'Número\s+da\s+Fatura:\s+(\d+)',
        'amount_pattern': r'Valor\s+a\s+pagar\s+R\$\s+([\d.,]+)',
        'due_date_pattern': r'Vencimento\s+(\d{2}/\d{2}/\d{4})',
    },
    'oi': {
        'invoice_number_pattern': r'Fatura\s+(\d+)',
        'amount_pattern': r'Total\s+R\$\s+([\d.,]+)',
        'due_date_pattern': r'Vencimento\s+(\d{2}/\d{2}/\d{4})',
    }
}

def extract_text_from_pdf(pdf_path):
    """Extrai todo o texto de um arquivo PDF"""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    except Exception as e:
        logger.error(f"Erro ao extrair texto do PDF: {str(e)}")
        return ""

def detect_provider(text):
    """Detecta a operadora com base no texto do PDF"""
    text = text.lower()
    if "vivo" in text:
        return "vivo"
    elif "claro" in text:
        return "claro"
    elif "tim" in text:
        return "tim"
    elif "oi" in text:
        return "oi"
    else:
        return "other"

def extract_invoice_data(text, provider):
    """Extrai dados da fatura com base na operadora detectada"""
    result = {
        "invoiceNumber": None,
        "amount": None,
        "dueDate": None,
        "provider": provider,
        "invoiceDetails": {
            "services": [],
            "taxes": 0
        }
    }
    
    # Se a operadora não for reconhecida, retorna dados vazios
    if provider == "other" or provider not in PROVIDERS:
        return result
    
    patterns = PROVIDERS[provider]
    
    # Extrair número da fatura
    invoice_match = re.search(patterns['invoice_number_pattern'], text, re.IGNORECASE)
    if invoice_match:
        result["invoiceNumber"] = invoice_match.group(1)
    
    # Extrair valor total
    amount_match = re.search(patterns['amount_pattern'], text, re.IGNORECASE)
    if amount_match:
        # Converter valor para float
        amount_str = amount_match.group(1).replace(".", "").replace(",", ".")
        try:
            result["amount"] = float(amount_str)
        except ValueError:
            logger.error(f"Erro ao converter valor: {amount_str}")
    
    # Extrair data de vencimento
    due_date_match = re.search(patterns['due_date_pattern'], text, re.IGNORECASE)
    if due_date_match:
        # Converter data para formato ISO
        try:
            due_date = datetime.strptime(due_date_match.group(1), "%d/%m/%Y")
            result["dueDate"] = due_date.isoformat()
        except ValueError:
            logger.error(f"Erro ao converter data: {due_date_match.group(1)}")
    
    # Extrair detalhes específicos por operadora
    if provider == "vivo":
        # Exemplo de extração de serviços para Vivo
        services_section = re.search(r"Detalhamento dos Serviços(.*?)Total", text, re.DOTALL | re.IGNORECASE)
        if services_section:
            services_text = services_section.group(1)
            services = re.findall(r"([A-Za-z\s]+)\s+R\$\s+([\d.,]+)", services_text)
            for service in services:
                try:
                    service_name = service[0].strip()
                    service_amount = float(service[1].replace(".", "").replace(",", "."))
                    result["invoiceDetails"]["services"].append({
                        "name": service_name,
                        "amount": service_amount
                    })
                except (ValueError, IndexError):
                    continue
    
    # Extrair impostos
    taxes_match = re.search(r"Impostos\s+R\$\s+([\d.,]+)", text, re.IGNORECASE)
    if taxes_match:
        try:
            result["invoiceDetails"]["taxes"] = float(taxes_match.group(1).replace(".", "").replace(",", "."))
        except ValueError:
            pass
    
    return result

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint para verificar se o serviço está funcionando"""
    return jsonify({"status": "ok", "message": "PDF Service is running"})

@app.route('/process', methods=['POST'])
def process_pdf():
    """Endpoint para processar um arquivo PDF de fatura"""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Parâmetro opcional para forçar uma operadora específica
    forced_provider = request.form.get('provider', None)
    
    try:
        # Salvar o arquivo temporariamente
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        # Extrair texto do PDF
        text = extract_text_from_pdf(file_path)
        
        # Detectar operadora ou usar a forçada
        provider = forced_provider if forced_provider else detect_provider(text)
        
        # Extrair dados da fatura
        invoice_data = extract_invoice_data(text, provider)
        
        # Adicionar informações de debug em ambiente de desenvolvimento
        if os.environ.get('FLASK_ENV') == 'development':
            invoice_data["_debug"] = {
                "text_sample": text[:500] + "..." if len(text) > 500 else text,
                "detected_provider": provider
            }
        
        # Remover o arquivo temporário
        os.remove(file_path)
        
        return jsonify(invoice_data)
    
    except Exception as e:
        logger.error(f"Erro ao processar PDF: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') == 'development')
