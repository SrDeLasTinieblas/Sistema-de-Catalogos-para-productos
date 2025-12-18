import React, { useState, useEffect } from 'react';
import { Eye, FolderOpen, Upload, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

interface HomeProps {
  onNavigate: (view: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { user, currentMode } = useAuth();
  const [stats, setStats] = useState({
    totalCatalogs: 0,
    totalProducts: 0,
    totalCategories: 0,
    loading: true
  });

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      if (!user) {
        setStats({ totalCatalogs: 0, totalProducts: 0, totalCategories: 0, loading: false });
        return;
      }

      try {
        // 1. Obtener categorías
        const categories = await authService.getCategories();
        const totalCategories = categories.length;

        // 2. Obtener todos los catálogos de todas las categorías
        let allCatalogs: any[] = [];
        for (const category of categories) {
          const catalogsInCategory = await authService.getCatalogsByCategory(category.CategoriaID);
          allCatalogs.push(...catalogsInCategory);
        }
        const totalCatalogs = allCatalogs.length;

        // 3. Obtener productos de cada catálogo
        let totalProducts = 0;
        for (const catalog of allCatalogs) {
          const products = await authService.getProducts(catalog.CatalogoID);
          totalProducts += products.length;
        }

        setStats({
          totalCatalogs,
          totalProducts,
          totalCategories,
          loading: false
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setStats({ totalCatalogs: 0, totalProducts: 0, totalCategories: 0, loading: false });
      }
    };

    loadStats();
  }, [user]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-gray-900 mb-4">
            Bienvenido, {user?.name}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {currentMode === 'Propietario'
              ? 'Gestiona tus catálogos de productos, crea nuevos catálogos y comparte tu inventario con tus clientes.'
              : 'Explora los catálogos disponibles y descubre los productos que tenemos para ti.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {currentMode === 'Visitante' ? (
            <>
              <button
                onClick={() => onNavigate('catalogs')}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all p-8 text-left border-2 border-transparent hover:border-indigo-200"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl mb-4 group-hover:scale-110 transition">
                  <Eye className="w-7 h-7" />
                </div>
                <h3 className="text-gray-900 mb-2">Ver Catálogos</h3>
                <p className="text-gray-600">
                  Explora todos los catálogos disponibles y sus productos
                </p>
              </button>

              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 text-gray-400 rounded-xl mb-4">
                  <FolderOpen className="w-7 h-7" />
                </div>
                <h3 className="text-gray-900 mb-2">Mis Favoritos</h3>
                <p className="text-gray-600">
                  Próximamente: Guarda tus catálogos favoritos
                </p>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('manage-catalogs')}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all p-8 text-left border-2 border-transparent hover:border-indigo-200"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl mb-4 group-hover:scale-110 transition">
                  <Settings className="w-7 h-7" />
                </div>
                <h3 className="text-gray-900 mb-2">Gestionar Catálogos</h3>
                <p className="text-gray-600">
                  Administra, edita y elimina tus catálogos existentes
                </p>
              </button>

              <button
                onClick={() => onNavigate('upload-catalog')}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all p-8 text-left border-2 border-transparent hover:border-green-200"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 text-green-600 rounded-xl mb-4 group-hover:scale-110 transition">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-gray-900 mb-2">Subir Catálogo</h3>
                <p className="text-gray-600">
                  Crea un nuevo catálogo y agrega productos
                </p>
              </button>

              <button
                onClick={() => onNavigate('catalogs')}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all p-8 text-left border-2 border-transparent hover:border-blue-200"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 text-blue-600 rounded-xl mb-4 group-hover:scale-110 transition">
                  <Eye className="w-7 h-7" />
                </div>
                <h3 className="text-gray-900 mb-2">Ver Catálogos</h3>
                <p className="text-gray-600">
                  Explora todos los catálogos como visitante
                </p>
              </button>
            </>
          )}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-sm p-8 max-w-3xl mx-auto border border-gray-200">
          <h3 className="text-gray-900 mb-4">Estadísticas del Sistema</h3>
          {stats.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-indigo-600 mb-1">{stats.totalCatalogs}</div>
                <div className="text-gray-600">Catálogos Totales</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-green-600 mb-1">{stats.totalProducts}</div>
                <div className="text-gray-600">Productos Totales</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-600 mb-1">{stats.totalCategories}</div>
                <div className="text-gray-600">Categorías</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}