import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const MAIN_LANGUAGES = [
  {
    value: "en",
    name: "English",
  },
  {
    value: "fr",
    name: "French",
  },
  {
    value: "es",
    name: "Spanish",
  },
  {
    value: "de",
    name: "German",
  },
  {
    value: "it",
    name: "Italian",
  },
  {
    value: "pt",
    name: "Portuguese",
  },
  {
    value: "ja",
    name: "Japanese",
  },
  {
    value: "ko",
    name: "Korean",
  },
  {
    value: "zh",
    name: "Chinese",
  },
];

export const RECORDING_TYPES: {
  name: string;
  value: string;
}[] = [
    {
      name: "Summary",
      value: "summary",
    },
    {
      name: "Quick Note",
      value: "quick-note",
    },
    {
      name: "List",
      value: "list",
    },
    {
      name: "Blog post",
      value: "blog",
    },
    {
      name: "Email",
      value: "email",
    },
    // {
    //   name: "Custom Prompt",
    //   value: "custom-prompt",
    // },
  ];

export function generateTransformationPrompt(typeName: string, content: string): string {
  const typeFullName = RECORDING_TYPES.find((t) => t.value === typeName)?.name || typeName

  const typeSpecificInstructions = (() => {
    switch (typeName) {
      case "summary":
        return "Return a summary of the transcription with a maximum of 100 words."
      case "quick-note":
        return "Return a quick post it style note."
      case "list":
        return "Return a list of bullet points of the transcription main points."
      case "blog":
        return "Return the Markdown of entire blog post with subheadings"
      case "email":
        return "If type is email also generate an email subject line and a short email body with introductory paragraph and a closing paragraph for thanking the reader for reading."
      default:
        return ""
    }
  })()

  return `
    You are a helpful assistant. You will be given a transcription of an audio recording and you will generate a ${typeFullName} based on the transcription with markdown formatting.
    Only output the generation itself, with no introductions, explanations, or extra commentary.
    The transcription is: ${content}
    ${typeSpecificInstructions}
    Remember to use output language like the input transcription language.
    Do not add phrases like "Based on the transcription" or "Let me know if you'd like me to help with anything else."
  `
}

