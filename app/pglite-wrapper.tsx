'use client'

import { PGlite } from '@electric-sql/pglite'
import { PGliteProvider } from '@electric-sql/pglite-react'
import { live, LiveNamespace } from '@electric-sql/pglite/live'
import { createContext, useContext, useEffect, useState } from 'react'
import { initDb } from './db/db'

type PGliteWithLive = PGlite & { live: LiveNamespace };

type DbLoadingContextType = {
  db?: PGliteWithLive,
  isDbReady: boolean,
}

const DbLoadingContext = createContext<DbLoadingContextType>({
  db: undefined,
  isDbReady: false
})

export function useDbLoading() {
  return useContext(DbLoadingContext)
}

export default function PGliteWrapper({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<PGliteWithLive | undefined>(undefined);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function setupDb() {
      const pglite = await PGlite.create({
        dataDir: 'idb://notes-db',
        extensions: { live }
      });
      await initDb(pglite);
      setDb(pglite);
      setIsDbReady(true);
    }
    setupDb();
  }, []);

  return (
    <DbLoadingContext.Provider value={{ db, isDbReady }}>
      {db ? (
        <PGliteProvider db={db}>{children}</PGliteProvider>
      ) : (
        // Render children but they'll get loading states from useDbLoading
        <div className="h-[calc(100dvh)] w-full">
          {children}
        </div>
      )}
    </DbLoadingContext.Provider>
  )
}