import { doesBrowserSupportBuiltInAI } from "@built-in-ai/core"
import { Badge } from "./ui/badge";

const doesBrowserSupportBuiltIn = doesBrowserSupportBuiltInAI();

export default function BuiltInBadge() {
  return (
    <>
      {doesBrowserSupportBuiltIn ? (
        <Badge variant="outline" className="gap-1.5 text-emerald-400">
          <span
            className="size-1.5 rounded-full bg-emerald-400"
            aria-hidden="true"
          ></span>
          Using built-in-ai
        </Badge>
      ) : (
        <Badge variant="outline" className="gap-1.5 text-red-400">
          <span
            className="size-1.5 rounded-full bg-red-400"
            aria-hidden="true"
          ></span>
          Using server-side AI
        </Badge>
      )}
    </>
  )
}
