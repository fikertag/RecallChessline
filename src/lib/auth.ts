import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { JWTPayload, User } from "@/types/auth";
import { connectDB, localDb } from "@/lib/db";
import { UserModel } from "@/models/User";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "chess-opening-repertoire-super-secret-key-32-chars-minimum"
);
const SESSION_COOKIE_NAME = "learnchess_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value || null;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload || !payload.userId) return null;

  const { isFallback } = await connectDB();

  if (!isFallback) {
    try {
      const user = await UserModel.findById(payload.userId).lean();
      if (user) {
        return {
          _id: String(user._id),
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerified,
          preferences: user.preferences,
          createdAt: (user as unknown as Record<string, unknown>).createdAt ? new Date((user as unknown as Record<string, unknown>).createdAt as string).toISOString() : new Date().toISOString(),
          updatedAt: (user as unknown as Record<string, unknown>).updatedAt ? new Date((user as unknown as Record<string, unknown>).updatedAt as string).toISOString() : new Date().toISOString(),
        };
      }
    } catch {
      // Fallback to localDb
    }
  }

  // Local fallback
  const user = localDb.collection<User & { passwordHash: string }>("users").findById(payload.userId);
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    preferences: user.preferences,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
