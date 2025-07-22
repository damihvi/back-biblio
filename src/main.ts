import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS for production - Permitir todos los dominios
  app.enableCors({
    origin: true, // Permitir todos los orígenes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  
  // Set global prefix
  app.setGlobalPrefix('api');

  // Start server
  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';
  
  await app.listen(port, host);
  console.log(`
🚀 Servidor corriendo en: http://${host}:${port}
📝 API docs disponible en: http://${host}:${port}/api
🌐 CORS habilitado para todos los dominios
  `);
}

bootstrap().catch(error => {
  console.error('Error starting application:', error);
  process.exit(1);
});
