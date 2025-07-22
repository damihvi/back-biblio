// Datos de ejemplo para orderitemmongos
const orderItemsData = [
  {
    orderId: "550e8400-e29b-41d4-a716-446655440001",
    productId: "prod_001",
    productName: "Laptop Dell Inspiron 15",
    quantity: 1,
    price: 899.99,
    subtotal: 899.99,
    createdAt: new Date("2024-01-15T10:00:00Z")
  },
  {
    orderId: "550e8400-e29b-41d4-a716-446655440001", 
    productId: "prod_002",
    productName: "Mouse Inalámbrico Logitech",
    quantity: 2,
    price: 29.99,
    subtotal: 59.98,
    createdAt: new Date("2024-01-15T10:00:00Z")
  },
  {
    orderId: "550e8400-e29b-41d4-a716-446655440002",
    productId: "prod_003", 
    productName: "Camiseta Nike Dry-Fit",
    quantity: 3,
    price: 24.99,
    subtotal: 74.97,
    createdAt: new Date("2024-01-15T11:30:00Z")
  },
  {
    orderId: "550e8400-e29b-41d4-a716-446655440002",
    productId: "prod_004",
    productName: "Pantalón Jeans Levi's 501",
    quantity: 1, 
    price: 79.99,
    subtotal: 79.99,
    createdAt: new Date("2024-01-15T11:30:00Z")
  },
  {
    orderId: "550e8400-e29b-41d4-a716-446655440003",
    productId: "prod_005",
    productName: "Libro: Clean Code",
    quantity: 1,
    price: 45.00,
    subtotal: 45.00,
    createdAt: new Date("2024-01-15T15:20:00Z")
  },
  {
    orderId: "550e8400-e29b-41d4-a716-446655440003",
    productId: "prod_006", 
    productName: "Auriculares Sony WH-1000XM4",
    quantity: 1,
    price: 349.99,
    subtotal: 349.99,
    createdAt: new Date("2024-01-15T15:20:00Z")
  }
];

module.exports = { orderItemsData };
