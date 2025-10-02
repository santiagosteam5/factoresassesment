from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from app.modules.main.route import main_bp
from app.modules.employee.route import employee_bp
from app.db.db import db, bcrypt


def initialize_route(app: Flask):
    with app.app_context():
        app.register_blueprint(main_bp, url_prefix='/api/v1/main')
        app.register_blueprint(employee_bp, url_prefix='/api/v1')


def initialize_db(app: Flask):
    with app.app_context():
        db.init_app(app)
        bcrypt.init_app(app)
        
        # Wait for database connection in Docker environment
        import time
        max_retries = 30
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Try to create tables
                db.create_all()
                print("Database tables created successfully!")
                break
            except Exception as e:
                retry_count += 1
                print(f"Database connection attempt {retry_count}/{max_retries} failed: {e}")
                if retry_count >= max_retries:
                    print("Failed to connect to database after all retries")
                    raise e
                time.sleep(2)  # Wait 2 seconds before retrying

def initialize_swagger(app: Flask):
    with app.app_context():
        swagger = Swagger(app)
        return swagger

def initialize_cors(app: Flask):
    """Initialize CORS to allow all origins for development"""
    CORS(app, 
         origins="*",  # Allow all origins
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Allow all methods
         allow_headers=["Content-Type", "Authorization"])  # Allow common headers