import os
from dotenv import load_dotenv
from app.app import create_app

load_dotenv()

# Get environment configuration
config = os.getenv('FLASK_ENV', 'development')

# Use docker config when running in container
if os.getenv('DATABASE_URL') and 'postgresql' in os.getenv('DATABASE_URL', ''):
    config = 'docker'

app = create_app(config)

if __name__ == "__main__":
    # Always bind to 0.0.0.0 in Docker for external access
    port = int(os.getenv('PORT', 5000))
    
    if config == 'development' and not os.getenv('DATABASE_URL'):
        # Local development with SQLite
        app.run(debug=True, host='0.0.0.0', port=port)
    else:
        # Docker or production environment
        app.run(debug=False, host='0.0.0.0', port=port)
