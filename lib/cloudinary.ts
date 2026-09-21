import { v2 as cloudinary } from "cloudinary";

// Trimmed because a value pasted into .env.local or the Vercel dashboard with a
// stray space authenticates as a different cloud ("cloud_name mismatch").
cloudinary.config({
    cloud_name: String(process.env.CLOUDINARY_NAME || "").trim(),
    api_key: String(process.env.CLOUDINARY_KEY || "").trim(),
    api_secret: String(process.env.CLOUDINARY_SECRET || "").trim(),
    secure: true,
});

// Everything this app uploads lives under one root, so it can never write over
// or delete assets that belong to anything else in the same Cloudinary account.
export const CLOUDINARY_ROOT = "amazon-clone";

export const uploadBuffer = (buffer: Buffer, folder: string) =>
    new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: `${CLOUDINARY_ROOT}/${folder}`, resource_type: "image" },
            (error, result) => (error ? reject(error) : resolve(result))
        );

        stream.end(buffer);
    });

export const destroyAsset = (publicId: string) => cloudinary.uploader.destroy(publicId);

export default cloudinary;
