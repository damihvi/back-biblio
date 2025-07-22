// Datos de ejemplo para searchanalytics
const searchAnalyticsData = [
  {
    query: "laptop",
    category: "electronics",
    resultsCount: 5,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    ip: "192.168.1.100",
    createdAt: new Date("2024-01-15T10:30:00Z")
  },
  {
    query: "smartphone",
    category: "electronics", 
    resultsCount: 8,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    ip: "192.168.1.101",
    createdAt: new Date("2024-01-15T11:15:00Z")
  },
  {
    query: "camiseta",
    category: "ropa",
    resultsCount: 12,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    ip: "192.168.1.102", 
    createdAt: new Date("2024-01-15T14:22:00Z")
  },
  {
    query: "zapatos deportivos",
    category: "calzado",
    resultsCount: 6,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    ip: "192.168.1.103",
    createdAt: new Date("2024-01-15T16:45:00Z")
  },
  {
    query: "libro programacion",
    category: "libros",
    resultsCount: 3,
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    ip: "192.168.1.104",
    createdAt: new Date("2024-01-15T18:30:00Z")
  }
];

module.exports = { searchAnalyticsData };
