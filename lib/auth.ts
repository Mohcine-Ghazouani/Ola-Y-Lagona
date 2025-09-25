import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "./prisma"
import type { User as PrismaUser, Role } from "@prisma/client"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface User {
  id: number
  email: string
  role: "admin" | "client"
  name: string
  phone?: string
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  error?: string
}

function convertPrismaUser(prismaUser: PrismaUser): User {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    role: prismaUser.role.toLowerCase() as "admin" | "client",
    name: prismaUser.name,
    phone: prismaUser.phone || undefined,
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })
}

// Verify JWT token
export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    }
  } catch {
    return null
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return { success: false, error: "Invalid password" }
    }

    const userInfo = convertPrismaUser(user)
    const token = generateToken(userInfo)

    return { success: true, user: userInfo, token }
  } catch (error) {
    return { success: false, error: "Login failed" }
  }
}

// Register user
export async function registerUser(
  email: string,
  password: string,
  name: string,
  phone?: string,
  role?: "admin" | "client",
): Promise<AuthResult> {
  try {
    const hashedPassword = await hashPassword(password)

    // Check if this is the first user (users table is empty)
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0
    
    // If no role is specified, assign admin to first user, client to others
    const userRole = role || (isFirstUser ? "admin" : "client")

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: userRole.toUpperCase() as Role,
        name,
        ...(phone && phone.trim() !== "" ? { phone } : {}),
      },
    })

    const userInfo = convertPrismaUser(user)
    const token = generateToken(userInfo)

    return { success: true, user: userInfo, token }
  } catch (error: any) {
    console.error("registerUser error:", error)
    if (error.code === "P2002") {
      // Prisma unique constraint error
      if (error.meta?.target?.includes("email")) {
        return { success: false, error: "Email already exists" }
      }
      if (error.meta?.target?.includes("phone")) {
        return { success: false, error: "Phone already exists" }
      }
      return { success: false, error: "Unique constraint violation" }
    }
    return { success: false, error: error?.message || "Registration failed" }
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
      },
    })

    return user ? convertPrismaUser(user as PrismaUser) : null
  } catch {
    return null
  }
}
