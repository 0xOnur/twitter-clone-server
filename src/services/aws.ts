import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

dotenv.config();

interface IProps {
  file: Express.Multer.File;
  folder: string
}

// S3 Client
const s3 = new S3Client({
  endpoint: process.env.SPACE_ENDPOINT,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!,
  },
});

// File upload
export const uploadFile = async ({ file, folder }: IProps) => {
  try {
    const params = {
      Bucket: process.env.SPACES_BUCKET_NAME!,
      Key: `${folder}/${uuidv4()}-${file.originalname}`,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    const data = await s3.send(command);
    if(data.$metadata.httpStatusCode === 200) {
      return {
        url: `https://${process.env.SPACES_BUCKET_NAME}.${process.env.AWS_REGION}.digitaloceanspaces.com/${params.Key}`,
        data
      };
    }
  } catch (error: any) {
    console.log(error.message);
  }
};

// File delete
export const deleteFile = async (path: string) => {
  try {
    const params = {
      Bucket: process.env.SPACES_BUCKET_NAME!,
      Key: path,
    };
    const command = new DeleteObjectCommand(params);
    const data = await s3.send(command);
    console.log(data);
  } catch (error:any) {
    console.log(error.message);
  }
};