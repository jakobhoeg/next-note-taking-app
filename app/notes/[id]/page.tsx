"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useNotes } from "@/app/hooks/useNotes"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AutosizeTextarea } from "@/components/ui/auto-size-text-area"
import { TransformDropdown } from "../components/transformation-panel"
import { builtInAI, doesBrowserSupportBuiltInAI } from "@built-in-ai/core"
import { streamText } from "ai"
import { cn, generateTransformationPrompt } from "@/lib/utils"
import { CustomMarkdown } from "@/components/ui/markdown"
import Footer from "@/components/footer"
import { Trash2, Undo2 } from "lucide-react"
import { useDbLoading } from "@/app/pglite-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import NoteSkeleton from "@/components/note-skeleton"

const DELAY_SAVE = 1000

export default function NotePage() {
  const router = useRouter()
  const params = useParams()
  const { updateNote, deleteNote, useNoteQuery } = useNotes()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const { data: note, isLoading } = useNoteQuery(id ?? "")
  const { isDbReady } = useDbLoading()

  const [editableTitle, setEditableTitle] = useState("")
  const [editableContent, setEditableContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [preTransformationContent, setPreTransformationContent] = useState("")
  const [isTransformationPendingConfirmation, setIsTransformationPendingConfirmation] = useState(false)

  const titleDebounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const contentDebounceTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (note) {
      setEditableTitle(note.title)
      setEditableContent(note.content)
    }
  }, [note])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setEditableTitle(newTitle)
    if (titleDebounceTimeout.current) {
      clearTimeout(titleDebounceTimeout.current)
    }
    titleDebounceTimeout.current = setTimeout(async () => {
      if (note && newTitle !== note.title) {
        await updateNote({ id: note.id, updates: { title: newTitle } })
        toast.success("Title updated!")
      }
    }, DELAY_SAVE)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setEditableContent(newContent)
    if (isTransformationPendingConfirmation) {
      setIsTransformationPendingConfirmation(false)
    }
    if (contentDebounceTimeout.current) {
      clearTimeout(contentDebounceTimeout.current)
    }
    contentDebounceTimeout.current = setTimeout(async () => {
      if (note && newContent !== note.content) {
        await updateNote({
          id: note.id,
          updates: { content: newContent },
        })
        toast.success("Note saved!")
      }
    }, DELAY_SAVE)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent)
    toast.success("Copied to clipboard!")
  }

  const handleDelete = async () => {
    if (note) {
      try {
        await deleteNote(note.id)
        toast.success("Note deleted successfully.")
        router.push("/")
      } catch (error) {
        console.error("Error deleting note:", error)
        toast.error("Failed to delete note.")
      }
    }
  }

  const handleSaveTransformation = () => {
    setIsTransformationPendingConfirmation(false)
    if (contentDebounceTimeout.current) {
      clearTimeout(contentDebounceTimeout.current)
    }
    if (note && editableContent !== note.content) {
      updateNote({
        id: note.id,
        updates: { content: editableContent },
      })
      toast.success("Note saved!")
    }
  }

  const handleRejectTransformation = () => {
    setEditableContent(preTransformationContent)
    setIsTransformationPendingConfirmation(false)
  }

  const handleTransform = async (typeName: string) => {
    if (!doesBrowserSupportBuiltInAI()) {
      toast.error("Your browser does not support built-in AI.")
      return
    }

    const model = builtInAI()
    const availability = await model.availability()

    if (availability === "unavailable") {
      toast.error("Built-in AI is not available on your device.")
      return
    }

    if (availability === "downloadable") {
      toast.info("Downloading model...")
      await model.createSessionWithProgress((progress) => {
        toast.loading(`Downloading model... ${Math.round(progress * 100)}%`)
      })
      toast.success("Model downloaded.")
    }

    const prompt = generateTransformationPrompt(typeName, editableContent)

    try {
      setPreTransformationContent(editableContent)
      const { textStream } = streamText({
        model,
        prompt,
      })
      setIsStreaming(true)
      setEditableContent("")
      for await (const chunk of textStream) {
        setEditableContent((prev) => prev + chunk)
      }
    } catch (error) {
      console.error("Error transforming text:", error)
      toast.error("Failed to transform text.")
    } finally {
      setIsStreaming(false)
      setIsTransformationPendingConfirmation(true)
    }
  }

  if (isDbReady && !isLoading && !note) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Note not found</h1>
          <Link href="/" className="text-blue-200 hover:text-blue-300 underline">
            Back to notes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 flex items-center w-full max-w-4xl mx-auto ">
        {isLoading || !isDbReady ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <input
            className="text-2xl font-bold bg-transparent border-none outline-none w-full"
            value={editableTitle}
            onChange={handleTitleChange}
            aria-label="Edit title"
            spellCheck={true}
          />
        )}
      </div>

      <main className="flex-1 overflow-y-auto  p-4 w-full max-w-4xl mx-auto">
        {!isDbReady || isLoading ? (
          <NoteSkeleton />
        ) : (
          <div className="flex-1 h-full relative">
            {isStreaming || isTransformationPendingConfirmation ? (
              <div
                className={cn(
                  "whitespace-pre-line rounded p-2",
                  isStreaming && "animate-pulse disabled:opacity-100",
                  isTransformationPendingConfirmation && "border-2 border-primary-foreground bg-muted/10 animate-pulse",
                )}
              >
                <CustomMarkdown>{editableContent}</CustomMarkdown>
              </div>
            ) : (
              <AutosizeTextarea
                className="whitespace-pre-line rounded focus:outline-none resize-none p-0"
                value={editableContent}
                onChange={handleContentChange}
                spellCheck={true}
                aria-label="Edit transcription"
              />
            )}
            {isTransformationPendingConfirmation && (
              <div className="absolute top-0 right-0 p-2">
                <div className="border bg-white/10 backdrop-blur-md rounded-lg p-3 flex gap-3 items-center">
                  <Button size="sm" onClick={handleSaveTransformation}>
                    Accept
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleRejectTransformation}>
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="pt-6 pb-2 border-t bg-background w-full flex flex-col gap-2">
        <div className="flex px-4 gap-3 w-full max-w-4xl mx-auto">
          <TransformDropdown onTransform={handleTransform} isStreaming={isStreaming} />
          <Button size="lg" variant="secondary" onClick={handleDelete} className="flex-1">
            <Trash2 className="size-4 mr-1" />
            Delete
          </Button>
        </div>
        <Footer />
      </div>

    </div>
  )
}
