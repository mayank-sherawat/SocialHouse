// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import validator from "validator";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rawEmail = (body.email ?? "").toString().trim();
    const username = (body.username ?? "").toString().trim();
    const password = (body.password ?? "").toString();

    // required fields
    if (!rawEmail || !username || !password) {
      return NextResponse.json(
        { error: "email, username and password are required" },
        { status: 400 }
      );
    }

    // normalizeEmail can return string | false
    const normalized = validator.normalizeEmail(rawEmail, { gmail_remove_dots: false });

    // if normalizeEmail returns false, treat as invalid (strict)
    if (normalized === false) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // now email is guaranteed to be a string
    const email = normalized || rawEmail.toLowerCase();

    // strict email check
    const isValidEmail = validator.isEmail(email, {
      allow_display_name: false,
      require_tld: true,
      allow_utf8_local_part: false,
      allow_ip_domain: false,
    });

    if (!isValidEmail) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (email.length > 254) {
      return NextResponse.json({ error: "Email too long" }, { status: 400 });
    }

    // validate username: 3-30 chars, letters/numbers/_.-
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-30 chars (letters, numbers, _ . -)" },
        { status: 400 }
      );
    }

    // password length
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // check duplicates (email and username)
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return NextResponse.json({ error: "User with this email or username already exists" }, { status: 409 });
    }

    // hash and create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: hashed },
      select: { id: true, email: true, username: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Signup error:", message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
