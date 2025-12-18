import React, { useState } from 'react';
import { ArrowLeft, Package, Save, AlertCircle } from 'lucide-react';
import { CatalogCategory, Catalog } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { addCatalog } from '../data/catalogStore';
import { authService } from '../services/authService';

interface CreateCatalogProps {
  onSuccess: (catalogId: string) => void;
  onCancel: () => void;
}

const categoryLabels: Record<CatalogCategory, string> = {
  moda: 'Moda',
  tecnologia: 'Tecnología',
  hogar: 'Hogar',
  deportes: 'Deportes',
  belleza: 'Belleza',
  juguetes: 'Juguetes',
  alimentos: 'Alimentos',
  otros: 'Otros'
};

export function CreateCatalog({ onSuccess, onCancel }: CreateCatalogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CatalogCategory>('otros');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    }
    
    if (!description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Llamar a la API para crear el catálogo
      const response = await authService.createCatalog(
        title.trim(),
        description.trim(),
        category
      );

      // Generar un nuevo ID para el catálogo
      const newCatalogId = response.id || 'catalog-' + Math.random().toString(36).substr(2, 9);

      // Crear el nuevo catálogo para el store local
      const newCatalog: Catalog = {
        id: newCatalogId,
        title: title.trim(),
        description: description.trim(),
        category: category,
        createdAt: new Date().toISOString().split('T')[0],
        ownerId: user?.id || '',
        ownerName: user?.name || '',
        status: 'active',
        productsCount: 0
      };

      // Agregar al store local
      addCatalog(newCatalog);

      setIsSubmitting(false);
      onSuccess(newCatalogId);
    } catch (error) {
      console.error('Error al crear catálogo:', error);
      setApiError(error instanceof Error ? error.message : 'Error al crear el catálogo');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-gray-900">Crear Nuevo Catálogo</h1>
              <p className="text-gray-600">Completa la información para crear tu catálogo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-gray-700 mb-2">
                Título del Catálogo <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  errors.title ? 'border-red-500' : 'border-gray-200'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
                placeholder="Ej: Colección Verano 2025"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-gray-700 mb-2">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: undefined });
                }}
                rows={4}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  errors.description ? 'border-red-500' : 'border-gray-200'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition`}
                placeholder="Describe tu catálogo de manera atractiva..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-gray-700 mb-2">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CatalogCategory)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Una vez creado el catálogo, podrás agregar productos desde la vista de detalle.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Crear Catálogo
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}