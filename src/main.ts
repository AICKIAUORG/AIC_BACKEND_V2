import { NestFactory } from "@nestjs/core";
import { SwaggerConfig } from "./config/swagger.config";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./module/app/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  SwaggerConfig(app);
  const { PORT } = process.env;
  await app.listen(PORT, () => {
    console.log(`server run on http://localhost:${PORT}/swagger`);
  });
}
bootstrap();
 