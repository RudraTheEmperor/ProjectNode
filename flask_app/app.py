from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-secret-key')
jwt = JWTManager(app)

# Configuração do banco de dados MySQL
db_user = os.getenv("MYSQL_USER", "appuser")
db_pass = os.getenv("MYSQL_PASSWORD", "apppass")
db_host = os.getenv("MYSQL_HOST", "mysql")  # nome do serviço no docker-compose
db_name = os.getenv("MYSQL_DATABASE", "appdb")

app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql://{db_user}:{db_pass}@{db_host}/{db_name}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Configuração do MongoDB
mongo_client = MongoClient("mongodb://root:rootpass@mongo:27017/")
mongo_db = mongo_client.appdb
mongo_collection = mongo_db.example_collection

# Modelo de exemplo
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

@app.route("/")
def hello():
    return jsonify({"message": "Flask está rodando com Docker!"})

@app.route("/users")
def get_users():
    users = User.query.all()
    return jsonify([{"id": u.id, "name": u.name} for u in users])

@app.route("/mongo-data")
def get_mongo_data():
    data = list(mongo_collection.find({}, {"_id": 0}))
    return jsonify(data)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')
    if not email or not password:
        return jsonify({'message': 'Email and password required'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 400
    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'message': 'Email and password required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials'}), 401
    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token}), 200

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({'message': f'Hello, {user.name}!'}), 200

if __name__ == "__main__":
    # Cria as tabelas no banco, caso não existam
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)