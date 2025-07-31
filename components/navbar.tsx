"use client"

import { Undo2 } from "lucide-react"
import { usePathname } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "./mode-toggle"
import Link from "next/link"
import dynamic from "next/dynamic"

const BuiltInBadge = dynamic(() => import('./built-in-badge'), {
  ssr: false
})

export default function Navbar() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <header className="px-4 md:px-6">
      <div className="flex h-16 justify-between items-center gap-4">
        {/* Left side */}
        {!isHomePage && (
          <Link
            href="/"
            className="flex justify-center"
          >
            <Undo2 className="size-5 mr-2" />
            <span className="text-sm hidden sm:flex">Go back</span>
          </Link>
        )}
        <div className="flex gap-2" />
        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BuiltInBadge />
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
