from flask import Blueprint, make_response, jsonify
from .controller import EmployeeController, SkillController


employee_bp = Blueprint('employee', __name__)
employee_controller = EmployeeController()
skill_controller = SkillController()


# Employee Routes
@employee_bp.route('/employees', methods=['POST'])
def create_employee():
    """Create a new employee.
    ---
    tags:
      - Employee API
    parameters:
      - in: body
        name: employee
        description: Employee data
        required: true
        schema:
          type: object
          required:
            - name
            - position
            - email
            - department
            - seed
            - password
          properties:
            name:
              type: string
              example: "John Doe"
            position:
              type: string
              example: "Software Engineer"
            email:
              type: string
              example: "john.doe@company.com"
            department:
              type: string
              example: "Engineering"
            seed:
              type: string
              example: "AB123CD"
            password:
              type: string
              example: "securepassword123"
              minLength: 6
            skills:
              type: array
              items:
                type: object
                properties:
                  skill_name:
                    type: string
                    example: "Python"
                  skill_level:
                    type: integer
                    minimum: 0
                    maximum: 100
                    example: 85
    responses:
      201:
        description: Employee created successfully
      400:
        description: Invalid input data
      409:
        description: Email already exists
    """
    result, status_code = employee_controller.create_employee()
    return make_response(jsonify(result), status_code)


@employee_bp.route('/employees', methods=['GET'])
def get_all_employees():
    """Get all employees with their skills.
    ---
    tags:
      - Employee API
    responses:
      200:
        description: List of all employees
        schema:
          type: object
          properties:
            employees:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  name:
                    type: string
                  position:
                    type: string
                  email:
                    type: string
                  department:
                    type: string
                  seed:
                    type: string
                  skills:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: integer
                        skill_name:
                          type: string
                        skill_level:
                          type: integer
                        employee_id:
                          type: integer
    """
    result, status_code = employee_controller.get_all_employees()
    return make_response(jsonify(result), status_code)


@employee_bp.route('/employees/<int:employee_id>', methods=['GET'])
def get_employee_by_id(employee_id):
    """Get a specific employee by ID.
    ---
    tags:
      - Employee API
    parameters:
      - name: employee_id
        in: path
        type: integer
        required: true
        description: Employee ID
    responses:
      200:
        description: Employee data
      404:
        description: Employee not found
    """
    result, status_code = employee_controller.get_employee_by_id(employee_id)
    return make_response(jsonify(result), status_code)


@employee_bp.route('/employees/by-email/<string:email>', methods=['GET'])
def get_employee_by_email(email):
    """Get a specific employee by email.
    ---
    tags:
      - Employee API
    parameters:
      - name: email
        in: path
        type: string
        required: true
        description: Employee email
    responses:
      200:
        description: Employee data
      404:
        description: Employee not found
    """
    result, status_code = employee_controller.get_employee_by_email(email)
    return make_response(jsonify(result), status_code)


@employee_bp.route('/employees/login', methods=['POST'])
def login_employee():
    """Authenticate an employee with email and password.
    ---
    tags:
      - Employee API
    parameters:
      - in: body
        name: credentials
        description: Login credentials
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: "john.doe@company.com"
            password:
              type: string
              example: "securepassword123"
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Login successful"
            employee:
              type: object
              properties:
                id:
                  type: integer
                name:
                  type: string
                position:
                  type: string
                email:
                  type: string
                department:
                  type: string
                seed:
                  type: string
      401:
        description: Invalid credentials
      400:
        description: Invalid input data
    """
    result, status_code = employee_controller.login_employee()
    return make_response(jsonify(result), status_code)


@employee_bp.route('/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    """Delete an employee and all their skills.
    ---
    tags:
      - Employee API
    parameters:
      - name: employee_id
        in: path
        type: integer
        required: true
        description: Employee ID
    responses:
      200:
        description: Employee deleted successfully
      404:
        description: Employee not found
    """
    result, status_code = employee_controller.delete_employee(employee_id)
    return make_response(jsonify(result), status_code)


# Skill Routes
@employee_bp.route('/employees/<int:employee_id>/skills', methods=['POST'])
def create_skill(employee_id):
    """Create a new skill for an employee.
    ---
    tags:
      - Skill API
    parameters:
      - name: employee_id
        in: path
        type: integer
        required: true
        description: Employee ID
      - in: body
        name: skill
        description: Skill data
        required: true
        schema:
          type: object
          required:
            - skill_name
            - skill_level
          properties:
            skill_name:
              type: string
              example: "JavaScript"
            skill_level:
              type: integer
              minimum: 0
              maximum: 100
              example: 75
    responses:
      201:
        description: Skill created successfully
      400:
        description: Invalid input data
      404:
        description: Employee not found
      409:
        description: Skill already exists for this employee
    """
    result, status_code = skill_controller.create_skill(employee_id)
    return make_response(jsonify(result), status_code)


@employee_bp.route('/employees/<int:employee_id>/skills', methods=['GET'])
def get_employee_skills(employee_id):
    """Get all skills for a specific employee.
    ---
    tags:
      - Skill API
    parameters:
      - name: employee_id
        in: path
        type: integer
        required: true
        description: Employee ID
    responses:
      200:
        description: List of employee skills
      404:
        description: Employee not found
    """
    result, status_code = skill_controller.get_employee_skills(employee_id)
    return make_response(jsonify(result), status_code)


@employee_bp.route('/skills/<int:skill_id>', methods=['PUT'])
def update_skill(skill_id):
    """Update a skill.
    ---
    tags:
      - Skill API
    parameters:
      - name: skill_id
        in: path
        type: integer
        required: true
        description: Skill ID
      - in: body
        name: skill
        description: Skill data to update
        schema:
          type: object
          properties:
            skill_name:
              type: string
              example: "Advanced Python"
            skill_level:
              type: integer
              minimum: 0
              maximum: 100
              example: 95
    responses:
      200:
        description: Skill updated successfully
      400:
        description: Invalid input data
      404:
        description: Skill not found
    """
    result, status_code = skill_controller.update_skill(skill_id)
    return make_response(jsonify(result), status_code)


@employee_bp.route('/skills/<int:skill_id>', methods=['DELETE'])
def delete_skill(skill_id):
    """Delete a skill.
    ---
    tags:
      - Skill API
    parameters:
      - name: skill_id
        in: path
        type: integer
        required: true
        description: Skill ID
    responses:
      200:
        description: Skill deleted successfully
      404:
        description: Skill not found
    """
    result, status_code = skill_controller.delete_skill(skill_id)
    return make_response(jsonify(result), status_code)