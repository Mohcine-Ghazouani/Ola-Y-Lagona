import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)

  await prisma.user.upsert({
    where: { email: "admin@kitedakhla.com" },
    update: {},
    create: {
      email: "admin@kitedakhla.com",
      passwordHash: hashedPassword,
      role: "ADMIN",
      name: "Admin User",
      phone: "+212-123-456-789",
    },
  })

  // Create sample courses
  await prisma.course.createMany({
    data: [
      {
        name: "Beginner Kitesurfing",
        description: "Learn the basics of kitesurfing with our certified instructors. Perfect for first-time riders.",
        price: 120.0,
        durationHours: 3,
        maxParticipants: 6,
        imageUrl: "/kitesurfing-action-shot.jpg",
      },
      {
        name: "Advanced Kitesurfing",
        description: "Take your kitesurfing skills to the next level with advanced techniques and tricks.",
        price: 180.0,
        durationHours: 4,
        maxParticipants: 4,
        imageUrl: "/kitesurfing-in-dakhla-lagoon-with-blue-water-and-d.jpg",
      },
      {
        name: "Kite Buggy Adventure",
        description: "Experience the thrill of land-based kiting with our kite buggy sessions.",
        price: 90.0,
        durationHours: 2,
        maxParticipants: 8,
        imageUrl: "/kite-buggy-on-beach.jpg",
      },
      {
        name: "Kite Landboarding",
        description: "Master the art of landboarding with professional guidance and safety equipment.",
        price: 100.0,
        durationHours: 2,
        maxParticipants: 6,
        imageUrl: "/kite-landboarding.jpg",
      },
    ],
  })

  // Create sample activities
  await prisma.activity.createMany({
    data: [
      {
        name: "Paddleboard Rental",
        description: "Explore the calm waters of Dakhla lagoon with our premium paddleboards.",
        price: 40.0,
        durationHours: 2,
        equipmentIncluded: true,
        imageUrl: "/paddleboarding-in-calm-lagoon.jpg",
      },
      {
        name: "Sunset Kitesurfing",
        description: "Experience magical sunset sessions on the water with breathtaking views.",
        price: 150.0,
        durationHours: 2,
        equipmentIncluded: true,
        imageUrl: "/kitesurfing-action-shot.jpg",
      },
      {
        name: "Photography Session",
        description: "Professional action photography during your kite sports activities.",
        price: 80.0,
        durationHours: 1,
        equipmentIncluded: false,
        imageUrl: "/professional-kite-instructor-portrait.jpg",
      },
      {
        name: "Equipment Rental",
        description: "Full day rental of professional kite sports equipment.",
        price: 60.0,
        durationHours: 8,
        equipmentIncluded: true,
        imageUrl: "/kitesurfing-action-shot.jpg",
      },
    ],
    //skipDuplicates: true,
  })

  // Create sample gallery images
  await prisma.gallery.createMany({
    data: [
      {
        title: "Epic Kitesurfing Session",
        description: "Amazing kitesurfing action in Dakhla lagoon",
        imageUrl: "/kitesurfing-in-dakhla-lagoon-with-blue-water-and-d.jpg",
        category: "KITESURFING",
        isFeatured: true,
      },
      {
        title: "Kite Buggy Fun",
        description: "Thrilling kite buggy adventure on the beach",
        imageUrl: "/kite-buggy-on-beach.jpg",
        category: "KITE_BUGGY",
        isFeatured: true,
      },
      {
        title: "Landboarding Action",
        description: "Professional landboarding techniques",
        imageUrl: "/kite-landboarding.jpg",
        category: "KITE_LANDBOARD",
        isFeatured: false,
      },
      {
        title: "Happy Clients",
        description: "Our satisfied customers enjoying their lessons",
        imageUrl: "/professional-kite-instructor-portrait.jpg",
        category: "CLIENTS",
        isFeatured: true,
      },
      {
        title: "Peaceful Paddleboarding",
        description: "Serene paddleboard session at sunset",
        imageUrl: "/paddleboarding-in-calm-lagoon.jpg",
        category: "PADDLEBOARD",
        isFeatured: false,
      },
    ],
    //skipDuplicates: true,
  })

  console.log("Database seeded successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
