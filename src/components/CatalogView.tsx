import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Package, User, ShoppingCart, Tag, Plus, X, Upload } from 'lucide-react';
import { CatalogCategory, Product, Catalog } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { authService } from '../services/authService';

interface CatalogViewProps {
  catalogId: string;
  onBack: () => void;
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

const categoryColors: Record<CatalogCategory, string> = {
  moda: 'bg-pink-100 text-pink-700',
  tecnologia: 'bg-blue-100 text-blue-700',
  hogar: 'bg-green-100 text-green-700',
  deportes: 'bg-orange-100 text-orange-700',
  belleza: 'bg-purple-100 text-purple-700',
  juguetes: 'bg-yellow-100 text-yellow-700',
  alimentos: 'bg-red-100 text-red-700',
  otros: 'bg-gray-100 text-gray-700'
};

export function CatalogView({ catalogId, onBack }: CatalogViewProps) {
  const { user, currentMode } = useAuth();
  const [catalog, setCatalog] = useState<Catalog | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  
  // Formulario de agregar producto
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    price?: string;
    stock?: string;
    image?: string;
  }>({});

  // Cargar datos del catálogo y productos
  useEffect(() => {
    const loadCatalogAndProducts = async () => {
      if (!user) return;

      try {
        // 1. Obtener todas las categorías y buscar el catálogo
        const categories = await authService.getCategories();

        let foundCatalog: any = null;
        for (const category of categories) {
          const catalogsInCategory = await authService.getCatalogsByCategory(category.CategoriaID);
          foundCatalog = catalogsInCategory.find((c: any) => c.CatalogoID === catalogId);
          if (foundCatalog) break;
        }

        if (foundCatalog) {
          // Mapear al formato del componente
          const mappedCatalog = {
            id: foundCatalog.CatalogoID,
            title: foundCatalog.Nombre,
            description: foundCatalog.Descripcion,
            category: 'otros' as CatalogCategory,
            createdAt: new Date().toISOString().split('T')[0],
            ownerId: user.id,
            ownerName: user.name,
            status: 'active' as 'active' | 'inactive',
            productsCount: 0
          };
          setCatalog(mappedCatalog);

          // 2. Obtener productos del catálogo
          const productsData = await authService.getProducts(catalogId);
          // console.log('Productos CSV:', productsData);

          // Mapear productos al formato del componente
          const mappedProducts = productsData.map((prod: any) => ({
            id: prod.ProductoID,
            name: prod.Nombre,
            description: prod.Descripcion,
            price: parseFloat(prod.Precio) || 0,
            image: prod.URLImagen || '',
            catalogId: catalogId,
            stock: undefined
          }));

          setProducts(mappedProducts);
        } else {
          setCatalog(undefined);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error al cargar catálogo y productos:', error);
        setCatalog(undefined);
        setProducts([]);
      }
    };

    loadCatalogAndProducts();
  }, [catalogId, user]);

  if (!catalog) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-2">Catálogo no encontrado</h2>
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  // Verificar si el usuario actual es el propietario del catálogo
  const isOwner = user && currentMode === 'Propietario' && catalog.ownerId === user.id;

  const validateProductForm = () => {
    const newErrors: typeof errors = {};
    
    if (!productName.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (productName.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!productDescription.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (productDescription.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }
    
    if (!productPrice.trim()) {
      newErrors.price = 'El precio es requerido';
    } else if (isNaN(Number(productPrice)) || Number(productPrice) <= 0) {
      newErrors.price = 'El precio debe ser un número mayor a 0';
    }
    
    if (!productStock.trim()) {
      newErrors.stock = 'El stock es requerido';
    } else if (isNaN(Number(productStock)) || Number(productStock) < 0) {
      newErrors.stock = 'El stock debe ser un número mayor o igual a 0';
    }
    
    if (!productImageUrl.trim()) {
      newErrors.image = 'La URL de la imagen es requerida';
    } else {
      // Validar que sea una URL válida
      try {
        new URL(productImageUrl);
      } catch {
        newErrors.image = 'Debe ser una URL válida';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProductForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Este formulario usa URL de imagen, pero la API requiere base64
      // Se recomienda usar el componente UploadProduct en su lugar
      // console.log('ADVERTENCIA: Este formulario usa URL pero la API requiere imagen en base64');
      // console.log('Por favor, usa el componente UploadProduct para agregar productos con imágenes');

      // Por ahora, agregamos el producto solo localmente
      const newProduct: Product = {
        id: 'product-' + Math.random().toString(36).substr(2, 9),
        name: productName.trim(),
        description: productDescription.trim(),
        price: Number(productPrice),
        stock: Number(productStock),
        image: productImageUrl.trim(),
        catalogId: catalogId
      };

      // Actualizar estado local
      setProducts([...products, newProduct]);

      // Limpiar formulario
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductStock('');
      setProductImageUrl('');
      setErrors({});
      setShowAddProduct(false);
    } catch (error) {
      console.error('Error al agregar producto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAddProduct = () => {
    setShowAddProduct(false);
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductStock('');
    setProductImageUrl('');
    setErrors({});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a catálogos
        </button>

        {/* Información del catálogo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-16 h-16 text-indigo-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-gray-900">{catalog.title}</h1>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${categoryColors[catalog.category]}`}>
                      <Tag className="w-4 h-4" />
                      {categoryLabels[catalog.category]}
                    </span>
                  </div>
                  <p className="text-gray-600">{catalog.description}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Publicado el {formatDate(catalog.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>{catalog.ownerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>{products.length} productos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        {/* <div className="mb-6 flex items-center justify-between">
          <h2 className="text-gray-900">Productos en este catálogo</h2>
          {isOwner && (
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              Agregar Producto
            </button>
          )}
        </div> */}

        {/* Formulario de agregar producto */}
        {showAddProduct && isOwner && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Agregar Nuevo Producto</h3>
              <button
                onClick={handleCancelAddProduct}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-name" className="block text-gray-700 mb-2">
                    Nombre del Producto <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={`w-full px-4 py-2 bg-gray-50 border ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Ej: Camiseta Premium"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="product-image" className="block text-gray-700 mb-2">
                    URL de la Imagen <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product-image"
                    type="text"
                    value={productImageUrl}
                    onChange={(e) => {
                      setProductImageUrl(e.target.value);
                      if (errors.image) setErrors({ ...errors, image: undefined });
                    }}
                    className={`w-full px-4 py-2 bg-gray-50 border ${
                      errors.image ? 'border-red-500' : 'border-gray-200'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="product-description" className="block text-gray-700 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="product-description"
                  value={productDescription}
                  onChange={(e) => {
                    setProductDescription(e.target.value);
                    if (errors.description) setErrors({ ...errors, description: undefined });
                  }}
                  rows={3}
                  className={`w-full px-4 py-2 bg-gray-50 border ${
                    errors.description ? 'border-red-500' : 'border-gray-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
                  placeholder="Describe las características del producto..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-price" className="block text-gray-700 mb-2">
                    Precio (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={productPrice}
                    onChange={(e) => {
                      setProductPrice(e.target.value);
                      if (errors.price) setErrors({ ...errors, price: undefined });
                    }}
                    className={`w-full px-4 py-2 bg-gray-50 border ${
                      errors.price ? 'border-red-500' : 'border-gray-200'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="19.99"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="product-stock" className="block text-gray-700 mb-2">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    value={productStock}
                    onChange={(e) => {
                      setProductStock(e.target.value);
                      if (errors.stock) setErrors({ ...errors, stock: undefined });
                    }}
                    className={`w-full px-4 py-2 bg-gray-50 border ${
                      errors.stock ? 'border-red-500' : 'border-gray-200'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="50"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Agregar Producto
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelAddProduct}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600">
              {isOwner
                ? 'Agrega tu primer producto para comenzar'
                : 'Este catálogo aún no tiene productos disponibles'}
            </p>
            {isOwner && (
              <button
                onClick={() => setShowAddProduct(true)}
                className="mt-4 flex items-center gap-2 mx-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-5 h-5" />
                Agregar Producto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 overflow-hidden group"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-indigo-600">{formatPrice(product.price)}</span>
                    {product.stock !== undefined && (
                      <span className="text-sm text-gray-600">
                        Stock: {product.stock}
                      </span>
                    )}
                  </div>
                  
                  {/* {!isOwner && (
                    <button className="w-full flex items-center justify-center gap-2 p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition">
                      <ShoppingCart className="w-5 h-5" />
                      Agregar al carrito
                    </button>
                  )} */}  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}