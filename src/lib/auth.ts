import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const key = new TextEncoder().encode(JWT_SECRET);

export interface JwtPayload {
    id: string;
    email: string;
    role: string;
    name?: string;
    [key: string]: any;
}

/**
 * Sign a payload into a JWT
 */
export async function signToken(payload: JwtPayload): Promise<string> {
    return await new SignJWT(payload as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 7 days expiration
        .sign(key);
}

/**
 * Verify a JWT and return the payload
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload as unknown as JwtPayload;
    } catch (e) {
        return null; // Invalid or expired token
    }
}

/**
 * Get the currently authenticated user payload from the request
 * Checks the HttpOnly cookie first, then falls back to Authorization Bearer header
 */
export async function getUserFromRequest(request: NextRequest): Promise<JwtPayload | null> {
    let token: string | undefined;

    // 1. Try to get token from Authorization header (For Mobile App / API Clients)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    // 2. Try to get token from cookies (For Web App)
    if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get('token')?.value;
    }

    if (!token) {
        return null;
    }

    return await verifyToken(token);
}
