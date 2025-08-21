import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthUser {
  userId: string;
  email: string;
}

export async function verifyAuth(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const authorization = request.headers.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return null;
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
      userId: string;
      email: string;
    };

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

export function createAuthResponse() {
  return {
    error: "Authentication required",
    status: 401,
  };
}
