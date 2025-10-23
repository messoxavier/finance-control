import { prisma } from "../config/prisma";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import env from "../config/env";

const JWT_SECRET: Secret = env.JWT_SECRET;
const JWT_OPTS: SignOptions = { expiresIn: env.JWT_EXPIRES_IN };

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw Object.assign(new Error("E-mail já cadastrado"), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash
      }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, JWT_OPTS);

    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.passwordHash) {
      throw Object.assign(new Error("Credenciais inválidas"), { status: 401 });
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw Object.assign(new Error("Credenciais inválidas"), { status: 401 });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, JWT_OPTS);

    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }
};
