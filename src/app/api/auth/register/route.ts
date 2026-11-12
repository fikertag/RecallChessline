import { NextResponse } from "next/server";
import { connectDB, localDb } from "@/lib/db";
import { UserModel } from "@/models/User";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { createStarterStudies } from "@/lib/starter-studies";
import { StudyModel } from "@/models/Study";
import { Study } from "@/types/chess";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { isFallback } = await connectDB();

    let existingUser = null;
    if (!isFallback) {
      try {
        existingUser = await UserModel.findOne({ email: normalizedEmail }).lean();
      } catch {
        // Fallback
      }
    }

    if (!existingUser) {
      existingUser = localDb.collection<{ _id: string; email: string }>("users").findOne({ email: normalizedEmail });
    }

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const userId = "usr_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
    const now = new Date().toISOString();

    const newUserObj = {
      _id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      emailVerified: true,
      preferences: {
        boardTheme: "classic" as const,
        pieceSet: "standard" as const,
        soundEnabled: true,
        showCoordinates: true,
        autoFlip: true,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Save user
    if (!isFallback) {
      try {
        await UserModel.create(newUserObj);
      } catch {
        localDb.collection("users").create(newUserObj);
      }
    } else {
      localDb.collection("users").create(newUserObj);
    }

    // Seed starter studies
    const starterStudies = createStarterStudies(userId);
    for (const study of starterStudies) {
      if (!isFallback) {
        try {
          await StudyModel.create(study);
        } catch {
          localDb.collection<Study>("studies").create(study);
        }
      } else {
        localDb.collection<Study>("studies").create(study);
      }
    }

    const token = await createSessionToken({
      userId,
      email: normalizedEmail,
      name: newUserObj.name,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        _id: userId,
        name: newUserObj.name,
        email: newUserObj.email,
        preferences: newUserObj.preferences,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

