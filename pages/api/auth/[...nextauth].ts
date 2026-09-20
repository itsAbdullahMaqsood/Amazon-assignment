import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

import { handlers } from "@/auth";

// Auth.js v5 ships Web-standard Route Handlers that expect a NextRequest, so on
// the Pages Router the Node request/response pair has to be bridged by hand.
export const config = {
    api: { bodyParser: false },
};

const readBody = (req: NextApiRequest) =>
    new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });

const toWebRequest = async (req: NextApiRequest) => {
    const protocol = (req.headers["x-forwarded-proto"] as string) || "http";
    const url = new URL(req.url as string, `${protocol}://${req.headers.host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
        } else if (value !== undefined) {
            headers.set(key, value);
        }
    }

    const method = req.method || "GET";
    const body = method === "GET" || method === "HEAD" ? undefined : await readBody(req);

    return new NextRequest(url, { method, headers, body });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const method = (req.method || "GET").toUpperCase();

    if (method !== "GET" && method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        res.status(405).end();
        return;
    }

    const response = await handlers[method](await toWebRequest(req));

    res.status(response.status);
    response.headers.forEach((value, key) => {
        if (key === "set-cookie") {
            res.appendHeader("set-cookie", value);
        } else {
            res.setHeader(key, value);
        }
    });
    res.send(Buffer.from(await response.arrayBuffer()));
};

export default handler;
