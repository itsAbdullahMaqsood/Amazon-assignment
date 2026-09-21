import { NextResponse } from "next/server";

import { currentUser, isAdmin, requireAdmin } from "@/lib/guard";
import { CLOUDINARY_ROOT, destroyAsset, uploadBuffer } from "@/lib/cloudinary";

const MAX_FILES = 10;
const MAX_BYTES = 5 * 1024 * 1024;

// The declared MIME type is whatever the browser (or a script) says it is, so
// the first bytes of the file are checked against the format they claim.
const SIGNATURES: Record<string, (bytes: Uint8Array) => boolean> = {
    "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
    "image/png": (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
    "image/webp": (b) =>
        String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
        String.fromCharCode(...b.slice(8, 12)) === "WEBP",
};

// Only two destination trees exist. products/ is catalogue imagery and needs an
// admin; reviews/ is shopper photos and needs any signed-in account.
const FOLDER = /^(products|reviews)(\/[a-z0-9_-]{1,64}){0,3}$/i;

const bad = (message: string) => NextResponse.json({ message }, { status: 400 });

export const POST = async (request: Request) => {
    try {
        const who = await currentUser();

        if (!who) {
            return NextResponse.json({ message: "Please sign in to upload images." }, { status: 401 });
        }

        const form = await request.formData();
        const path = String(form.get("path") || "").trim();

        if (!FOLDER.test(path)) {
            return bad("Uploads must go to a products/ or reviews/ folder.");
        }

        if (path.startsWith("products") && !isAdmin(who)) {
            return NextResponse.json(
                { message: "Only admins can upload product images." },
                { status: 403 }
            );
        }

        const files = form.getAll("file").filter((entry): entry is File => typeof entry !== "string");

        if (files.length === 0) {
            return bad("Choose at least one image to upload.");
        }

        if (files.length > MAX_FILES) {
            return bad(`You can upload up to ${MAX_FILES} images at a time.`);
        }

        // Every file is read and checked before anything is sent to Cloudinary,
        // so one bad file rejects the whole request instead of half of it.
        const checked: Buffer[] = [];

        for (const file of files) {
            if (!SIGNATURES[file.type]) {
                return bad(`"${file.name}" is not a JPEG, PNG or WebP image.`);
            }

            if (file.size > MAX_BYTES) {
                return bad(`"${file.name}" is larger than 5 MB.`);
            }

            const buffer = Buffer.from(await file.arrayBuffer());

            if (!SIGNATURES[file.type](new Uint8Array(buffer.subarray(0, 12)))) {
                return bad(`"${file.name}" is not really a ${file.type.replace("image/", "").toUpperCase()} file.`);
            }

            checked.push(buffer);
        }

        const uploaded: any[] = [];

        try {
            for (const buffer of checked) {
                uploaded.push(await uploadBuffer(buffer, path));
            }
        } catch (error: any) {
            // Roll back whatever made it up before the failure.
            await Promise.allSettled(uploaded.map((result) => destroyAsset(result.public_id)));
            throw error;
        }

        return NextResponse.json(
            uploaded.map((result) => ({ url: result.secure_url, public_url: result.public_id }))
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || "Upload failed." },
            { status: 500 }
        );
    }
};

export const DELETE = async (request: Request) => {
    try {
        const { error } = await requireAdmin();

        if (error) {
            return error;
        }

        const { public_id } = await request.json();
        const id = String(public_id || "");

        // Never reaches outside this app's own folder in the Cloudinary account.
        if (!id.startsWith(`${CLOUDINARY_ROOT}/`)) {
            return bad("That image does not belong to this store.");
        }

        const result = await destroyAsset(id);

        return NextResponse.json({ result: result.result });
    } catch (error: any) {
        return NextResponse.json({ message: error?.message || "Delete failed." }, { status: 500 });
    }
};
