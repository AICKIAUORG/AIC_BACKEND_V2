import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function SwaggerConfig(app : INestApplication) : void{
    const document = new DocumentBuilder()
    .setVersion('1.0.0')
    .setTitle("AIC Website")
    .addTag("Auth", "Authentication endpoints")
    .addBearerAuth(swaggerAuthConfig(), "Authorization")
    .build()
    const swaggerDocument = SwaggerModule.createDocument(app , document)
    SwaggerModule.setup("/swagger" , app , swaggerDocument)

}
function swaggerAuthConfig() : SecuritySchemeObject {
    return{
        type : "http",
        bearerFormat : "JWT",
        in : "header",
        scheme : "bearer",
        description: "Enter your JWT token in the format: Bearer <token>"
    }
}