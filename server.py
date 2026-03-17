from flask import Flask, send_from_directory, request, jsonify
import os
import json
import base64
import uuid
from functools import wraps

app = Flask(__name__)

# HASH SHA256 da senha "kali"
TARGET_HASH = "fc5669b52ce4e283ad1d5d182de88ff9faec6672bace84ac2ce4c083f54fe2bc"

# ---------------- AUTH ----------------

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token ausente"}), 401

        token = auth_header.split(" ")[1]

        if token != TARGET_HASH:
            return jsonify({"error": "Token inválido"}), 401

        return f(*args, **kwargs)

    return decorated


# ---------------- PATHS ----------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "assets", "uploads")

DB_FILE = os.path.join(DATA_DIR, "db.json")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------- DB ----------------

def read_db():
    default_db = {
        "settings": {},
        "portfolio": [],
        "professionals": [],
        "reviews": [],
        "units": []
    }

    if not os.path.exists(DB_FILE):
        return default_db

    with open(DB_FILE, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)

            for k in default_db:
                if k not in data:
                    data[k] = default_db[k]

            return data
        except:
            return default_db


def write_db(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ---------------- FRONTEND ----------------

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(BASE_DIR, path)


# ---------------- API ----------------

@app.route("/api/data")
def get_data():
    return jsonify(read_db())


@app.route("/api/settings", methods=["POST"])
@require_auth
def update_settings():
    db = read_db()
    db["settings"] = request.json
    write_db(db)

    return jsonify({"status": "ok"})


@app.route("/api/portfolio", methods=["POST"])
@require_auth
def update_portfolio():
    db = read_db()
    db["portfolio"] = request.json
    write_db(db)

    return jsonify({"status": "ok"})


@app.route("/api/upload", methods=["POST"])
@require_auth
def upload_image():

    data = request.json

    if not data or "image" not in data:
        return jsonify({"error": "imagem ausente"}), 400

    base64_str = data["image"]

    if not base64_str.startswith("data:image"):
        return jsonify({"filepath": base64_str})

    header, encoded = base64_str.split(",", 1)

    ext = "png"

    if "webp" in header:
        ext = "webp"

    if "jpeg" in header or "jpg" in header:
        ext = "jpg"

    filename = f"{uuid.uuid4().hex}.{ext}"

    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(base64.b64decode(encoded))

    return jsonify({
        "filepath": f"/assets/uploads/{filename}"
    })


# ---------------- RUN ----------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
