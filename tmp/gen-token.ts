import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode("adx-dev-secret-change-me-in-production");

async function run() {
  const token = await new SignJWT({
    id: 1,
    name: "Antigravity",
    email: "antigravity@admissionx.com",
    role: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(SECRET);

  console.log(token);
  process.exit(0);
}

run();
