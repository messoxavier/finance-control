import "dotenv/config";

const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d"
};

if (!env.DATABASE_URL) {
  console.warn("[warn] DATABASE_URL não definido no .env");
}

export default env;
