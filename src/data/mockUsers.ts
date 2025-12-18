import { User, UserRole } from '../types';

export interface RegisteredUser extends User {
  password: string;
  availableRoles: UserRole[];
}

// Mock database of registered users
export const mockUsers: RegisteredUser[] = [
  {
    id: 'user-001',
    email: 'maria@business.com',
    password: 'demo123',
    name: 'María García',
    role: 'Propietario',
    availableRoles: ['Propietario', 'Visitante']
  },
  {
    id: 'user-002',
    email: 'juan@company.com',
    password: 'demo123',
    name: 'Juan Pérez',
    role: 'Propietario',
    availableRoles: ['Propietario', 'Visitante']
  },
  {
    id: 'user-003',
    email: 'ana@example.com',
    password: 'demo123',
    name: 'Ana Martínez',
    role: 'Visitante',
    availableRoles: ['Visitante']
  },
  {
    id: 'user-004',
    email: 'carlos@shop.com',
    password: 'demo123',
    name: 'Carlos López',
    role: 'Propietario',
    availableRoles: ['Propietario', 'Visitante']
  },
  {
    id: 'user-005',
    email: 'laura@mail.com',
    password: 'demo123',
    name: 'Laura Rodríguez',
    role: 'Visitante',
    availableRoles: ['Visitante']
  }
];

// Helper functions
export function findUserByEmail(email: string): RegisteredUser | undefined {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
}

export function authenticateUser(email: string, password: string): RegisteredUser | null {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

export function registerUser(
  email: string,
  password: string,
  name: string,
  role: UserRole
): RegisteredUser {
  const newUser: RegisteredUser = {
    id: 'user-' + Math.random().toString(36).substring(2, 11),
    email,
    password,
    name,
    role,
    availableRoles: role === 'Propietario' ? ['Propietario', 'Visitante'] : ['Visitante']
  };

  mockUsers.push(newUser);
  return newUser;
}

export function emailExists(email: string): boolean {
  return findUserByEmail(email) !== undefined;
}
