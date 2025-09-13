"use client"

import { RecordingModal } from "@/components/recording-modal"
import { UploadModal } from "@/components/upload-modal"
import { Button } from "@/components/ui/button"
import { useNotes } from "@/app/hooks/useNotes"
import { ArrowUpRight, BookPlus, Mic2, Upload } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Footer from "@/components/footer"
import ListSkeleton from "./notes/components/list-skeleton"
import { useRouter } from "next/navigation"

export default function Home() {
  const { notes, isLoading, addNote } = useNotes()
  const [isRecordingModalOpen, setRecordingModalOpen] = useState(false)
  const [isUploadModalOpen, setUploadModalOpen] = useState(false)
  const [isWriteNoteModalOpen, setWriteNoteModalOpen] = useState(false)
  const router = useRouter();

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

  const handleCreateNewNote = async () => {
    const newNote = await addNote({
      title: "My new note",
    });
    router.push(`/notes/${newNote.id}`);
  }

  const handleCloseWriteNewNoteModal = () => {
    setRecordingModalOpen(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && (e.code === "Space" || e.key === " " || e.key === "Spacebar")) {
        e.preventDefault()
        handleOpenRecordingModal()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div className="flex flex-col h-full w-full min-h-0">

      <div className="p-4 flex items-center justify-between w-full max-w-4xl mx-auto ">
        <h1 className="text-2xl font-bold">My Notes</h1>
        <Button onClick={handleCreateNewNote}>
          <BookPlus className="size-4 mr-1" />
          Write new note
        </Button>
      </div>

      {!isLoading ? (
        <main className="flex-1 px-4 overflow-y-auto w-full max-w-4xl mx-auto min-h-0 overflow-hidden">
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

      <div className="flex-shrink-0 pt-6 pb-2 border-t bg-background w-full flex flex-col gap-2">
        <div className="flex px-4 gap-3 w-full max-w-4xl mx-auto">
          <Button size="lg" onClick={handleOpenRecordingModal} className="flex-1">
            <Mic2 className="size-4 mr-1" />
            Record new note
          </Button>
          <Button size="lg" onClick={handleOpenUploadModal} variant="secondary" className="flex-1">
            <Upload className="size-4 mr-1" />
            Upload audio file
          </Button>
        </div>
        <Footer />
      </div>

      {isRecordingModalOpen && <RecordingModal onClose={handleCloseRecordingModal} />}
      {isUploadModalOpen && <UploadModal onClose={handleCloseUploadModal} />}
    </div>
  )
}
