'use client'

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
}

interface CourseBreadcrumbProps {
  items: BreadcrumbItem[]
}

export function CourseBreadcrumb({ items }: CourseBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link 
        href="/dashboard/courses" 
        className="flex items-center gap-1 transition-colors hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        <span>Cursos</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {index === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link 
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
