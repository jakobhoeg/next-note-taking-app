import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { JSONContent } from "novel"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTransformationPrompt(type: string, content: string): string {
  const prompts: Record<string, string> = {
    "summarize": `Please summarize the following text in a clear and concise way:\n\n${content}`,
    "expand": `Please expand on the following text, adding more detail and context:\n\n${content}`,
    "simplify": `Please simplify the following text, making it easier to understand:\n\n${content}`,
    "formal": `Please rewrite the following text in a more formal tone:\n\n${content}`,
    "casual": `Please rewrite the following text in a more casual, conversational tone:\n\n${content}`,
    "bullet-points": `Please convert the following text into bullet points:\n\n${content}`,
    "paragraph": `Please convert the following bullet points or list into a flowing paragraph:\n\n${content}`,
  }
  return prompts[type] || `Please ${type} the following text:\n\n${content}`
}

// Helper function to validate and sanitize JSONContent
export function validateAndSanitizeContent(content: JSONContent): JSONContent {
  // Ensure content has the correct structure
  if (!content || typeof content !== 'object' || content.type !== 'doc') {
    return { type: 'doc', content: [] };
  }

  // Ensure content.content is an array
  if (!Array.isArray(content.content)) {
    return { type: 'doc', content: [] };
  }

  // Sanitize each node in the content
  const sanitizedContent = content.content.map(node => {
    if (node.type === 'text' && node.text !== undefined) {
      // Ensure text nodes have string values, not nested objects
      if (typeof node.text === 'object') {
        return { type: 'text', text: '' };
      }
      return node;
    }
    return node;
  });

  return {
    type: 'doc',
    content: sanitizedContent
  };
}

// Helper function to create empty JSONContent
export function createEmptyContent(): JSONContent {
  return { type: 'doc', content: [] };
}

// Helper function to create JSONContent from text
export function createContentFromText(text: string): JSONContent {
  return {
    type: "doc",
    content: text ? [
      {
        type: "paragraph",
        content: [{ type: "text", text }]
      }
    ] : []
  };
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

