from flask import request, jsonify
from app.db.db import db, Employee, Skill
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import re


class EmployeeController:
    """Controller for employee-related operations."""
    
    def create_employee(self):
        """Create a new employee."""
        try:
            data = request.get_json()
            
            required_fields = ['name', 'position', 'email', 'department', 'seed', 'password']
            for field in required_fields:
                if field not in data or not data[field]:
                    return {'error': f'Missing required field: {field}'}, 400
            
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, data['email']):
                return {'error': 'Invalid email format'}, 400
            
            if len(data['seed']) != 7:
                return {'error': 'Seed must be exactly 7 characters'}, 400
            
            if len(data['password']) < 6:
                return {'error': 'Password must be at least 6 characters'}, 400
            
            employee = Employee(
                name=data['name'],
                position=data['position'],
                email=data['email'],
                department=data['department'],
                seed=data['seed']
            )
            
            employee.set_password(data['password'])
            
            if 'skills' in data and isinstance(data['skills'], list):
                for skill_data in data['skills']:
                    if 'skill_name' in skill_data and 'skill_level' in skill_data:
                        skill_level = skill_data['skill_level']
                        if not isinstance(skill_level, int) or skill_level < 0 or skill_level > 100:
                            return {'error': 'Skill level must be an integer between 0 and 100'}, 400
                        
                        skill = Skill(
                            skill_name=skill_data['skill_name'],
                            skill_level=skill_level,
                            employee=employee
                        )
                        db.session.add(skill)
            
            db.session.add(employee)
            db.session.commit()
            
            return {'message': 'Employee created successfully', 'employee': employee.to_dict()}, 201
            
        except IntegrityError as e:
            db.session.rollback()
            if 'email' in str(e):
                return {'error': 'Email already exists'}, 409
            return {'error': 'Database integrity error'}, 400
        except Exception as e:
            db.session.rollback()
            return {'error': f'An error occurred: {str(e)}'}, 500
    
    def get_all_employees(self):
        """Get all employees with their skills."""
        try:
            employees = Employee.query.all()
            return {'employees': [emp.to_dict() for emp in employees]}, 200
        except Exception as e:
            return {'error': f'An error occurred: {str(e)}'}, 500
    
    def get_employee_by_id(self, employee_id):
        """Get a specific employee by ID."""
        try:
            employee = Employee.query.get(employee_id)
            if not employee:
                return {'error': 'Employee not found'}, 404
            
            return {'employee': employee.to_dict()}, 200
        except Exception as e:
            return {'error': f'An error occurred: {str(e)}'}, 500
    
    def get_employee_by_email(self, email):
        """Get a specific employee by email."""
        try:
            employee = Employee.query.filter_by(email=email).first()
            if not employee:
                return {'error': 'Employee not found'}, 404
            
            return {'employee': employee.to_dict()}, 200
        except Exception as e:
            return {'error': f'An error occurred: {str(e)}'}, 500
    
    def login_employee(self):
        """Authenticate employee with email and password"""
        try:
            data = request.get_json()
            
            required_fields = ['email', 'password']
            missing_fields = [field for field in required_fields if field not in data or not data[field]]
            
            if missing_fields:
                return {'error': f'Missing required fields: {", ".join(missing_fields)}'}, 400
            
            employee = Employee.query.filter_by(email=data['email']).first()
            if not employee:
                return {'error': 'Invalid email or password'}, 401
            
            if not employee.check_password(data['password']):
                return {'error': 'Invalid email or password'}, 401
            
            employee_data = employee.to_dict()
            return {
                'message': 'Login successful',
                'employee': employee_data
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    def delete_employee(self, employee_id):
        """Delete an employee and all their skills."""
        try:
            employee = Employee.query.get(employee_id)
            if not employee:
                return {'error': 'Employee not found'}, 404
            
            db.session.delete(employee)
            db.session.commit()
            
            return {'message': 'Employee deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': f'An error occurred: {str(e)}'}, 500


class SkillController:
    """Controller for skill-related operations."""
    
    def create_skill(self, employee_id):
        """Create a new skill for an employee."""
        try:
            employee = Employee.query.get(employee_id)
            if not employee:
                return {'error': 'Employee not found'}, 404
            
            data = request.get_json()
            
            if 'skill_name' not in data or 'skill_level' not in data:
                return {'error': 'Missing required fields: skill_name and skill_level'}, 400
            
            skill_level = data['skill_level']
            if not isinstance(skill_level, int) or skill_level < 0 or skill_level > 100:
                return {'error': 'Skill level must be an integer between 0 and 100'}, 400
            
            existing_skill = Skill.query.filter_by(
                employee_id=employee_id,
                skill_name=data['skill_name']
            ).first()
            
            if existing_skill:
                return {'error': 'Skill already exists for this employee'}, 409
            
            skill = Skill(
                skill_name=data['skill_name'],
                skill_level=skill_level,
                employee_id=employee_id
            )
            
            db.session.add(skill)
            db.session.commit()
            
            return {'message': 'Skill created successfully', 'skill': skill.to_dict()}, 201
            
        except Exception as e:
            db.session.rollback()
            return {'error': f'An error occurred: {str(e)}'}, 500
    
    def get_employee_skills(self, employee_id):
        """Get all skills for a specific employee."""
        try:
            employee = Employee.query.get(employee_id)
            if not employee:
                return {'error': 'Employee not found'}, 404
            
            skills = Skill.query.filter_by(employee_id=employee_id).all()
            return {'skills': [skill.to_dict() for skill in skills]}, 200
        except Exception as e:
            return {'error': f'An error occurred: {str(e)}'}, 500
    
    def update_skill(self, skill_id):
        """Update a skill."""
        try:
            skill = Skill.query.get(skill_id)
            if not skill:
                return {'error': 'Skill not found'}, 404
            
            data = request.get_json()
            
            if 'skill_name' in data:
                skill.skill_name = data['skill_name']
            
            if 'skill_level' in data:
                skill_level = data['skill_level']
                if not isinstance(skill_level, int) or skill_level < 0 or skill_level > 100:
                    return {'error': 'Skill level must be an integer between 0 and 100'}, 400
                skill.skill_level = skill_level
            
            db.session.commit()
            
            return {'message': 'Skill updated successfully', 'skill': skill.to_dict()}, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': f'An error occurred: {str(e)}'}, 500
    
    def delete_skill(self, skill_id):
        """Delete a skill."""
        try:
            skill = Skill.query.get(skill_id)
            if not skill:
                return {'error': 'Skill not found'}, 404
            
            db.session.delete(skill)
            db.session.commit()
            
            return {'message': 'Skill deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': f'An error occurred: {str(e)}'}, 500