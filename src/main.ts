import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS for production
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      console.log('CORS request from origin:', origin);
      
      // Allow any Vercel domain, localhost, or specific domains
      const allowedOrigins = [
        /\.vercel\.app$/,
        /^http:\/\/localhost:/,
        /^https:\/\/localhost:/,
        'https://ecommerce-herrera.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001'
      ];
      
      const isAllowed = allowedOrigins.some(pattern => {
        if (typeof pattern === 'string') {
          return origin === pattern;
        }
        return pattern.test(origin);
      });
      
      if (isAllowed) {
        console.log('CORS: Origin allowed:', origin);
        return callback(null, true);
      }
      
      console.log('CORS: Origin rejected:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  
  // Set global prefix
  app.setGlobalPrefix('api');

  // Start server
  const port = process.env.PORT || 3101;
  const host = process.env.HOST || '0.0.0.0';
  
  await app.listen(port, host);
  console.log(`
🚀 Servidor corriendo en: http://${host}:${port}
📝 API docs disponible en: http://${host}:${port}/api
🌐 CORS habilitado para dominios .vercel.app y localhost
  `);
}

bootstrap().catch(error => {
  console.error('Error starting application:', error);
  process.exit(1);
});
