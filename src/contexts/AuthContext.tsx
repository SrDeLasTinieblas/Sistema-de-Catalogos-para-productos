import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authService, AUTH_ERROR_EVENT } from '../services/authService';
import { authenticateUser, registerUser, emailExists } from '../data/mockUsers';

interface AuthContextType {
  user: User | null;
  currentMode: UserRole | null;
  showRegister: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  loginAsVisitor: () => void;
  logout: () => void;
  switchMode: (mode: UserRole) => void;
  setShowRegister: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentMode, setCurrentMode] = useState<UserRole | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Restaurar sesión al cargar la aplicación
  useEffect(() => {
    const verifyAndRestoreSession = async () => {
      const savedToken = authService.getToken();

      if (!savedToken) {
        console.log('No hay token guardado');
        return;
      }

      try {
        console.log('Verificando token guardado...');

        // Verificar el token con el servidor
        const userInfo = await authService.verifyToken();

        // Si la verificación es exitosa, restaurar la sesión
        setUser({
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          role: userInfo.role
        });
        setCurrentMode(userInfo.role);
        setToken(savedToken);

        console.log('Sesión restaurada exitosamente');
      } catch (error) {
        console.error('Error al verificar token:', error);
        // Si el token es inválido o ha expirado, limpiar la sesión
        authService.removeToken();
        setUser(null);
        setCurrentMode(null);
        setToken(null);
        console.log('Sesión eliminada - Por favor inicie sesión nuevamente');
      }
    };

    verifyAndRestoreSession();
  }, []);

  // Listener para manejar errores 401
  useEffect(() => {
    const handleAuthError = () => {
      console.log('Error 401 detectado - Cerrando sesión');
      logout();
    };

    window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);

    return () => {
      window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Usar la API real
      const response = await authService.login(email, password);

      // Guardar token
      authService.saveToken(response.token);
      setToken(response.token);

      // Log del token para debug
      console.log('=== JWT TOKEN GUARDADO ===');
      console.log('Token:', response.token);
      console.log('Guardado en localStorage con clave: authToken');
      console.log('User Info:', response.user);
      console.log('========================');

      // Establecer usuario
      if (response.user) {
        setUser(response.user);
        setCurrentMode(response.user.role);
      }
    } catch (error) {
      // Si falla la API, intentar con autenticación mock (fallback)
      console.warn('API login failed, trying mock authentication:', error);

      const authenticatedUser = authenticateUser(email, password);

      if (!authenticatedUser) {
        throw new Error('Email o contraseña incorrectos');
      }

      // Create user object without password
      const { password: _, ...userWithoutPassword } = authenticatedUser;
      setUser(userWithoutPassword as User);
      setCurrentMode(authenticatedUser.role);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      console.log('=== INICIANDO REGISTRO EN AUTH CONTEXT ===');
      console.log('Email:', email);
      console.log('Nombre:', name);
      console.log('Rol:', role);

      // Llamar al servicio de registro real (API)
      const response = await authService.register(email, password, name, role);

      // Guardar token (CRÍTICO)
      authService.saveToken(response.token);
      setToken(response.token);

      console.log('=== JWT TOKEN GUARDADO DESPUÉS DEL REGISTRO ===');
      console.log('Token:', response.token);
      console.log('Guardado en localStorage con clave: authToken');
      console.log('User Info:', response.user);
      console.log('=============================================');

      // Establecer usuario
      if (response.user) {
        setUser(response.user);
        setCurrentMode(response.user.role);
      }

      // Ocultar el formulario de registro
      setShowRegister(false);

      console.log('✅ Registro completado exitosamente');
    } catch (error: any) {
      console.error('❌ Error en el registro:', error);

      // Si falla la API, intentar con sistema mock (fallback)
      if (error.message.includes('email ya está registrado') || 
          error.message.includes('Este correo ya se encuentra registrado')) {
        throw error; // Re-lanzar el error si el email ya existe
      }

      console.warn('API register failed, trying mock registration:', error);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check if email already exists in mock
      if (emailExists(email)) {
        throw new Error('Este email ya está registrado');
      }

      // Register new user in mock
      const newUser = registerUser(email, password, name, role);
      
      // Create user object without password
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword as User);
      setCurrentMode(role);
      setShowRegister(false);
    }
  };

  const loginAsVisitor = () => {
    const visitorUser: User = {
      id: 'visitor-' + Math.random().toString(36).substr(2, 9),
      email: 'visitante@example.com',
      role: 'Visitante',
      name: 'Visitante'
    };

    setUser(visitorUser);
    setCurrentMode('Visitante');
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
    setCurrentMode(null);
    setToken(null);
  };

  const switchMode = (mode: UserRole) => {
    if (user) {
      // Check if user has access to this mode
      if (user.role === 'Propietario' || mode === 'Visitante') {
        setCurrentMode(mode);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      currentMode,
      showRegister,
      token,
      login,
      register,
      loginAsVisitor,
      logout,
      switchMode,
      setShowRegister
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}