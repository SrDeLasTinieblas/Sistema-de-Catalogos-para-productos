import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, EyeOff, Calendar, Package, MoreVertical, Tag, Plus } from 'lucide-react';
import { Catalog, CatalogCategory } from '../types';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

interface ManageCatalogsProps {
  onViewCatalog: (catalogId: string) => void;
  onCreateCatalog: () => void;
}

export function ManageCatalogs({ onViewCatalog, onCreateCatalog }: ManageCatalogsProps) {
  const { user } = useAuth();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [catalogCategoryMap, setCatalogCategoryMap] = useState<Map<string, string>>(new Map());
  const [categoryNameMap, setCategoryNameMap] = useState<Map<string, string>>(new Map());

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const loadCatalogs = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // 1. Obtener todas las categorías
        const categoriesData = await authService.getCategories();
        console.log('Categorías obtenidas:', categoriesData);

        // Guardar categorías para el select de edición
        const mappedCategories = categoriesData.map((cat: any) => ({
          id: cat.CategoriaID,
          name: cat.Nombre
        }));
        setCategories(mappedCategories);

        // Crear mapa de ID -> Nombre de categoría
        const nameMap = new Map<string, string>();
        categoriesData.forEach((cat: any) => {
          nameMap.set(cat.CategoriaID, cat.Nombre);
        });
        setCategoryNameMap(nameMap);

        // 2. Obtener catálogos de cada categoría
        const allCatalogs: any[] = [];
        const categoryMap = new Map<string, string>();

        for (const category of categoriesData) {
          const catalogsInCategory = await authService.getCatalogsByCategory(category.CategoriaID);
          allCatalogs.push(...catalogsInCategory);

          // Guardar el mapeo de catálogo a categoría ID
          catalogsInCategory.forEach((cat: any) => {
            categoryMap.set(cat.CatalogoID, category.CategoriaID);
          });
        }

        console.log('Todos los catálogos cargados:', allCatalogs);
        setCatalogCategoryMap(categoryMap);

        // 3. Mapear los datos del servidor al formato del componente
        const mappedCatalogs = allCatalogs.map((cat: any) => ({
          id: cat.CatalogoID,
          title: cat.Nombre,
          description: cat.Descripcion,
          category: 'otros' as CatalogCategory,
          createdAt: new Date().toISOString().split('T')[0],
          ownerId: user.id,
          ownerName: user.name,
          status: (cat.Estado === '1' || cat.Estado === 1) ? 'active' as 'active' | 'inactive' : 'inactive' as 'active' | 'inactive',
          productsCount: 0
        }));

        setCatalogs(mappedCatalogs);
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        setCatalogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadCatalogs();
  }, [user]);

  const handleEdit = (catalog: Catalog) => {
    setEditingId(catalog.id);
    setEditTitle(catalog.title);
    setEditDescription(catalog.description);
    // Obtener el categoryId del mapa
    const categoryId = catalogCategoryMap.get(catalog.id) || '';
    setEditCategoryId(categoryId);
    setOpenMenuId(null);
  };

  const handleSaveEdit = async (catalogId: string) => {
    try {
      // Llamar a la API para actualizar el catálogo
      // El ID es el catalogId existente, no 0
      const categoryId = editCategoryId || catalogCategoryMap.get(catalogId) || '';

      const result = await authService.updateCatalog(
        catalogId,
        editTitle,
        editDescription,
        categoryId
      );

      console.log('Catálogo actualizado:', result.message);

      // Recargar catálogos para obtener la lista actualizada
      const categoriesData = await authService.getCategories();
      const allCatalogs: any[] = [];
      const categoryMap = new Map<string, string>();

      for (const category of categoriesData) {
        const catalogsInCategory = await authService.getCatalogsByCategory(category.CategoriaID);
        allCatalogs.push(...catalogsInCategory);

        catalogsInCategory.forEach((cat: any) => {
          categoryMap.set(cat.CatalogoID, category.CategoriaID);
        });
      }

      setCatalogCategoryMap(categoryMap);

      const mappedCatalogs = allCatalogs.map((cat: any) => ({
        id: cat.CatalogoID,
        title: cat.Nombre,
        description: cat.Descripcion,
        category: 'otros' as CatalogCategory,
        createdAt: new Date().toISOString().split('T')[0],
        ownerId: user?.id || '',
        ownerName: user?.name || '',
        status: (cat.Estado === '1' || cat.Estado === 1) ? 'active' as 'active' | 'inactive' : 'inactive' as 'active' | 'inactive',
        productsCount: 0
      }));

      setCatalogs(mappedCatalogs);
      setEditingId(null);
    } catch (error) {
      console.error('Error al actualizar catálogo:', error);
      alert('Error al actualizar el catálogo');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditCategoryId('');
  };

  const handleToggleStatus = async (catalogId: string) => {
    const catalog = catalogs.find(c => c.id === catalogId);
    if (!catalog) return;

    try {
      // Calcular el nuevo estado (invertir el actual)
      const newIsActive = catalog.status === 'inactive';
      const categoryId = catalogCategoryMap.get(catalogId) || '';

      // Llamar a la API para actualizar el catálogo con el nuevo estado
      await authService.updateCatalog(
        catalogId,
        catalog.title,
        catalog.description,
        categoryId,
        newIsActive
      );

      console.log(`Catálogo ${newIsActive ? 'activado' : 'desactivado'} exitosamente`);

      // Recargar catálogos para obtener la lista actualizada
      const categoriesData = await authService.getCategories();
      const allCatalogs: any[] = [];
      const categoryMap = new Map<string, string>();

      for (const category of categoriesData) {
        const catalogsInCategory = await authService.getCatalogsByCategory(category.CategoriaID);
        allCatalogs.push(...catalogsInCategory);

        catalogsInCategory.forEach((cat: any) => {
          categoryMap.set(cat.CatalogoID, category.CategoriaID);
        });
      }

      setCatalogCategoryMap(categoryMap);

      const mappedCatalogs = allCatalogs.map((cat: any) => ({
        id: cat.CatalogoID,
        title: cat.Nombre,
        description: cat.Descripcion,
        category: 'otros' as CatalogCategory,
        createdAt: new Date().toISOString().split('T')[0],
        ownerId: user?.id || '',
        ownerName: user?.name || '',
        status: (cat.Estado === '1' || cat.Estado === 1) ? 'active' as 'active' | 'inactive' : 'inactive' as 'active' | 'inactive',
        productsCount: 0
      }));

      setCatalogs(mappedCatalogs);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error al cambiar estado del catálogo:', error);
      alert('Error al cambiar el estado del catálogo');
    }
  };

  const handleDelete = async (catalogId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este catálogo?')) {
      try {
        // Llamar a la API para eliminar el catálogo
        const result = await authService.deleteCatalog(catalogId);
        console.log('Catálogo eliminado:', result.message);

        // Recargar catálogos para obtener la lista actualizada
        const categoriesData = await authService.getCategories();
        const allCatalogs: any[] = [];
        const categoryMap = new Map<string, string>();

        for (const category of categoriesData) {
          const catalogsInCategory = await authService.getCatalogsByCategory(category.CategoriaID);
          allCatalogs.push(...catalogsInCategory);

          catalogsInCategory.forEach((cat: any) => {
            categoryMap.set(cat.CatalogoID, category.CategoriaID);
          });
        }

        setCatalogCategoryMap(categoryMap);

        const mappedCatalogs = allCatalogs.map((cat: any) => ({
          id: cat.CatalogoID,
          title: cat.Nombre,
          description: cat.Descripcion,
          category: 'otros' as CatalogCategory,
          createdAt: new Date().toISOString().split('T')[0],
          ownerId: user?.id || '',
          ownerName: user?.name || '',
          status: (cat.Estado === '1' || cat.Estado === 1) ? 'active' as 'active' | 'inactive' : 'inactive' as 'active' | 'inactive',
          productsCount: 0
        }));

        setCatalogs(mappedCatalogs);
        setOpenMenuId(null);
      } catch (error) {
        console.error('Error al eliminar catálogo:', error);
        alert('Error al eliminar el catálogo');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Gestión de Catálogos</h1>
            <p className="text-gray-600">
              Administra todos tus catálogos desde un solo lugar
            </p>
          </div>
          <button
            onClick={onCreateCatalog}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Crear Catálogo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Catálogos</p>
                <p className="text-gray-900">{catalogs.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Activos</p>
                <p className="text-gray-900">
                  {catalogs.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Inactivos</p>
                <p className="text-gray-900">
                  {catalogs.filter(c => c.status === 'inactive').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {catalogs.map((catalog) => (
            <div
              key={catalog.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              {editingId === catalog.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Título</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Descripción</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Categoría</label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveEdit(catalog.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-indigo-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-gray-900">{catalog.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            catalog.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {catalog.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{catalog.description}</p>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === catalog.id ? null : catalog.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {openMenuId === catalog.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                            <button
                              onClick={() => handleEdit(catalog)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleToggleStatus(catalog.id)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                            >
                              {catalog.status === 'active' ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  Activar
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => onViewCatalog(catalog.id)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                              Ver catálogo
                            </button>
                            <hr className="my-2" />
                            <button
                              onClick={() => handleDelete(catalog.id)}
                              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(catalog.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span className="text-sm">{catalog.productsCount} productos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span className="text-sm text-indigo-600">
                          {categoryNameMap.get(catalogCategoryMap.get(catalog.id) || '') || 'Sin categoría'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {catalogs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No tienes catálogos</h3>
            <p className="text-gray-600">
              Crea tu primer catálogo para comenzar
            </p>
          </div>
        )}
      </div>

      {/* Cerrar menú al hacer clic fuera */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  );
}