import os

class BaseConfig:
    """Base configuration."""
    DEBUG = False
    TESTING = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'secret-key')

class DevelopmentConfig(BaseConfig):
    """Development configuration."""
    DEBUG = True
    # Use SQLite for local development
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///development.db')

class TestingConfig(BaseConfig):
    """Testing configuration."""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///testing.db')

class ProductionConfig(BaseConfig):
    """Production configuration."""
    DEBUG = False
    # Use PostgreSQL for production (Docker)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://user:password@db:5432/employees')

class DockerConfig(BaseConfig):
    """Docker configuration."""
    DEBUG = True
    # Use PostgreSQL for Docker environment
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://user:password@db:5432/employees')


def get_config_by_name(config_name):
    """ Get config by name """
    if config_name == 'development':
        return DevelopmentConfig()
    elif config_name == 'production':
        return ProductionConfig()
    elif config_name == 'testing':
        return TestingConfig()
    elif config_name == 'docker':
        return DockerConfig()
    else:
        return DevelopmentConfig()
