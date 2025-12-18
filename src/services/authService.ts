import { User, UserRole } from '../types';

// Usar variable de entorno o fallback a ngrok si no está configurada
const API_BASE_URL = "https://sistemacatalogos.somee.com/api";

// Evento para notificar cuando hay un error 401
export const AUTH_ERROR_EVENT = 'auth_error_401';

interface LoginResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Formato: email|password
      const data = `${email}|${password}`;

      const response = await fetch(
        `${API_BASE_URL}/Auth/Login?data=${encodeURIComponent(data)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Email o contraseña incorrectos');
      }

      const token = await response.text();

      // Decodificar el JWT para obtener información del usuario
      const userInfo = this.parseJWT(token);

      return {
        token,
        user: userInfo
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error('Email o contraseña incorrectos');
    }
  },

  

  async register(email: string, password: string, name: string, role: UserRole): Promise<LoginResponse> {
    try {
      // El identificador siempre es 1 para crear nuevo usuario
      // El SP siempre asigna RoleID = 2 (Visitante) automáticamente
      const identificador = '1';
      
      // Separar nombre en firstName y lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || 'Usuario';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Formato: identificador|email|password|firstName|lastName
      const data = `${identificador}|${email}|${password}|${firstName}|${lastName}`;

      // console.log('=== REGISTRO DE USUARIO ===');
      // console.log('URL:', `${API_BASE_URL}/Auth/RegisterUsuario?data=${encodeURIComponent(data)}`);
      // console.log('Email:', email);
      // console.log('Nombre:', firstName);
      // console.log('Apellido:', lastName);
      // console.log('Rol asignado: Visitante (RoleID: 2 - asignado por el SP)');
      // console.log('==========================');

      const response = await fetch(
        `${API_BASE_URL}/Auth/RegisterUsuario?data=${encodeURIComponent(data)}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', response.status, errorText);
        
        if (response.status === 400) {
          throw new Error('El email ya está registrado');
        }
        throw new Error('Error al registrar usuario');
      }

      const responseText = await response.text();
      // console.log('Respuesta del servidor:', responseText);

      // La respuesta viene en formato: ¯A|Mensaje
      const parts = responseText.split('¯');
      if (parts.length > 1) {
        const messagePart = parts[1];
        if (messagePart.startsWith('A|')) {
          const message = messagePart.substring(2).trim();
          // console.log('✅', message);
          
          // Si el registro fue exitoso, hacer login automático
          // console.log('Iniciando sesión automática...');
          const loginResponse = await this.login(email, password);
          
          return loginResponse;
        } else if (messagePart.startsWith('E|')) {
          const errorMessage = messagePart.substring(2).trim();
          throw new Error(errorMessage);
        }
      }

      throw new Error('Respuesta del servidor no válida');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  },
  

  parseJWT(token: string): { id: string; email: string; name: string; role: UserRole } {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);

      // Extraer información del payload del JWT
      // sub: email del usuario
      // http://schemas.microsoft.com/ws/2008/06/identity/claims/role: rol del usuario
      const email = payload.sub || payload.email || '';
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Visitante';

      return {
        id: payload.jti || payload.sub || 'unknown',
        email: email,
        name: email.split('@')[0] || 'Usuario', // Usar la parte antes del @ como nombre
        role: role as UserRole
      };
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return {
        id: 'unknown',
        email: '',
        name: 'Usuario',
        role: 'Visitante'
      };
    }
  },

  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  removeToken(): void {
    localStorage.removeItem('authToken');
  },

  isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      );

      // Verificar si el token ha expirado
      if (payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        return expirationDate > new Date();
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  // Crear un nuevo catálogo
  async createCatalog(title: string, description: string, category: string): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Formato: titulo|descripcion|categoria
      const data = `${title}|${description}|${category}`;

      // console.log('=== CREAR CATÁLOGO ===');
      // console.log('URL:', `${API_BASE_URL}/Catalogo/CreateCatalog?data=${encodeURIComponent(data)}`);
      // console.log('Data:', data);
      // console.log('Token:', token);
      // console.log('=====================');

      const response = await fetch(
        `${API_BASE_URL}/Catalogo/CreateCatalog?data=${encodeURIComponent(data)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al crear el catálogo');
      }

      const result = await response.json();
      // console.log('Respuesta del servidor:', result);
      return result;
    } catch (error) {
      console.error('Error al crear catálogo:', error);
      throw new Error('No se pudo crear el catálogo');
    }
  },

  // Crear un nuevo producto (usa id=0 para crear)
  async createProduct(catalogId: string, name: string, description: string, price: number, imageData: string): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Validar que la imagen no esté vacía
      if (!imageData || imageData.trim() === '') {
        throw new Error('La imagen es requerida');
      }

      // Normalizar la imagen (asegurar que tenga el formato correcto)
      let normalizedImage = imageData.trim();
      
      // Si es base64 sin prefijo, agregarlo
      if (!normalizedImage.startsWith('data:image/') && 
          !normalizedImage.startsWith('http://') && 
          !normalizedImage.startsWith('https://')) {
        
        // Detectar tipo de imagen
        let mimeType = 'image/jpeg';
        if (normalizedImage.startsWith('/9j/')) {
          mimeType = 'image/jpeg';
        } else if (normalizedImage.startsWith('iVBORw0KGgo')) {
          mimeType = 'image/png';
        } else if (normalizedImage.startsWith('R0lGOD')) {
          mimeType = 'image/gif';
        }
        
        normalizedImage = `data:${mimeType};base64,${normalizedImage}`;
      }

      // Formato: id|catalogId|nombre|descripcion|precio|imagen|estado
      // id=0 para crear nuevo producto, estado=1 para activo
      const data = `0|${catalogId}|${name}|${description}|${price}|${normalizedImage}|1`;

      // console.log('=== CREAR PRODUCTO ===');
      // console.log('CatalogId:', catalogId);
      // console.log('Nombre:', name);
      // console.log('Descripción:', description);
      // console.log('Precio:', price);
      // console.log('Tipo de imagen:', normalizedImage.startsWith('data:') ? 'Base64' : 'URL HTTP');
      // console.log('Tamaño de imagen:', normalizedImage.length, 'caracteres');
      // console.log('Token presente:', !!token);
      // console.log('=====================');

      const response = await fetch(
        `${API_BASE_URL}/Productos/CreateProductos?data=${encodeURIComponent(data)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        console.error('Token inválido o expirado (401)');
        this.removeToken();
        window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
        throw new Error('UNAUTHORIZED');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', response.status, response.statusText, errorText);
        throw new Error('Error al crear el producto');
      }

      const csvText = await response.text();
      // console.log('CSV recibido (primeros 500 chars):', csvText.substring(0, 500));

      // Separar el mensaje de éxito de los datos
      const parts = csvText.split('¯');
      let message = 'Producto creado exitosamente';
      
      if (parts.length > 1) {
        const messagePart = parts[1];
        if (messagePart.startsWith('A|')) {
          message = messagePart.substring(2).trim();
        } else if (messagePart.startsWith('E|')) {
          throw new Error(messagePart.substring(2).trim());
        }
      }

      // console.log('Mensaje:', message);
      return { message };
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  // Actualizar un producto existente
  async updateProduct(productId: string, catalogId: string, name: string, description: string, price: number, imageData: string, isActive: boolean = true): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Normalizar la imagen
      let normalizedImage = imageData.trim();
      
      if (!normalizedImage.startsWith('data:image/') && 
          !normalizedImage.startsWith('http://') && 
          !normalizedImage.startsWith('https://')) {
        
        let mimeType = 'image/jpeg';
        if (normalizedImage.startsWith('/9j/')) {
          mimeType = 'image/jpeg';
        } else if (normalizedImage.startsWith('iVBORw0KGgo')) {
          mimeType = 'image/png';
        }
        
        normalizedImage = `data:${mimeType};base64,${normalizedImage}`;
      }

      // Formato: id|catalogId|nombre|descripcion|precio|imagen|estado
      const estado = isActive ? '1' : '0';
      const data = `${productId}|${catalogId}|${name}|${description}|${price}|${normalizedImage}|${estado}`;

      // console.log('=== ACTUALIZAR PRODUCTO ===');
      // console.log('ProductId:', productId);
      // console.log('CatalogId:', catalogId);
      // console.log('Nombre:', name);
      // console.log('Estado:', estado);
      // console.log('Tipo de imagen:', normalizedImage.startsWith('data:') ? 'Base64' : 'URL HTTP');
      // console.log('==========================');

      const response = await fetch(
        `${API_BASE_URL}/Productos/CreateProductos?data=${encodeURIComponent(data)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
              'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        console.error('Token inválido o expirado (401)');
        this.removeToken();
        window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
        throw new Error('UNAUTHORIZED');
      }

      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }

      const csvText = await response.text();
      // console.log('CSV recibido (primeros 500 chars):', csvText.substring(0, 500));

      const parts = csvText.split('¯');
      let message = 'Producto actualizado exitosamente';
      
      if (parts.length > 1) {
        const messagePart = parts[1];
        if (messagePart.startsWith('A|')) {
          message = messagePart.substring(2).trim();
        } else if (messagePart.startsWith('E|')) {
          throw new Error(messagePart.substring(2).trim());
        }
      }

      // console.log('Mensaje:', message);
      return { message };
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  },

  // Eliminar producto
  async deleteProduct(productId: string, catalogId: string): Promise<{ message: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Formato: productId|catalogId
      const data = `${productId}|${catalogId}`;

      // console.log('=== ELIMINAR PRODUCTO ===');
      // console.log('URL:', `${API_BASE_URL}/Productos/DeleteProductos?data=${encodeURIComponent(data)}`);
      // console.log('ProductId:', productId);
      // console.log('CatalogId:', catalogId);
      // console.log('Token:', token);
      // console.log('========================');

      const response = await fetch(
        `${API_BASE_URL}/Productos/DeleteProductos?data=${encodeURIComponent(data)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        console.error('Token inválido o expirado (401)');
        this.removeToken();
        window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
        throw new Error('UNAUTHORIZED');
      }

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      const csvText = await response.text();
      // console.log('CSV recibido:', csvText);

      // Separar el mensaje de éxito de los datos
      const parts = csvText.split('¯A');
      const message = parts.length > 1 ? parts[1].replace('|', '').trim() : 'Producto eliminado exitosamente';

      // console.log('Mensaje:', message);
      return { message };
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  },

  // Parsear CSV personalizado del servidor
  parseCsvResponse(csvText: string): any[] {
    if (!csvText) return [];

    const lines = csvText.split('¬').filter(line => line.trim());
    if (lines.length < 3) return [];

    // Línea 0: nombres de columnas
    const headers = lines[0].split('|');

    // Línea 1: tamaños (no la usamos)
    // Línea 2: tipos (no la usamos)

    // Líneas 3+: datos
    const dataLines = lines.slice(3);

    return dataLines.map(line => {
      const values = line.split('|');
      const obj: any = {};

      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });

      return obj;
    });
  },

  // Obtener catálogos por categoría
  async getCatalogsByCategory(categoryId: string): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // console.log('=== OBTENER CATÁLOGOS POR CATEGORÍA ===');
      // console.log('URL:', `${API_BASE_URL}/Catalogo/ObtenerCatalogos?data=${categoryId}`);
      // console.log('CategoryId:', categoryId);
      // console.log('Token:', token);
      // console.log('=======================================');

      const response = await fetch(
        `${API_BASE_URL}/Catalogo/ObtenerCatalogos?data=${categoryId}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        console.error('Token inválido o expirado (401)');
        this.removeToken();
        window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
        throw new Error('UNAUTHORIZED');
      }

      if (!response.ok) {
        throw new Error('Error al obtener catálogos');
      }

      const csvText = await response.text();
      // console.log('CSV recibido:', csvText);

      const catalogs = this.parseCsvResponse(csvText);
      // console.log('Catálogos parseados:', catalogs);

      return catalogs;
    } catch (error) {
      console.error('Error al obtener catálogos:', error);
      throw error;
    }
  },

  // Obtener categorías (no requiere parámetro según el SP)
  async getCategories(): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // console.log('=== OBTENER CATEGORÍAS ===');
      // console.log('URL:', `${API_BASE_URL}/ObtenerCategorias?data=`);
      // console.log('Token:', token);
      // console.log('=========================');

      const response = await fetch(
        `${API_BASE_URL}/Categoria/ObtenerCategorias`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        console.error('Token inválido o expirado (401)');
        this.removeToken();
        window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
        throw new Error('UNAUTHORIZED');
      }

      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }

      const csvText = await response.text();
      // console.log('CSV recibido:', csvText);

      const categories = this.parseCsvResponse(csvText);
      // console.log('Categorías parseadas:', categories);

      return categories;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  // Obtener productos por catálogo
  async getProducts(catalogId: string): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // console.log('=== OBTENER PRODUCTOS ===');
      // console.log('URL:', `${API_BASE_URL}/Productos/ObtenerProductos?data=${catalogId}`);
      // console.log('CatalogId:', catalogId);
      // console.log('Token:', token);
      // console.log('========================');

      const response = await fetch(
        `${API_BASE_URL}/Productos/ObtenerProductos?data=${catalogId}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        console.error('Token inválido o expirado (401)');
        this.removeToken();
        window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
        throw new Error('UNAUTHORIZED');
      }

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      const csvText = await response.text();
      // console.log('CSV recibido:', csvText);

      const products = this.parseCsvResponse(csvText);
      // console.log('Productos parseados:', products);

      return products;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  // Verificar JWT al iniciar la app
  async verifyToken(): Promise<any> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token');
      }

      // console.log('=== VERIFICAR TOKEN AL INICIAR ===');
      // console.log('Token:', token);

      // Primero verificar si el token está expirado localmente
      if (!this.isTokenValid(token)) {
        console.error('Token expirado localmente');
        this.removeToken();
        throw new Error('UNAUTHORIZED');
      }

      // Intentar hacer una petición para verificar que el token funciona en el servidor
      // Usamos el endpoint de categorías como verificación
      const userInfo = this.parseJWT(token);

      const response = await fetch(
        `${API_BASE_URL}/Categoria/ObtenerCategorias?data=`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        console.error('Token inválido en el servidor (401)');
        this.removeToken();
        // Disparar evento para notificar al AuthContext
        window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
        throw new Error('UNAUTHORIZED');
      }

      if (!response.ok) {
        throw new Error('Error al verificar token');
      }

      // console.log('Token válido - Usuario autenticado:', userInfo);
      // console.log('==================================');
      return userInfo;
    } catch (error) {
      console.error('Error al verificar token:', error);
      this.removeToken();
      throw error;
    }
  },

  // Eliminar catálogo
  async deleteCatalog(catalogId: string): Promise<{ catalogs: any[], message: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // console.log('=== ELIMINAR CATÁLOGO ===');
      // console.log('URL:', `${API_BASE_URL}/Catalogo/DeleteCatalogos?data=${catalogId}`);
      // console.log('CatalogId:', catalogId);
      // console.log('Token:', token);
      // console.log('========================');

      const response = await fetch(
        `${API_BASE_URL}/Catalogo/DeleteCatalogos?data=${catalogId}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        console.error('Token inválido o expirado (401)');
        this.removeToken();
        window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
        throw new Error('UNAUTHORIZED');
      }

      if (!response.ok) {
        throw new Error('Error al eliminar el catálogo');
      }

      const csvText = await response.text();
      // console.log('CSV recibido:', csvText);

      // Separar el mensaje de éxito de los datos
      const parts = csvText.split('¯A');
      const message = parts.length > 1 ? parts[1].replace('|', '').trim() : 'Catálogo eliminado exitosamente';

      // Parsear los catálogos actualizados
      const catalogs = this.parseCsvResponse(parts[0]);
      // console.log('Catálogos actualizados:', catalogs);
      // console.log('Mensaje:', message);

      return { catalogs, message };
    } catch (error) {
      console.error('Error al eliminar catálogo:', error);
      throw error;
    }
  },

  // Crear o actualizar catálogo
  async updateCatalog(id: string, name: string, description: string, categoryId: string, isActive: boolean = true): Promise<{ catalogs: any[], message: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Formato: id|nombre|descripcion|categoriaId|estado (1=activo, 0=inactivo)
      const estadoActivo = isActive ? '1' : '0';
      const data = `${id}|${name}|${description}|${categoryId}|${estadoActivo}`;

      // console.log('=== CREAR/ACTUALIZAR CATÁLOGO ===');
      // console.log('URL:', `${API_BASE_URL}/Catalogo/CreateCatalogos?data=${encodeURIComponent(data)}`);
      // console.log('ID:', id);
      // console.log('Nombre:', name);
      // console.log('Descripción:', description);
      // console.log('CategoriaID:', categoryId);
      // console.log('Estado Activo:', estadoActivo);
      // console.log('Token:', token);
      // console.log('=================================');

      const response = await fetch(
        `${API_BASE_URL}/Catalogo/CreateCatalogos?data=${encodeURIComponent(data)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        console.error('Token inválido o expirado (401)');
        this.removeToken();
        window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
        throw new Error('UNAUTHORIZED');
      }

      if (!response.ok) {
        throw new Error('Error al actualizar el catálogo');
      }

      const csvText = await response.text();
      // console.log('CSV recibido:', csvText);

      // Separar el mensaje de éxito de los datos
      const parts = csvText.split('¯A');
      const message = parts.length > 1 ? parts[1].replace('|', '').trim() : 'Catálogo actualizado exitosamente';

      // Parsear los catálogos actualizados
      const catalogs = this.parseCsvResponse(parts[0]);
      // console.log('Catálogos actualizados:', catalogs);
      // console.log('Mensaje:', message);

      return { catalogs, message };
    } catch (error) {
      console.error('Error al actualizar catálogo:', error);
      throw error;
    }
  }
};
