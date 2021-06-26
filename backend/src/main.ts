import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors')
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors())
  // app.setGlobalPrefix('/amit-backend'); // TODO uncomment in order to add global prefix (to all endpoints in the server)
  app.useGlobalPipes(new ValidationPipe({transform:true}));

  const config = new DocumentBuilder()
      .setTitle('BeeZee Swagger')
      .setDescription('Backend controller API')
      .setVersion('1.0')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(5000);

}
bootstrap();