import { NextResponse } from "next/server";
import { connectDB, localDb } from "@/lib/db";
import { UserModel } from "@/models/User";
import { comparePassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { isFallback } = await connectDB();

    let user: { _id: string; name: string; email: string; passwordHash: string; preferences?: unknown } | null = null;

    if (!isFallback) {
      try {
        const u = await UserModel.findOne({ email: normalizedEmail }).lean();
        if (u) {
          user = {
            _id: String(u._id),
            name: u.name,
            email: u.email,
            passwordHash: u.passwordHash,
            preferences: u.preferences,
          };
        }
      } catch {
        // Fallback
      }
    }

    if (!user) {
      user = localDb.collection<{ _id: string; name: string; email: string; passwordHash: string; preferences?: unknown }>("users").findOne({ email: normalizedEmail });
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user._id,
      email: user.email,
      name: user.name,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

