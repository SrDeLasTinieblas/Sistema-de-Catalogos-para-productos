import React, { useState } from 'react';
import { LogOut, Package, User, Menu, X, ChevronDown, Store, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const { user, currentMode, logout, switchMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleSwitchMode = (mode: 'Propietario' | 'Visitante') => {
    switchMode(mode);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    handleNavigate('home');
  };

  const canSwitchMode = user?.role === 'Propietario';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition"
            >
              <Package className="w-6 h-6" />
              <span className="font-semibold">KatalogEngine</span>
            </button>

            {user && (
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => handleNavigate('home')}
                  className={`px-3 py-2 rounded-lg transition ${
                    currentView === 'home'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Inicio
                </button>
                
                {currentMode === 'Visitante' && (
                  <button
                    onClick={() => handleNavigate('catalogs')}
                    className={`px-3 py-2 rounded-lg transition ${
                      currentView === 'catalogs' || currentView === 'catalog-view'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Catálogos
                  </button>
                )}

                {currentMode === 'Propietario' && (
                  <>
                    <button
                      onClick={() => handleNavigate('manage-catalogs')}
                      className={`px-3 py-2 rounded-lg transition ${
                        currentView === 'manage-catalogs'
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Mis Catálogos
                    </button>
                    <button
                      onClick={() => handleNavigate('upload-catalog')}
                      className={`px-3 py-2 rounded-lg transition ${
                        currentView === 'upload-catalog'
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Subir Catálogo
                    </button>
                    <button
                      onClick={() => handleNavigate('upload-product')}
                      className={`px-3 py-2 rounded-lg transition ${
                        currentView === 'upload-product'
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Subir Producto
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-4">
              {/* Desktop User Menu */}
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700 hidden lg:inline">{user.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    currentMode === 'Propietario' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {currentMode === 'Propietario' ? 'Propietario' : 'Visitante'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm text-gray-600">Conectado como</p>
                      <p className="text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    {canSwitchMode && (
                      <>
                        <div className="px-4 py-2">
                          <p className="text-xs text-gray-500 mb-2">Cambiar modo</p>
                          
                          <button
                            onClick={() => handleSwitchMode('Propietario')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition mb-1 ${
                              currentMode === 'Propietario'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Store className="w-4 h-4" />
                            <div className="flex-1 text-left">
                              <p className="text-sm">Modo Propietario</p>
                              <p className="text-xs text-gray-500">Gestionar catálogos</p>
                            </div>
                            {currentMode === 'Propietario' && (
                              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            )}
                          </button>

                          <button
                            onClick={() => handleSwitchMode('Visitante')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                              currentMode === 'Visitante'
                                ? 'bg-green-50 text-green-700'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            <div className="flex-1 text-left">
                              <p className="text-sm">Modo Visitante</p>
                              <p className="text-xs text-gray-500">Explorar catálogos</p>
                            </div>
                            {currentMode === 'Visitante' && (
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            )}
                          </button>
                        </div>
                        <hr className="my-2" />
                      </>
                    )}

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            <button
              onClick={() => handleNavigate('home')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                currentView === 'home'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Inicio
            </button>
            
            {currentMode === 'Visitante' && (
              <button
                onClick={() => handleNavigate('catalogs')}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  currentView === 'catalogs' || currentView === 'catalog-view'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Catálogos
              </button>
            )}

            {currentMode === 'Propietario' && (
              <>
                <button
                  onClick={() => handleNavigate('manage-catalogs')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    currentView === 'manage-catalogs'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Mis Catálogos
                </button>
                <button
                  onClick={() => handleNavigate('upload-catalog')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    currentView === 'upload-catalog'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Subir Catálogo
                </button>
                <button
                  onClick={() => handleNavigate('upload-product')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    currentView === 'upload-product'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Subir Producto
                </button>
              </>
            )}

            <div className="pt-2 border-t border-gray-200 mt-2">
              <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                <p className="text-sm text-gray-600 mb-1">Conectado como</p>
                <p className="text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                  currentMode === 'Propietario' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {currentMode === 'Propietario' ? 'Modo Propietario' : 'Modo Visitante'}
                </span>
              </div>

              {canSwitchMode && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2 px-4">Cambiar modo</p>
                  
                  <button
                    onClick={() => handleSwitchMode('Propietario')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition mb-2 ${
                      currentMode === 'Propietario'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <div className="flex-1 text-left">
                      <p className="text-sm">Modo Propietario</p>
                      <p className="text-xs text-gray-500">Gestionar catálogos</p>
                    </div>
                    {currentMode === 'Propietario' && (
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    )}
                  </button>

                  <button
                    onClick={() => handleSwitchMode('Visitante')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      currentMode === 'Visitante'
                        ? 'bg-green-50 text-green-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <div className="flex-1 text-left">
                      <p className="text-sm">Modo Visitante</p>
                      <p className="text-xs text-gray-500">Explorar catálogos</p>
                    </div>
                    {currentMode === 'Visitante' && (
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    )}
                  </button>
                </div>
              )}
              
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </nav>
  );
}