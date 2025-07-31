import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { ModeToggle } from './mode-toggle'

export default function Footer() {
  return (
    <div className="text-xs p-2 text-center text-muted-foreground/60 flex items-center justify-center w-full">
      <p>
        Powered by {" "}
        <Link href="https://developer.chrome.com/docs/ai/built-in" target="_blank" rel="noopener noreferrer" className="font-bold inline-flex items-center underline">
          Built-in AI
          <ArrowUpRight className="size-2.5" />
        </Link>
        ,{" "}
        <Link href="https://v5.ai-sdk.dev" target="_blank" rel="noopener noreferrer" className="font-bold inline-flex items-center underline">
          Vercel AI SDK
          <ArrowUpRight className="size-2.5" />
        </Link>
        and {" "}
        <Link href="https://github.com/jakobhoeg/built-in-ai" target="_blank" rel="noopener noreferrer" className="font-bold inline-flex items-center underline">
          @built-in-ai/core
          <ArrowUpRight className="size-2.5" />
        </Link>
      </p>
    </div>
  )
}
