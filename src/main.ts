import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Modificar para garantir que a Railway possa injetar a porta correta
  const port = Number(process.env.PORT) || 3000;
  
  // Adicionar host '0.0.0.0' para permitir conexões externas
  await app.listen(port, '0.0.0.0');
  console.log(`Aplicação rodando na porta ${port}`);
}
bootstrap();
