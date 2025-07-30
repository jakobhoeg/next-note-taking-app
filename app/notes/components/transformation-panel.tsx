"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { RECORDING_TYPES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, WandSparkles } from "lucide-react";

export function TransformDropdown({
  onTransform,
  isStreaming = false,
}: {
  onTransform: (type: string) => void;
  isStreaming?: boolean;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild disabled={isStreaming}>
        <Button
          disabled={isStreaming}
          className="flex-1"
          size="lg"
        >
          <WandSparkles className="size-4 mr-1" />
          <span>{isStreaming ? "Streaming..." : "Transform"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="!p-0">
        {RECORDING_TYPES.map((type) => (
          <DropdownMenuItem
            key={type.value}
            onSelect={() => onTransform(type.value)}
            className="flex items-center cursor-pointer h-10 border-b min-w-80 max-w-full "
          >
            <span>{type.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 