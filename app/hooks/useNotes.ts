import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDbLoading } from "@/app/pglite-wrapper";
import { JSONContent } from "novel";

export interface Note {
  id: string;
  title: string;
  content: JSONContent;
  preview: string;
  timestamp: string;
}

// Helper function to create empty JSONContent
const createEmptyContent = (): JSONContent => ({
  type: "doc",
  content: []
});

// Helper function to create JSONContent from text
const createContentFromText = (text: string): JSONContent => ({
  type: "doc",
  content: text ? [
    {
      type: "paragraph",
      content: [{ type: "text", text }]
    }
  ] : []
});

// Helper function to extract preview text from JSONContent
const extractPreviewFromContent = (content: JSONContent): string => {
  if (!content.content || content.content.length === 0) return "New note...";

  const extractText = (node: JSONContent): string => {
    if (node.text) return node.text;
    if (node.content) {
      return node.content.map(extractText).join("");
    }
    return "";
  };

  const fullText = content.content.map(extractText).join(" ");
  return fullText.length > 80 ? fullText.slice(0, 80) + "..." : fullText || "New note...";
};

export const useNotes = () => {
  const { db, isDbReady } = useDbLoading();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      if (!db || !isDbReady) return [];
      const result = await db.query<{
        id: string;
        title: string;
        content: string;
        preview: string;
        timestamp: string;
      }>(`
        SELECT id, title, content, preview, timestamp 
        FROM notes 
        ORDER BY timestamp DESC
      `);

      return result.rows?.map(note => ({
        ...note,
        content: (() => {
          try {
            return JSON.parse(note.content) as JSONContent;
          } catch {
            return createContentFromText(note.content);
          }
        })()
      })) || [];
    },
    enabled: !!db && isDbReady,
  });

  const addNoteMutation = useMutation<Note, Error, { title: string; content?: JSONContent }>({
    mutationFn: async ({ title, content = createEmptyContent() }) => {
      const newNote: Note = {
        id: uuidv4(),
        title,
        content,
        preview: extractPreviewFromContent(content),
        timestamp: new Date().toISOString(),
      };

      if (!db || !isDbReady) throw new Error("Database not initialized");

      await db.query(
        `INSERT INTO notes (id, title, content, preview, timestamp) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          newNote.id,
          newNote.title,
          JSON.stringify(newNote.content),
          newNote.preview,
          newNote.timestamp
        ]
      );
      return newNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const useNoteQuery = (id: string) => {
    return useQuery<Note | undefined>({
      queryKey: ["note", id],
      queryFn: async () => {
        if (!db || !isDbReady || !id) return undefined;
        const result = await db.query<{
          id: string;
          title: string;
          content: string;
          preview: string;
          timestamp: string;
        }>(
          `SELECT id, title, content, preview, timestamp 
           FROM notes 
           WHERE id = $1`,
          [id]
        );

        const note = result.rows[0];
        if (!note) return undefined;

        return {
          ...note,
          content: (() => {
            try {
              return JSON.parse(note.content) as JSONContent;
            } catch {
              return createContentFromText(note.content);
            }
          })()
        };
      },
      enabled: !!db && !!id && isDbReady,
    });
  };

  const getNote = useCallback(
    async (id: string): Promise<Note | undefined> => {
      if (!db || !isDbReady || !id) return undefined;
      const result = await db.query<{
        id: string;
        title: string;
        content: string;
        preview: string;
        timestamp: string;
      }>(
        `SELECT id, title, content, preview, timestamp 
         FROM notes 
         WHERE id = $1`,
        [id]
      );

      const note = result.rows[0];
      if (!note) return undefined;

      return {
        ...note,
        content: (() => {
          try {
            return JSON.parse(note.content) as JSONContent;
          } catch {
            return createContentFromText(note.content);
          }
        })()
      };
    },
    [db, isDbReady]
  );

  const updateNoteMutation = useMutation<void, Error, { id: string; updates: Partial<Omit<Note, "id">> }>({
    mutationFn: async ({ id, updates }) => {
      if (!db || !isDbReady) throw new Error("Database not initialized");

      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.title !== undefined) {
        fields.push(`title = $${paramIndex++}`);
        values.push(updates.title);
      }

      if (updates.content !== undefined) {
        fields.push(`content = $${paramIndex++}`);
        values.push(JSON.stringify(updates.content));

        // Auto-update preview when content changes
        const preview = extractPreviewFromContent(updates.content);
        fields.push(`preview = $${paramIndex++}`);
        values.push(preview);
      }

      if (updates.preview !== undefined && updates.content === undefined) {
        fields.push(`preview = $${paramIndex++}`);
        values.push(updates.preview);
      }

      if (updates.timestamp !== undefined) {
        fields.push(`timestamp = $${paramIndex++}`);
        values.push(updates.timestamp);
      }

      if (fields.length === 0) return;

      values.push(id);
      await db.query(`UPDATE notes SET ${fields.join(", ")} WHERE id = $${paramIndex}`, values);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", id] });
    },
  });

  const deleteNoteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      if (!db || !isDbReady) throw new Error("Database not initialized");
      await db.query(`DELETE FROM notes WHERE id = $1`, [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return {
    notes,
    isLoading: isLoading || !isDbReady,
    addNote: addNoteMutation.mutateAsync,
    getNote,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    useNoteQuery,
  };
};