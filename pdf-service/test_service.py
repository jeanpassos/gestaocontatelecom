import requests
import os
import sys
import json

def test_health():
    """Testa o endpoint de saúde do serviço"""
    try:
        response = requests.get('http://localhost:5000/health')
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Erro ao testar endpoint de saúde: {str(e)}")
        return False

def test_process_pdf(pdf_path, provider=None):
    """Testa o processamento de um PDF"""
    if not os.path.exists(pdf_path):
        print(f"Arquivo não encontrado: {pdf_path}")
        return False
    
    try:
        files = {'file': open(pdf_path, 'rb')}
        data = {}
        if provider:
            data['provider'] = provider
        
        response = requests.post('http://localhost:5000/process', files=files, data=data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return True
        else:
            print(f"Erro: {response.text}")
            return False
    except Exception as e:
        print(f"Erro ao processar PDF: {str(e)}")
        return False

if __name__ == "__main__":
    # Verificar se o serviço está rodando
    if not test_health():
        print("O serviço PDF não está respondendo. Verifique se ele está em execução.")
        sys.exit(1)
    
    # Testar processamento de PDF
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        provider = sys.argv[2] if len(sys.argv) > 2 else None
        
        print(f"Testando processamento do arquivo: {pdf_path}")
        test_process_pdf(pdf_path, provider)
    else:
        print("Uso: python test_service.py <caminho_do_pdf> [operadora]")
        print("Exemplo: python test_service.py ./samples/fatura_vivo.pdf vivo")
