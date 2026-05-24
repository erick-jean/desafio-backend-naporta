import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Desafio Backend naPorta')
    .setDescription(
      'API REST para gerenciamento de pedidos, com autenticação JWT, filtros, CRUD completo e exclusão lógica.',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Informe o token JWT',
      in: 'header',
    })
    .build();

  const options: SwaggerCustomOptions = {
    ui: true, // Swagger UI is enabled
    raw: ['json'], // JSON API definition is still accessible (YAML is disabled)
  };

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, options);

  // Obtém o ConfigService para acessar as variáveis de ambiente
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
}
bootstrap();
