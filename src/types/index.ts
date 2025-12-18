export type UserRole = 'Visitante' | 'Propietario';

export type CatalogCategory = 
  | 'moda'
  | 'tecnologia'
  | 'hogar'
  | 'deportes'
  | 'belleza'
  | 'juguetes'
  | 'alimentos'
  | 'otros';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  catalogId: string;
  stock?: number;
}

export interface Catalog {
  id: string;
  title: string;
  description: string;
  category: CatalogCategory;
  createdAt: string;
  ownerId: string;
  ownerName: string;
  status: 'active' | 'inactive';
  productsCount: number;
}