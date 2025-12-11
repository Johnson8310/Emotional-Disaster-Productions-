import { cookies } from "next/headers"
import { verifyToken } from "./jwt"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")

  if (!token) {
    return null
  }

  const payload = await verifyToken(token.value)
  return payload
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}
