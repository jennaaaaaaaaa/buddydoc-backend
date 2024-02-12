import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';



export function setupSwagger(app:INestApplication):void{
const config = new DocumentBuilder()
.setTitle('buddyDoc')
.setDescription('buddyDoc API description')
.setVersion('0.1')
.build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api',app,document);

}