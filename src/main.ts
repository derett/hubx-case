import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import * as pc from 'picocolors';

import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(helmet());
  app.use(compression());
  app.useLogger(app.get(Logger));

  const config = new DocumentBuilder()
    .setTitle('Hubx Case Study')
    .setDescription('API Service for Books and Authors')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  await app.listen(process.env.PORT, process.env.HOST, () => {
    console.log(
      `${pc.blue(pc.bold(`[PID: ${process.pid}]`))} ${pc.green(
        pc.bold('✓'),
      )} Server is running on port ${pc.white(
        pc.bold(process.env.PORT),
      )} in production mode`,
    );

    console.log(
      `${pc.blue(pc.bold(`[PID: ${process.pid}]`))} ${pc.green(
        pc.bold('✓'),
      )} Server is running on http://${pc.white(pc.bold(process.env.REMOTE))}:${pc.white(pc.bold(process.env.PORT))}`,
    );
    console.log(
      `${pc.blue(pc.bold(`[PID: ${process.pid}]`))} ${pc.green(
        pc.bold('✓'),
      )} Access Docs: http://${process.env.REMOTE}:${process.env.PORT}/doc`,
    );
  });
}
bootstrap();
