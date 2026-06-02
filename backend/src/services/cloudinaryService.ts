import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import fs from "fs";
import path from "path";

export function initCloudinary(): void {
  if (env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
    });
  }
}

export async function uploadImage(buffer: Buffer, folder = "dehyde/products"): Promise<string> {
  // FALLBACK: If Cloudinary keys are missing, write file to local disk under public/uploads
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    const uploadDir = path.resolve("public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const extension = "jpg"; // default to jpg for buffer uploads
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    return `http://localhost:5000/uploads/${filename}`;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ quality: "auto", fetch_format: "auto" }] },
      (err, result) => {
        if (err || !result) reject(err || new Error("Upload failed"));
        else resolve(result!.secure_url);
      }
    );
    stream.end(buffer);
  });
}

