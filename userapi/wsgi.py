import os
from app.app import create_app

# Determine config based on environment
config = os.getenv('FLASK_ENV', 'production')

# Use docker config when DATABASE_URL points to PostgreSQL
if os.getenv('DATABASE_URL') and 'postgresql' in os.getenv('DATABASE_URL', ''):
    config = 'docker'

app = create_app(config)
