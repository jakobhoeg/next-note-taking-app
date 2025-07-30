import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDbLoading } from "@/app/pglite-wrapper";

export interface Note {
  id: string;
  title: string;
  content: string;
  preview: string;
  timestamp: string;
}

export const useNotes = () => {
  const { db, isDbReady } = useDbLoading();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery<Note[] | undefined>({
    queryKey: ["Notes"],
    queryFn: async () => {
      if (!db || !isDbReady) return undefined;
      const result = await db.query<Note>(`
        SELECT id, title, content, preview, timestamp 
        FROM notes 
        ORDER BY timestamp DESC
      `);
      return result.rows || [];
    },
    enabled: !!db && isDbReady,
  });

  const addNoteMutation = useMutation<Note, Error, { title: string; content: string }>({
    mutationFn: async ({ title, content }) => {
      const newNote: Note = {
        id: uuidv4(),
        title,
        content,
        preview:
          content.length > 80 ? content.slice(0, 80) + "..." : content,
        timestamp: new Date().toISOString(),
      };
      if (!db || !isDbReady) throw new Error("Database not initialized");
      await db.query(
        `INSERT INTO notes (id, title, content, preview, timestamp) 
         VALUES ($1, $2, $3, $4, $5)`,
        [newNote.id, newNote.title, newNote.content, newNote.preview, newNote.timestamp]
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
        if (!db || !isDbReady) return undefined;
        const result = await db.query<Note>(
          `SELECT id, title, content, preview, timestamp 
           FROM notes 
           WHERE id = $1`,
          [id]
        );
        return result.rows[0];
      },
      enabled: !!db && !!id && isDbReady,
    });
  };

  const getNote = useCallback(
    async (id: string): Promise<Note | undefined> => {
      if (!db || !isDbReady) return undefined;
      const result = await db.query<Note>(
        `SELECT id, title, content, preview, timestamp 
         FROM notes 
         WHERE id = $1`,
        [id]
      );
      return result.rows[0];
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
        values.push(updates.content);
        const preview = updates.content.length > 80 ? updates.content.slice(0, 80) + "..." : updates.content;
        fields.push(`preview = $${paramIndex++}`);
        values.push(preview);
      }
      if (updates.preview !== undefined) {
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