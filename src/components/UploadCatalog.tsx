import React, { useState, useEffect } from 'react';
import { Upload, FileText, Image, CheckCircle, AlertCircle, Tag } from 'lucide-react';
import { CatalogCategory } from '../types';
import { authService } from '../services/authService';

interface UploadCatalogProps {
  onSuccess: () => void;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export function UploadCatalog({ onSuccess }: UploadCatalogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await authService.getCategories();
        const mappedCategories = categoriesData.map((cat: any) => ({
          id: cat.CategoriaID,
          name: cat.Nombre,
          description: cat.Descripcion
        }));
        setCategories(mappedCategories);

        // Seleccionar la primera categoría por defecto
        if (mappedCategories.length > 0) {
          setCategoryId(mappedCategories[0].id);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !categoryId) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    setUploading(true);

    try {
      // Llamar a la API para crear el catálogo (id=0 para crear)
      await authService.updateCatalog(
        '0',
        title,
        description,
        categoryId
      );

      setSuccess(true);

      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        setTitle('');
        setDescription('');
        // Volver a la primera categoría
        if (categories.length > 0) {
          setCategoryId(categories[0].id);
        }
        setSuccess(false);
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error al crear catálogo:', error);
      setError(error instanceof Error ? error.message : 'Error al crear el catálogo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Subir Nuevo Catálogo</h1>
          <p className="text-gray-600">
            Crea un nuevo catálogo de productos para compartir con tus clientes
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-gray-700 mb-2">
                Título del Catálogo *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Colección Verano 2025"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                disabled={uploading || success}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el contenido del catálogo..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                disabled={uploading || success}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Categoría del Catálogo *
              </label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  disabled={uploading || success}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Tag className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* <div>
              <label className="block text-gray-700 mb-2">
                Archivo del Catálogo (Opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.xlsx,.xls,.csv"
                  className="hidden"
                  id="file-upload"
                  disabled={uploading || success}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {file ? (
                    <>
                      <FileText className="w-12 h-12 text-green-600 mb-3" />
                      <p className="text-gray-900 mb-1">{file.name}</p>
                      <p className="text-gray-500 text-sm">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-900 mb-1">
                        Haz clic para subir o arrastra un archivo
                      </p>
                      <p className="text-gray-500 text-sm">
                        PDF, Excel o CSV (máx. 10MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div> */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>¡Catálogo subido exitosamente!</span>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={uploading || success}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subiendo...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Completado
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Subir Catálogo
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-gray-900 mb-4">Consejos para tu catálogo:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <Image className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>Usa un título descriptivo y atractivo</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>Incluye una descripción detallada de los productos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>Asegúrate de que toda la información esté actualizada</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}