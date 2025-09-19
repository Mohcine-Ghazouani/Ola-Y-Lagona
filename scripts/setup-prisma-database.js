const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Setting up Prisma database...")

try {
  // Check if prisma directory exists
  if (!fs.existsSync("prisma")) {
    console.error("❌ Prisma directory not found. Make sure prisma/schema.prisma exists.")
    process.exit(1)
  }

  // Generate Prisma client
  console.log("📦 Generating Prisma client...")
  execSync("npx prisma generate", { stdio: "inherit" })

  // Push database schema (creates tables)
  console.log("🗄️  Pushing database schema...")
  execSync("npx prisma db push", { stdio: "inherit" })

  // Run seed script
  console.log("🌱 Seeding database...")
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" })

  console.log("✅ Database setup completed successfully!")
  console.log("📊 You can view your database with: npx prisma studio")
} catch (error) {
  console.error("❌ Database setup failed:", error.message)
  process.exit(1)
}
