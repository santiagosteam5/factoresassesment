from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
from sqlalchemy.ext.hybrid import hybrid_property
from flask_bcrypt import Bcrypt
import re


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
bcrypt = Bcrypt()


class Employee(db.Model):
    __tablename__ = 'employees'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    position = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False, unique=True)
    department = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    seed = Column(String(7), nullable=False)
    
    skills = relationship('Skill', back_populates='employee', cascade='all, delete-orphan')
    
    __table_args__ = (
        CheckConstraint('length(seed) = 7', name='check_seed_length'),
    )
    
    @hybrid_property
    def is_valid_email(self):
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(email_pattern, self.email) is not None
    
    def set_password(self, password):
        """Hash and set the user's password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Verify the provided password against the stored hash"""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert employee object to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'position': self.position,
            'email': self.email,
            'department': self.department,
            'seed': self.seed,
            'skills': [skill.to_dict() for skill in self.skills]
        }
    
    def __repr__(self):
        return f'<Employee {self.name} - {self.position}>'


class Skill(db.Model):
    __tablename__ = 'skills'
    
    id = Column(Integer, primary_key=True)
    skill_name = Column(String(100), nullable=False)
    skill_level = Column(Integer, nullable=False)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False)
    
    employee = relationship('Employee', back_populates='skills')
    
    __table_args__ = (
        CheckConstraint('skill_level >= 0 AND skill_level <= 100', name='check_skill_level_range'),
    )
    
    def to_dict(self):
        """Convert skill object to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'skill_name': self.skill_name,
            'skill_level': self.skill_level,
            'employee_id': self.employee_id
        }
    
    def __repr__(self):
        return f'<Skill {self.skill_name}: {self.skill_level}/100>'


def create_tables():
    db.create_all()


def drop_tables():
    db.drop_all()
