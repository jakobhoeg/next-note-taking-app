"use client"

import { RecordingModal } from "@/components/recording-modal"
import { UploadModal } from "@/components/upload-modal"
import { Button } from "@/components/ui/button"
import { useNotes } from "@/app/hooks/useNotes"
import { ArrowUpRight, Mic2, Upload } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Footer from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"
import MainSkeleton from "./notes/components/list-skeleton"
import ListSkeleton from "./notes/components/list-skeleton"

export default function Home() {
  const { notes, isLoading } = useNotes()
  const [isRecordingModalOpen, setRecordingModalOpen] = useState(false)
  const [isUploadModalOpen, setUploadModalOpen] = useState(false)

  const handleNewNote = () => {
    setRecordingModalOpen(true)
  }

  const handleOpenRecordingModal = () => {
    setRecordingModalOpen(true)
  }

  const handleCloseRecordingModal = () => {
    setRecordingModalOpen(false)
  }

  const handleOpenUploadModal = () => {
    setUploadModalOpen(true)
  }

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && (e.code === "Space" || e.key === " " || e.key === "Spacebar")) {
        e.preventDefault()
        handleNewNote()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div className="flex flex-col h-full w-full">

      <div className="p-4 flex items-center w-full max-w-4xl mx-auto ">
        <h1 className="text-2xl font-bold">My Notes</h1>
      </div>

      {!isLoading ? (
        <main className="flex-1 px-4 overflow-y-auto w-full max-w-4xl mx-auto">
          {notes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">You don't have any notes yet. Start by creating a new one!</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notes.map((note) => (
                <li key={note.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Link href={`/notes/${note.id}`}>
                    <h2 className="font-semibold">{note.title}</h2>
                    <p className="text-sm text-muted-foreground">{note.preview}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      ) : (
        <ListSkeleton />
      )}

      <div className="pt-6 pb-2 border-t bg-background w-full flex flex-col gap-2">
        <div className="flex px-4 gap-3 w-full max-w-4xl mx-auto">
          <Button size="lg" onClick={handleOpenRecordingModal} className="flex-1">
            <Mic2 className="size-4 mr-1" />
            New note
          </Button>
          <Button size="lg" onClick={handleOpenUploadModal} variant="secondary" className="flex-1">
            <Upload className="size-4 mr-1" />
            Upload file
          </Button>
        </div>
        <Footer />
      </div>

      {isRecordingModalOpen && <RecordingModal onClose={handleCloseRecordingModal} />}
      {isUploadModalOpen && <UploadModal onClose={handleCloseUploadModal} />}
    </div>
  )
}
