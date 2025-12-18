import React, { useState, useEffect } from 'react';
import { Calendar, Package, Eye, Search, Filter, Tag } from 'lucide-react';
import { Catalog, CatalogCategory } from '../types';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

interface CatalogListProps {
  onViewCatalog: (catalogId: string) => void;
}

interface Category {
  CategoriaID: string;
  Nombre: string;
  Descripcion: string;
}

const categoryColors: Record<string, string> = {
  moda: 'bg-pink-100 text-pink-700',
  tecnologia: 'bg-blue-100 text-blue-700',
  hogar: 'bg-green-100 text-green-700',
  deportes: 'bg-orange-100 text-orange-700',
  belleza: 'bg-purple-100 text-purple-700',
  juguetes: 'bg-yellow-100 text-yellow-700',
  alimentos: 'bg-red-100 text-red-700',
  otros: 'bg-gray-100 text-gray-700'
};

export function CatalogList({ onViewCatalog }: CatalogListProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar categorías y catálogos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setCatalogs([]);
        setCategories([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Obtener todas las categorías
        const categoriesData = await authService.getCategories();
        // console.log('Categorías obtenidas:', categoriesData);
        setCategories(categoriesData);

        // 2. Obtener catálogos de cada categoría
        const allCatalogs: any[] = [];
        for (const category of categoriesData) {
          try {
            const catalogsInCategory = await authService.getCatalogsByCategory(category.CategoriaID);
            
            // Agregar información de la categoría a cada catálogo
            const catalogsWithCategory = catalogsInCategory.map((cat: any) => ({
              ...cat,
              CategoryName: category.Nombre,
              CategoryID: category.CategoriaID
            }));
            
            allCatalogs.push(...catalogsWithCategory);
          } catch (error) {
            console.error(`Error al cargar catálogos de categoría ${category.CategoriaID}:`, error);
          }
        }

        // console.log('Catálogos obtenidos:', allCatalogs);

        // 3. Mapear al formato del componente
        const mappedCatalogs = allCatalogs.map((cat: any) => ({
          id: cat.CatalogoID,
          title: cat.Nombre,
          description: cat.Descripcion,
          category: 'otros' as CatalogCategory, // Mantener para compatibilidad
          categoryId: cat.CategoryID, // ID real de la categoría
          categoryName: cat.CategoryName, // Nombre real de la categoría
          createdAt: new Date().toISOString().split('T')[0],
          ownerId: '',
          ownerName: 'Sistema',
          status: 'active' as 'active' | 'inactive',
          productsCount: 0
        }));

        setCatalogs(mappedCatalogs);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setCatalogs([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);
  
  const activeCatalogs = catalogs.filter(c => c.status === 'active');
  
  const filteredCatalogs = activeCatalogs.filter(catalog => {
    const matchesSearch = 
      catalog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      catalog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      catalog.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategoryId === 'all' || catalog.categoryId === selectedCategoryId;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Obtener color basado en el nombre de la categoría
  const getCategoryColor = (categoryName: string) => {
    const key = categoryName.toLowerCase();
    return categoryColors[key] || categoryColors.otros;
  };

  // Encontrar la categoría seleccionada
  const selectedCategory = categories.find(cat => cat.CategoriaID === selectedCategoryId);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando catálogos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explorar Catálogos</h1>
          <p className="text-gray-600">
            Descubre nuestra colección de catálogos con productos seleccionados
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar catálogos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative sm:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.CategoriaID} value={category.CategoriaID}>
                    {category.Nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedCategoryId !== 'all' && selectedCategory && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtrando por:</span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getCategoryColor(selectedCategory.Nombre)}`}>
                <Tag className="w-3 h-3" />
                {selectedCategory.Nombre}
              </span>
              <button
                onClick={() => setSelectedCategoryId('all')}
                className="text-sm text-indigo-600 hover:text-indigo-700 underline"
              >
                Limpiar filtro
              </button>
            </div>
          )}
        </div>

        {filteredCatalogs.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron catálogos</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategoryId !== 'all' 
                ? 'Intenta con otros términos de búsqueda o filtros'
                : 'Aún no hay catálogos disponibles'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalogs.map((catalog) => (
              <div
                key={catalog.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 overflow-hidden group"
              >
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                  <Package className="w-20 h-20 text-indigo-600 opacity-50 group-hover:scale-110 transition" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{catalog.title}</h3>
                    {catalog.categoryName && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getCategoryColor(catalog.categoryName)}`}>
                        <Tag className="w-3 h-3" />
                        {catalog.categoryName}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {catalog.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(catalog.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{catalog.productsCount} productos</span>
                    </div>
                  </div>

                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Por: </span>
                    <span className="text-sm font-medium text-gray-900">{catalog.ownerName}</span>
                  </div>
                  
                  <button
                    onClick={() => onViewCatalog(catalog.id)}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Catálogo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}