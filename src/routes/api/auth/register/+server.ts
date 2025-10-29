import { json } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import bcrypt from "bcrypt";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return json({ error: "Email and password required" }, { status: 400 });
    }

    if (password.length < 8) {
      return json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return json({ error: "Email already in use" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
    });

    return json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Registration error:", error);
    return json({ error: "Registration failed" }, { status: 500 });
  }
};
