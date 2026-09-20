import jwt from "jsonwebtoken";

export const createActivationToken = (payload: any) =>
    jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET as string, { expiresIn: "2d" });

export const passwordResetToken = (payload: any) =>
    jwt.sign(payload, process.env.EMAIL_TOKEN_SECRET as string, { expiresIn: "6h" });
