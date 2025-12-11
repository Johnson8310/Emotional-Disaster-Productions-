import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { Music } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-balance">Emotional Disaster Productions</h1>
          </div>
          <p className="text-muted-foreground">Sign in to your workspace</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
