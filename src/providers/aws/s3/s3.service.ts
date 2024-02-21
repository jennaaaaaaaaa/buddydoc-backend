// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// @Injectable()
// export class S3Service {
//   s3Client: S3Client;

//   constructor(private configService: ConfigService) {
//     this.s3Client = new S3Client({
//       region: this.configService.get('AWS_REGION'),
//       credentials: {
//         accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
//         secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
//       },
//     });
//   }

//   async imageUploadToS3(fileName: string, file: Express.Multer.File, ext: string) {
//     const command = new PutObjectCommand({
//       Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
//       Key: fileName,
//       Body: file.buffer,
//       ACL: 'public-read',
//       ContentType: `image/${ext}`,
//     });

//     await this.s3Client.send(command);
//     return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${fileName}`;
//   }
// }

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  getContentType(ext: string): string {
    const extensionMap = {
      '.jpg': 'image/jpeg',
      '.png': 'image/png',
      '.txt': 'text/plain',
      '.sql': 'application/sql',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // 추가적으로 필요한 확장자와 media type을 추가
    };

    return extensionMap[ext] || 'application/octet-stream';
  }

  async imageUploadToS3(fileName: string, file: Express.Multer.File, ext: string) {
    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Key: fileName,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: `image/${ext}`,
    });

    await this.s3Client.send(command);
    return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${fileName}`;
  }

  async fileUploadToS3(fileName: string, file: Express.Multer.File, ext: string) {
    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Key: fileName,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: this.getContentType(ext),
    });

    await this.s3Client.send(command);
    return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${fileName}`;
  }
}
