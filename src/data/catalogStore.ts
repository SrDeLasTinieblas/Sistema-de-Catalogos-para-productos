import { Catalog, Product } from '../types';
import { mockCatalogs, mockProducts } from './mockData';

// In-memory store for catalogs and products
let catalogsStore: Catalog[] = [...mockCatalogs];
let productsStore: Product[] = [...mockProducts];

// Catalog management functions
export function getAllCatalogs(): Catalog[] {
  return catalogsStore;
}

export function getCatalogById(id: string): Catalog | undefined {
  return catalogsStore.find(c => c.id === id);
}

export function getCatalogsByOwnerId(ownerId: string): Catalog[] {
  return catalogsStore.filter(c => c.ownerId === ownerId);
}

export function addCatalog(catalog: Catalog): void {
  catalogsStore.push(catalog);
}

export function updateCatalog(id: string, updates: Partial<Catalog>): void {
  const index = catalogsStore.findIndex(c => c.id === id);
  if (index !== -1) {
    catalogsStore[index] = { ...catalogsStore[index], ...updates };
  }
}

export function deleteCatalog(id: string): void {
  catalogsStore = catalogsStore.filter(c => c.id !== id);
  // También eliminar productos del catálogo
  productsStore = productsStore.filter(p => p.catalogId !== id);
}

// Product management functions
export function getAllProducts(): Product[] {
  return productsStore;
}

export function getProductsByCatalogId(catalogId: string): Product[] {
  return productsStore.filter(p => p.catalogId === catalogId);
}

export function addProduct(product: Product): void {
  productsStore.push(product);
  
  // Actualizar el contador de productos del catálogo
  const catalogIndex = catalogsStore.findIndex(c => c.id === product.catalogId);
  if (catalogIndex !== -1) {
    catalogsStore[catalogIndex].productsCount = getProductsByCatalogId(product.catalogId).length;
  }
}

export function updateProduct(id: string, updates: Partial<Product>): void {
  const index = productsStore.findIndex(p => p.id === id);
  if (index !== -1) {
    productsStore[index] = { ...productsStore[index], ...updates };
  }
}

export function deleteProduct(id: string): void {
  const product = productsStore.find(p => p.id === id);
  const catalogId = product?.catalogId;
  
  productsStore = productsStore.filter(p => p.id !== id);
  
  // Actualizar el contador de productos del catálogo
  if (catalogId) {
    const catalogIndex = catalogsStore.findIndex(c => c.id === catalogId);
    if (catalogIndex !== -1) {
      catalogsStore[catalogIndex].productsCount = getProductsByCatalogId(catalogId).length;
    }
  }
}

// Reset function for testing
export function resetStore(): void {
  catalogsStore = [...mockCatalogs];
  productsStore = [...mockProducts];
}
