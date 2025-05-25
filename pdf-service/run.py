import os
import sys
import subprocess
import time

def check_python_version():
    """Verifica se a versão do Python é compatível"""
    required_version = (3, 8)
    current_version = sys.version_info
    
    if current_version < required_version:
        print(f"Erro: Python {required_version[0]}.{required_version[1]} ou superior é necessário.")
        print(f"Versão atual: {current_version[0]}.{current_version[1]}")
        return False
    return True

def check_requirements():
    """Verifica se as dependências estão instaladas"""
    try:
        import flask
        import pdfplumber
        return True
    except ImportError:
        print("Dependências não instaladas. Instalando...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            return True
        except subprocess.CalledProcessError:
            print("Erro ao instalar dependências. Por favor, execute 'pip install -r requirements.txt' manualmente.")
            return False

def create_directories():
    """Cria diretórios necessários"""
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
        print("Pasta 'uploads' criada.")

def create_env_file():
    """Cria o arquivo .env se não existir"""
    if not os.path.exists(".env"):
        with open(".env", "w") as f:
            f.write("FLASK_ENV=development\n")
            f.write("PORT=5000\n")
            f.write("UPLOAD_FOLDER=uploads\n")
            f.write("LOG_LEVEL=INFO\n")
        print("Arquivo .env criado.")

def run_service():
    """Executa o serviço"""
    print("Iniciando o serviço de processamento de PDFs...")
    try:
        from app import app
        port = int(os.environ.get('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') == 'development')
    except Exception as e:
        print(f"Erro ao iniciar o serviço: {str(e)}")

if __name__ == "__main__":
    print("=== Microserviço de Processamento de PDFs de Faturas ===")
    
    if not check_python_version():
        sys.exit(1)
    
    create_directories()
    create_env_file()
    
    if not check_requirements():
        sys.exit(1)
    
    run_service()
