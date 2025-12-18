import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Image as ImageIcon, CheckCircle, AlertCircle, DollarSign, Package } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { Catalog } from '../types';

interface UploadProductProps {
  catalogId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UploadProduct({ catalogId: initialCatalogId, onSuccess, onCancel }: UploadProductProps) {
  const { user } = useAuth();
  const [selectedCatalogId, setSelectedCatalogId] = useState(initialCatalogId || '');
  const [userCatalogs, setUserCatalogs] = useState<Array<{ id: string; title: string }>>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ catalog?: string; name?: string; description?: string; price?: string; image?: string }>({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadCatalogs = async () => {
      if (!user) {
        setUserCatalogs([]);
        return;
      }

      try {
        // 1. Obtener todas las categorías
        const categories = await authService.getCategories();

        // 2. Obtener catálogos de cada categoría
        const allCatalogs: any[] = [];
        for (const category of categories) {
          const catalogsInCategory = await authService.getCatalogsByCategory(category.CategoriaID);
          allCatalogs.push(...catalogsInCategory);
        }

        // 3. Mapear y filtrar solo activos
        const mappedCatalogs = allCatalogs.map((cat: any) => ({
          id: cat.CatalogoID,
          title: cat.Nombre
        }));

        setUserCatalogs(mappedCatalogs);
      } catch (error) {
        console.error('Error al cargar catálogos:', error);
        setUserCatalogs([]);
      }
    };

    loadCatalogs();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Solo se permiten archivos de imagen' });
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'La imagen no debe superar los 5MB' });
      return;
    }

    setImageFile(file);
    setErrors({ ...errors, image: undefined });

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: { catalog?: string; name?: string; description?: string; price?: string; image?: string } = {};

    if (!selectedCatalogId) {
      newErrors.catalog = 'Debes seleccionar un catálogo';
    }

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'El precio debe ser un número mayor a 0';
      }
    }

    if (!imageFile) {
      newErrors.image = 'La imagen es requerida';
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
      // Convertir imagen a base64 (sin el prefijo data:image/...)
      const base64Image = imagePreview.split(',')[1];

      // Enviar a la API
      await authService.createProduct(
        selectedCatalogId,
        name.trim(),
        description.trim(),
        parseFloat(price),
        base64Image
      );

      setSuccess(true);

      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        setName('');
        setDescription('');
        setPrice('');
        setImageFile(null);
        setImagePreview('');
        setSuccess(false);
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error al crear producto:', error);
      setApiError(error instanceof Error ? error.message : 'Error al crear el producto');
    } finally {
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
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-gray-900">Subir Nuevo Producto</h1>
              <p className="text-gray-600">Agrega un producto al catálogo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="catalog" className="block text-gray-700 mb-2">
                Catálogo <span className="text-red-500">*</span>
              </label>
              <select
                id="catalog"
                value={selectedCatalogId}
                onChange={(e) => {
                  setSelectedCatalogId(e.target.value);
                  if (errors.catalog) setErrors({ ...errors, catalog: undefined });
                }}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  errors.catalog ? 'border-red-500' : 'border-gray-200'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition`}
                disabled={isSubmitting || success}
              >
                <option value="">Selecciona un catálogo</option>
                {userCatalogs.map((catalog) => (
                  <option key={catalog.id} value={catalog.id}>
                    {catalog.title}
                  </option>
                ))}
              </select>
              {errors.catalog && (
                <p className="mt-1 text-sm text-red-600">{errors.catalog}</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition`}
                placeholder="Ej: Zapatillas Deportivas Nike"
                disabled={isSubmitting || success}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition`}
                placeholder="Describe el producto de manera atractiva..."
                disabled={isSubmitting || success}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-gray-700 mb-2">
                Precio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors({ ...errors, price: undefined });
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                    errors.price ? 'border-red-500' : 'border-gray-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition`}
                  placeholder="0.00"
                  disabled={isSubmitting || success}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Imagen del Producto <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed ${
                errors.image ? 'border-red-500' : 'border-gray-300'
              } rounded-lg p-8 text-center hover:border-green-400 transition`}>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  disabled={isSubmitting || success}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 rounded-lg mx-auto object-cover"
                      />
                      <p className="text-gray-900">{imageFile?.name}</p>
                      <p className="text-gray-500 text-sm">
                        {imageFile && (imageFile.size / 1024).toFixed(2)} KB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Cambiar imagen
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-900 mb-1">
                        Haz clic para subir o arrastra una imagen
                      </p>
                      <p className="text-gray-500 text-sm">
                        PNG, JPG, JPEG o WEBP (máx. 10MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>¡Producto creado exitosamente!</span>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                    Subir Producto
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

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-gray-900 mb-4">Consejos para tu producto:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <ImageIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Usa imágenes de alta calidad y bien iluminadas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Escribe descripciones detalladas y atractivas</span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Verifica que el precio sea correcto antes de publicar</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
