"use client";

import { Command, CommandInput } from "@/components/ui/command";

import { ArrowUp, Sparkles } from "lucide-react";
import { useEditor } from "novel";
import { addAIHighlight } from "novel";
import { useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";
import { Spinner } from "@/components/ui/spinner";
import { streamText } from "ai";
import { builtInAI, doesBrowserSupportBuiltInAI } from "@built-in-ai/core";
//TODO: I think it makes more sense to create a custom Tiptap extension for this functionality https://tiptap.dev/docs/editor/ai/introduction

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasCompletion = completion.length > 0;

  const handleComplete = async (prompt: string, option: string, command?: string) => {
    if (!doesBrowserSupportBuiltInAI()) {
      toast.error("Your browser does not support built-in AI.");
      return;
    }

    console.log(prompt)

    const model = builtInAI();
    const availability = await model.availability();

    if (availability === "unavailable") {
      toast.error("Built-in AI is not available on your device.");
      return;
    }

    if (availability === "downloadable") {
      toast.info("Downloading model...");
      await model.createSessionWithProgress((progress) => {
        toast.loading(`Downloading model... ${Math.round(progress * 100)}%`);
      });
      toast.success("Model downloaded.");
    }

    try {
      setIsLoading(true);
      setCompletion("");

      let systemPrompt = "";
      let userPrompt = "";

      switch (option) {
        case "continue":
          systemPrompt = "You are an AI writing assistant that continues existing text based on context from prior text. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
            "Only output the generation itself, with no introductions, explanations, or extra commentary." +
            "Use Markdown formatting when appropriate.";
          userPrompt = prompt;
          break;
        case "improve":
          systemPrompt = "You are an AI writing assistant that improves existing text. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
            "Only output the generation itself, with no introductions, explanations, or extra commentary." +
            "Use Markdown formatting when appropriate.";
          userPrompt = `The existing text is: ${prompt}`;
          break;
        case "shorter":
          systemPrompt = "You are an AI writing assistant that shortens existing text. " +
            "Only output the generation itself, with no introductions, explanations, or extra commentary." +
            "Use Markdown formatting when appropriate.";
          userPrompt = `The existing text is: ${prompt}`;
          break;
        case "longer":
          systemPrompt = "You are an AI writing assistant that lengthens existing text. " +
            "Only output the generation itself, with no introductions, explanations, or extra commentary." +
            "Use Markdown formatting when appropriate.";
          userPrompt = `The existing text is: ${prompt}`;
          break;
        case "fix":
          systemPrompt = "You are an AI writing assistant that fixes grammar and spelling errors in existing text. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
            "Only output the generation itself, with no introductions, explanations, or extra commentary." +
            "Use Markdown formatting when appropriate.";
          userPrompt = `The existing text is: ${prompt}`;
          break;
        case "zap":
          systemPrompt = "You are an AI writing assistant that generates text based on a prompt. " +
            "You take an input from the user and a command for manipulating the text" +
            "Only output the generation itself, with no introductions, explanations, or extra commentary." +
            "Use Markdown formatting when appropriate.";
          userPrompt = `For this text: ${prompt}. You have to respect the command: ${command}`;
          break;
        default:
          systemPrompt = "You are an AI writing assistant." +
            "Only output the generation itself, with no introductions, explanations, or extra commentary.";
          "If user asks to delete text, just return an empty string."
          userPrompt = prompt;
      }

      const fullPrompt = `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`;

      const { textStream } = await streamText({
        model,
        prompt: fullPrompt,
      });

      let fullCompletion = "";
      for await (const chunk of textStream) {
        fullCompletion += chunk;
        setCompletion(fullCompletion);
      }
    } catch (error) {
      console.error("Error generating completion:", error);
      toast.error("Failed to generate completion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose p-2 px-4 prose-sm">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground">
          <Sparkles className="mr-2 h-4 w-4 shrink-0  " />
          AI is thinking
          <div className="ml-2 mt-1">
            <Spinner className="size-4" />
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={hasCompletion ? "Tell AI what to do next" : "Ask AI to edit or generate..."}
              onFocus={() => addAIHighlight(editor!)}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full"
              onClick={() => {
                if (completion) {
                  return handleComplete(completion, "zap", inputValue).then(() => setInputValue(""));
                }

                const slice = editor!.state.selection.content();
                const text = editor!.storage.markdown.serializer.serialize(slice.content);

                handleComplete(text, "zap", inputValue).then(() => setInputValue(""));
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                editor!.chain().unsetHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            <AISelectorCommands onSelect={(value, option) => handleComplete(value, option)} />
          )}
        </>
      )}
    </Command>
  );
}
