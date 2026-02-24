from flask import Flask, send_from_directory
import socket
import os

app = Flask(__name__)

# O segredo está aqui: apontar para a pasta 'src'
BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Se o arquivo não estiver na raiz de 'src', ele procura nas subpastas (assets, js, styles)
    return send_from_directory(BASE_DIR, path)

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == '__main__':
    ip_local = get_ip()
    porta = 5000
    print("\n" + "="*50)
    print("🚀 SERVIDOR NAIL JANAYNE ATUALIZADO!")
    print(f"📍 Pasta base: {BASE_DIR}")
    print(f"🔗 Local: http://localhost:{porta}")
    print(f"📱 Rede: http://{ip_local}:{porta}")
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=porta, debug=True)
