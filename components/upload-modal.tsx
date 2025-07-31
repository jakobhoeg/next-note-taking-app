"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Dropzone from "react-dropzone";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useNotes } from "@/app/hooks/useNotes";
import { builtInAI, doesBrowserSupportBuiltInAI } from "@built-in-ai/core";
import { generateText } from "ai";
import { Upload } from "lucide-react";
import { Spinner } from "./ui/spinner";

export function UploadModal({ onClose }: { onClose: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const { addNote } = useNotes();

  const [isDragActive, setIsDragActive] = useState(false);
  const router = useRouter();

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        toast.error(
          "Bad file selected. Please make sure to select an audio file."
        );
        return;
      }
      setIsProcessing(true);
      try {
        if (!doesBrowserSupportBuiltInAI()) {
          toast.error("Your browser does not support built-in AI.");
          return;
        }

        const model = builtInAI();
        const availability = await model.availability();

        if (availability === "unavailable") {
          toast.error("Built-in AI is not available on your device.");
          return;
        }

        if (availability === "downloadable") {
          setProcessingStatus("Downloading model...");
          await model.createSessionWithProgress((progress) => {
            setProcessingStatus(
              `Downloading model... ${Math.round(progress * 100)}%`
            );
          });
        }

        setProcessingStatus("Transcribing audio...");
        const audioData = new Uint8Array(await file.arrayBuffer());

        const { text: transcription } = await generateText({
          model: model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Transcribe the following audio" },
                { type: "file", mediaType: file.type, data: audioData },
              ],
            },
          ],
        });

        setProcessingStatus("Generating title...");
        const { text: title } = await generateText({
          model: model,
          prompt: `Generate a title for the following transcription with a max of 10 words or 80 characters: 
        ${transcription}
        
        Only return the title, nothing else, no explanation, and no quotes or follow-up.
        `,
        });

        if (title.trim() && transcription.trim()) {
          toast.promise(
            async () => {
              const newNote = await addNote({
                title,
                content: {
                  type: "doc",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        {
                          type: "text",
                          text: transcription
                        }
                      ]
                    }
                  ]
                }
              });
              router.push(`/notes/${newNote.id}`);
            },
            {
              loading: "Saving note...",
              success: "Note saved!",
              error: "Failed to save note.",
            }
          );
        } else {
          toast.error("Title or transcription is empty. Cannot save note.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to transcribe audio. Please try again.");
      } finally {
        setIsProcessing(false);
        onClose();
      }
    },
    [addNote, router, onClose]
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[392px] !p-0 border border-gray-200 rounded-tl-xl rounded-tr-x overflow-hidden gap-0"
      >
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">Upload Voice Audio</DialogTitle>
        </DialogHeader>

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
            <p className="text-gray-500 flex items-center">
              <Spinner className="size-4 mr-1" />
              {processingStatus}
              <span className="animate-pulse">...</span>
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 text-center">
              <h2 className="text-lg font-semibold">Upload a new recording</h2>
            </div>
            <Dropzone
              multiple={false}
              accept={{
                // MP3 audio
                "audio/mpeg3": [".mp3"],
                "audio/x-mpeg-3": [".mp3"],
                // WAV audio
                "audio/wav": [".wav"],
                "audio/x-wav": [".wav"],
                "audio/wave": [".wav"],
                "audio/x-pn-wav": [".wav"],
                // iPhone voice notes (M4A)
                "audio/mp4": [".m4a"],
                "audio/m4a": [".m4a"],
                "audio/x-m4a": [".m4a"],
              }}
              onDrop={handleDrop}
              onDragEnter={() => setIsDragActive(true)}
              onDragLeave={() => setIsDragActive(false)}
              onDropAccepted={() => setIsDragActive(false)}
              onDropRejected={() => setIsDragActive(false)}
            >
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className="flex flex-col justify-start items-start relative overflow-hidden cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <div className="relativ p-5 w-full">
                    <div className="relative overflow-hidden rounded-xl border-2 border-dashed min-h-[86px] flex justify-center items-center flex-col gap-1">
                      <div className="flex justify-center items-center relative gap-2.5 px-3 py-2 rounded-lg ">
                        <Upload className="size-4 " />
                        <p className="text-base font-semibold text-left">
                          Upload a recording
                        </p>
                      </div>
                      <p className="text-xs text-center text-[#4a5565]">
                        Or drag‑and‑drop here
                      </p>
                      {isDragActive && (
                        <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center z-10 pointer-events-none">
                          <span className="text-blue-300 font-semibold">
                            Drop audio file here
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Dropzone>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
