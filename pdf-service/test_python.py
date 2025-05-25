# Script simples para testar se o Python está funcionando
import sys
import os

print("Teste de funcionamento do Python")
print(f"Versão do Python: {sys.version}")
print(f"Diretório atual: {os.getcwd()}")

try:
    import flask
    print("Flask está instalado!")
except ImportError:
    print("Flask não está instalado.")

try:
    import pdfplumber
    print("pdfplumber está instalado!")
except ImportError:
    print("pdfplumber não está instalado.")

print("Teste concluído!")
