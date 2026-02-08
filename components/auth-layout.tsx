import React from "react"
import Link from "next/link"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <Link href="/" className="flex flex-col items-center space-y-3">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sc-Photoroom-dyXvi00u3VQhtKjUqhzpGXU13MJGbc.png" 
              alt="DigiCash Academy" 
              className="h-24 w-24 object-contain"
            />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              DigiCash Academy
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
