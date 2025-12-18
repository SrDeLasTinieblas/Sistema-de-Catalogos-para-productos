import { Catalog, Product } from '../types';

export const mockCatalogs: Catalog[] = [
  {
    id: '1',
    title: 'Colección Primavera 2025',
    description: 'Nueva colección de ropa casual para la temporada de primavera',
    category: 'moda',
    createdAt: '2025-03-15',
    ownerId: 'user-001',
    ownerName: 'María García',
    status: 'active',
    productsCount: 12
  },
  {
    id: '2',
    title: 'Tecnología y Gadgets',
    description: 'Los últimos dispositivos y accesorios tecnológicos del mercado',
    category: 'tecnologia',
    createdAt: '2025-03-10',
    ownerId: 'user-002',
    ownerName: 'Juan Pérez',
    status: 'active',
    productsCount: 8
  },
  {
    id: '3',
    title: 'Muebles Modernos',
    description: 'Diseños contemporáneos para tu hogar y oficina',
    category: 'hogar',
    createdAt: '2025-03-05',
    ownerId: 'user-001',
    ownerName: 'María García',
    status: 'active',
    productsCount: 15
  },
  {
    id: '4',
    title: 'Deportes y Fitness',
    description: 'Equipamiento profesional para tu entrenamiento',
    category: 'deportes',
    createdAt: '2025-02-28',
    ownerId: 'user-004',
    ownerName: 'Carlos López',
    status: 'active',
    productsCount: 20
  },
  {
    id: '5',
    title: 'Belleza y Cuidado Personal',
    description: 'Productos premium para tu rutina de belleza',
    category: 'belleza',
    createdAt: '2025-02-20',
    ownerId: 'user-002',
    ownerName: 'Juan Pérez',
    status: 'inactive',
    productsCount: 10
  },
  {
    id: '6',
    title: 'Juguetes Educativos',
    description: 'Diversión y aprendizaje para los más pequeños',
    category: 'juguetes',
    createdAt: '2025-02-15',
    ownerId: 'user-004',
    ownerName: 'Carlos López',
    status: 'active',
    productsCount: 18
  }
];

export const mockProducts: Product[] = [
  // Productos del catálogo 1
  {
    id: 'p1',
    name: 'Camisa Casual Lino',
    description: 'Camisa de lino premium con corte moderno, perfecta para cualquier ocasión casual',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
    catalogId: '1'
  },
  {
    id: 'p2',
    name: 'Pantalón Chino Beige',
    description: 'Pantalón chino de algodón con ajuste cómodo y elegante',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80',
    catalogId: '1'
  },
  {
    id: 'p3',
    name: 'Vestido Floral',
    description: 'Vestido ligero con estampado floral para primavera',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80',
    catalogId: '1'
  },
  {
    id: 'p4',
    name: 'Blazer Slim Fit',
    description: 'Blazer moderno con corte entallado, ideal para eventos',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&q=80',
    catalogId: '1'
  },
  // Productos del catálogo 2
  {
    id: 'p5',
    name: 'Auriculares Inalámbricos Pro',
    description: 'Sonido de alta calidad con cancelación de ruido activa',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    catalogId: '2'
  },
  {
    id: 'p6',
    name: 'Smartwatch Fitness',
    description: 'Reloj inteligente con monitor de actividad y salud',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    catalogId: '2'
  },
  {
    id: 'p7',
    name: 'Teclado Mecánico RGB',
    description: 'Teclado gaming con switches mecánicos e iluminación RGB',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
    catalogId: '2'
  },
  {
    id: 'p8',
    name: 'Cámara Web 4K',
    description: 'Cámara web profesional con resolución 4K y micrófono integrado',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=500&q=80',
    catalogId: '2'
  },
  // Productos del catálogo 3
  {
    id: 'p9',
    name: 'Silla Ergonómica Oficina',
    description: 'Silla de oficina con soporte lumbar ajustable',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&q=80',
    catalogId: '3'
  },
  {
    id: 'p10',
    name: 'Mesa de Trabajo Moderna',
    description: 'Mesa minimalista con acabado en roble natural',
    price: 449.99,
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80',
    catalogId: '3'
  },
  {
    id: 'p11',
    name: 'Estantería Flotante',
    description: 'Set de estantes flotantes de madera maciza',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&q=80',
    catalogId: '3'
  },
  {
    id: 'p12',
    name: 'Lámpara de Pie LED',
    description: 'Lámpara moderna con luz LED regulable',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    catalogId: '3'
  },
  // Productos del catálogo 4
  {
    id: 'p13',
    name: 'Mancuernas Ajustables',
    description: 'Set de mancuernas con peso ajustable de 5 a 25kg',
    price: 179.99,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80',
    catalogId: '4'
  },
  {
    id: 'p14',
    name: 'Esterilla de Yoga Premium',
    description: 'Esterilla antideslizante con grosor extra para mayor comodidad',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80',
    catalogId: '4'
  },
  {
    id: 'p15',
    name: 'Bicicleta Estática',
    description: 'Bicicleta de ejercicio con monitor digital y resistencia ajustable',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&q=80',
    catalogId: '4'
  }
];