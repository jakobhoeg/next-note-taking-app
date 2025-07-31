"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAudioRecording } from "@/app/hooks/useAudioRecording";
import { useNotes } from "@/app/hooks/useNotes";
import { builtInAI, doesBrowserSupportBuiltInAI } from "@built-in-ai/core";
import { generateText } from "ai";
import { AudioWaveform } from "./ui/audio-wave";
import { Mic2, Pause, StopCircle, X } from "lucide-react";
import { Spinner } from "./ui/spinner";

interface RecordingModalProps {
  onClose: () => void;
  title?: string;
}

export function RecordingModal({ onClose }: RecordingModalProps) {
  const {
    recording,
    paused,
    audioBlob,
    analyserNode,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useAudioRecording();
  const { addNote } = useNotes();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveRecording = async () => {
    if (!audioBlob) {
      toast.error("No audio to save. Please record something first.");
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
      const audioData = new Uint8Array(await audioBlob.arrayBuffer());

      const { text: transcription, usage } = await generateText({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Transcribe the following audio. Include EVERYTHING." },
              { type: "file", mediaType: "audio/webm", data: audioData },
            ],
          },
        ],
      });

      console.log(usage)

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
  };

  useEffect(() => {
    if (pendingSave && audioBlob) {
      setPendingSave(false);
      handleSaveRecording();
    }
  }, [pendingSave, audioBlob]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[392px] !p-0 rounded-tl-xl rounded-tr-xloverflow-hidden gap-0"
      >
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">Recording Modal</DialogTitle>
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
          <div className="flex flex-col items-center w-full">
            {!recording ? (
              <div className="p-4">
                <h2 className="text-lg font-semibold">Start a new recording</h2>
              </div>
            ) : (
              <div className="flex flex-row gap-8 mt-8">
                <Button
                  variant='destructive'
                  className="size-10 rounded-xl"
                  onClick={resetRecording}
                  type="button"
                  aria-label="Reset recording"
                >
                  <X className="size-4" />
                </Button>

                <div className="flex flex-col gap-1">
                  <p className="text-base text-center">
                    {formatTime(duration)}
                  </p>
                  <AudioWaveform analyserNode={analyserNode} isPaused={paused} />
                </div>

                {paused ? (
                  <Button
                    className="size-10 p-2.5 rounded-xl cursor-pointer"
                    onClick={resumeRecording}
                    variant="secondary"
                    type="button"
                    aria-label="Resume recording"
                  >
                    <Mic2 className="size-4" />
                  </Button>
                ) : (
                  <Button
                    className="size-10 p-2.5 rounded-xl cursor-pointer"
                    variant="secondary"
                    onClick={pauseRecording}
                    type="button"
                    aria-label="Pause recording"
                  >
                    <Pause className="size-4" />
                  </Button>
                )}
              </div>
            )}

            <Button
              className={cn(
                "w-2/3 h-12 rounded-xl flex flex-row gap-3 items-center justify-center mb-5"
              )}
              onClick={() => {
                if (recording) {
                  stopRecording();
                  setPendingSave(true);
                } else {
                  startRecording();
                }
              }}
              disabled={isProcessing}
            >
              {recording ? (
                <>
                  <StopCircle className="size-5" />
                  <p>Stop Recording</p>
                </>
              ) : (
                <Mic2 className="size-5" />
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
