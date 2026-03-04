from flask import Flask, send_from_directory, request, jsonify
import socket
import os
import json
import base64
import uuid
from werkzeug.utils import secure_filename
from io import BytesIO
from functools import wraps

app = Flask(__name__)

# CHAVE DE AUTENTICAÇÃO
# Hash SHA-256 da senha 'kali'
TARGET_HASH = "fc5669b52ce4e283ad1d5d182de88ff9faec6672bace84ac2ce4c083f54fe2bc"

# Decorator de segurança
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Acesso não autorizado. Tocken ausente."}), 401
        
        token = auth_header.split(' ')[1]
        if token != TARGET_HASH:
            return jsonify({"error": "Acesso não autorizado. Token inválido."}), 401
            
        return f(*args, **kwargs)
    return decorated

# Configurações de Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE_DIR, 'src')
DIST_DIR = os.path.join(BASE_DIR, 'dist')
DATA_DIR = os.path.join(BASE_DIR, 'data')
UPLOAD_DIR = os.path.join(SRC_DIR, 'assets', 'uploads')
DB_FILE = os.path.join(DATA_DIR, 'db.json')

# Garantir que as pastas existem
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Helper: Ler DB
def read_db():
    default_db = {"settings": {}, "portfolio": [], "professionals": [], "reviews": [], "units": []}
    if not os.path.exists(DB_FILE):
        return default_db
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            # Ensure all keys exist
            for k in default_db:
                if k not in data:
                    data[k] = default_db[k]
            return data
        except:
            return default_db

# Helper: Gravar DB
def write_db(data):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# --- ROTAS DE ARQUIVOS ESTÁTICOS ---

@app.route('/')
def index():
    return send_from_directory(SRC_DIR, 'index.html')

@app.route('/dist/<path:path>')
def serve_dist(path):
    return send_from_directory(DIST_DIR, path)

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(SRC_DIR, path)


# --- API REST BACKEND ---

@app.route('/api/data', methods=['GET'])
def get_data():
    """Retorna todo o estado do site (settings e portfolio)"""
    return jsonify(read_db())

@app.route('/api/settings', methods=['POST'])
@require_auth
def update_settings():
    """Atualiza as configurações globais de estilo e texto"""
    new_settings = request.json
    db = read_db()
    db['settings'] = new_settings
    write_db(db)
    return jsonify({"status": "success"})

@app.route('/api/portfolio', methods=['POST'])
@require_auth
def update_portfolio():
    """Atualiza todo o array de portfolio"""
    new_portfolio = request.json
    db = read_db()
    db['portfolio'] = new_portfolio
    write_db(db)
    return jsonify({"status": "success"})

@app.route('/api/professionals', methods=['POST'])
@require_auth
def update_professionals():
    """Atualiza todo o array de profissionais"""
    new_data = request.json
    db = read_db()
    db['professionals'] = new_data
    write_db(db)
    return jsonify({"status": "success"})

@app.route('/api/reviews', methods=['POST'])
@require_auth
def update_reviews():
    """Atualiza todo o array de depoimentos"""
    new_data = request.json
    db = read_db()
    db['reviews'] = new_data
    write_db(db)
    return jsonify({"status": "success"})

@app.route('/api/units', methods=['POST'])
@require_auth
def update_units():
    """Atualiza todo o array de unidades"""
    new_data = request.json
    db = read_db()
    db['units'] = new_data
    write_db(db)
    return jsonify({"status": "success"})

@app.route('/api/upload', methods=['POST'])
@require_auth
def upload_image():
    """Recebe uma string base64, salva fisicamente como WebP (ou JPEG) em assets/uploads e retorna a URL relativa."""
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"error": "No image data provided"}), 400
    
    base64_str = data['image']
    
    if not base64_str.startswith('data:image'):
        return jsonify({"filepath": base64_str}) # Já é uma URL física
        
    try:
        # Extrair header e conteúdo (ex: data:image/webp;base64,iVBORw0KGgo...)
        header, encoded = base64_str.split(",", 1)
        ext = "png"
        if "webp" in header:
            ext = "webp"
        elif "jpeg" in header or "jpg" in header:
            ext = "jpg"
            
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(encoded))
            
        # Retornar o link relativo que o front-end pode usar
        return jsonify({"filepath": f"assets/uploads/{filename}", "status": "success"})
    except Exception as e:
        print(f"Erro no upload: {e}")
        return jsonify({"error": str(e)}), 500

# --- INICIALIZAÇÃO ---

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
    print("🚀 SERVIDOR NAIL JANAYNE ATUALIZADO (BACKEND API ATIVO)!")
    print(f"📍 Pasta base: {SRC_DIR}")
    print(f"🗄️  Banco de dados: {DB_FILE}")
    print(f"📸 Pasta Uploads: {UPLOAD_DIR}")
    print(f"🔗 Local: http://localhost:{porta}")
    print(f"📱 Rede: http://{ip_local}:{porta}")
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=porta, debug=True)
