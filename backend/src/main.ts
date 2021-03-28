import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const cors = require('cors')
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors())
  // app.setGlobalPrefix('/amit-backend'); // TODO uncomment in order to add global prefix (to all endpoints in the server)
  app.useGlobalPipes(new ValidationPipe({transform:true}));

  const config = new DocumentBuilder()
      .setTitle('Amit swagger')
      .setDescription('The Chong API description')
      .setVersion('1.0')
      .addTag('amit swagger')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(5000);
}
bootstrap();