import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";


export async function isPasswordCorrect(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

export function generateAccessToken(user: { id: number; email: string; name: string }, role: "MANAGER" | "STAFF") {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name, role },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } as SignOptions
    );
}

export function generateRefreshToken(user: { id: number},role: "MANAGER" | "STAFF") {
    return jwt.sign(
        { id: user.id , role},
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } as SignOptions
    );
}