export interface Skill {
  id: number;
  skill_name: string;
  skill_level: number;
  employee_id: number;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  department: string;
  seed: string;
  skills: Skill[];
}

export interface ApiResponse<T> {
  employee?: T;
  employees?: T[];
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL+'/api/v1';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getEmployeeByEmail(email: string): Promise<Employee> {
    const response = await this.request<ApiResponse<Employee>>(
      `/employees/by-email/${encodeURIComponent(email)}`
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (!response.employee) {
      throw new Error('Employee not found');
    }
    
    return response.employee;
  }

  async getAllEmployees(): Promise<Employee[]> {
    const response = await this.request<ApiResponse<Employee>>('/employees');
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.employees || [];
  }

  async createEmployee(employeeData: Omit<Employee, 'id' | 'skills'> & { skills?: Omit<Skill, 'id' | 'employee_id'>[] }): Promise<Employee> {
    const response = await this.request<ApiResponse<Employee>>('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (!response.employee) {
      throw new Error('Failed to create employee');
    }
    
    return response.employee;
  }

  async deleteEmployee(employeeId: number): Promise<void> {
    const response = await this.request<{ message?: string; error?: string }>(`/employees/${employeeId}`, {
      method: 'DELETE',
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
  }

  async createSkill(employeeId: number, skillData: { skill_name: string; skill_level: number }): Promise<Skill> {
    const response = await this.request<{ skill?: Skill; error?: string }>(`/employees/${employeeId}/skills`, {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (!response.skill) {
      throw new Error('Failed to create skill');
    }
    
    return response.skill;
  }

  async updateSkill(skillId: number, skillData: Partial<{ skill_name: string; skill_level: number }>): Promise<Skill> {
    const response = await this.request<{ skill?: Skill; error?: string }>(`/skills/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(skillData),
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (!response.skill) {
      throw new Error('Failed to update skill');
    }
    
    return response.skill;
  }

  async deleteSkill(skillId: number): Promise<void> {
    const response = await this.request<{ message?: string; error?: string }>(`/skills/${skillId}`, {
      method: 'DELETE',
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
  }
}

export const apiClient = new ApiClient();

export const getAvatarUrl = (seed: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
};