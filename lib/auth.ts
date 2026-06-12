import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ── Secret ────────────────────────────────────────────────────────────────────
const FALLBACK_SECRET = "adx-dev-secret-change-me-in-production";
const JWT_ISSUER = "admissionx";
const JWT_AUDIENCE = "admissionx-web";

function getSecret() {
  const rawSecret = process.env.JWT_SECRET ?? FALLBACK_SECRET;
  if (process.env.NODE_ENV === "production" && rawSecret === FALLBACK_SECRET) {
    throw new Error("JWT_SECRET must be set in production.");
  }
  return new TextEncoder().encode(rawSecret);
}

const SECRET = getSecret();

// ── Cookie Names ──────────────────────────────────────────────────────────────
export const STUDENT_COOKIE = "adx_student";
export const COLLEGE_COOKIE = "adx_college";
export const ADMIN_COOKIE = "adx_admin";

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT
// ─────────────────────────────────────────────────────────────────────────────
export interface StudentTokenPayload extends JWTPayload {
  id: string;
  name: string;
  email: string;
  role: "student";
}

export async function signStudentToken(
  data: Omit<StudentTokenPayload, keyof JWTPayload>,
): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyStudentToken(
  token: string,
): Promise<StudentTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload as StudentTokenPayload;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLEGE
// ─────────────────────────────────────────────────────────────────────────────
export interface CollegeTokenPayload extends JWTPayload {
  id: string;
  name: string;
  email: string;
  role: "college";
}

export async function signCollegeToken(
  data: Omit<CollegeTokenPayload, keyof JWTPayload>,
): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyCollegeToken(
  token: string,
): Promise<CollegeTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload as CollegeTokenPayload;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────
export interface AdminTokenPayload extends JWTPayload {
  id: string;
  name: string;
  email: string;
  role: "admin";
  adminRole?: "super_admin" | "role_admin" | "role_counsellor";
}

export async function signAdminToken(
  data: Omit<AdminTokenPayload, keyof JWTPayload>,
): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(SECRET);
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — shared cookie config
// ─────────────────────────────────────────────────────────────────────────────
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
