import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Types } from "mongoose";

export interface TokenPayload {
  userId: string;
  role: string;
}

export function signAccessToken(userId: Types.ObjectId | string, role: string): string {
  return jwt.sign({ userId: String(userId), role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: Types.ObjectId | string, role: string): string {
  return jwt.sign({ userId: String(userId), role }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
}
