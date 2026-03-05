import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ── Secret ────────────────────────────────────────────────────────────────────
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "adx-dev-secret-change-me-in-production"
);

// ── Cookie name used everywhere ───────────────────────────────────────────────
export const STUDENT_COOKIE = "adx_student";

// ── Token payload shape ───────────────────────────────────────────────────────
export interface StudentTokenPayload extends JWTPayload {
  id: number;
  name: string;
  email: string;
  role: "student";
}

// ── Sign ──────────────────────────────────────────────────────────────────────
export async function signStudentToken(
  data: Omit<StudentTokenPayload, keyof JWTPayload>
): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

// ── Verify ────────────────────────────────────────────────────────────────────
export async function verifyStudentToken(
  token: string
): Promise<StudentTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as StudentTokenPayload;
  } catch {
    return null;
  }
}
