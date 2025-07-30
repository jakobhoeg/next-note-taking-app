import { PGlite } from '@electric-sql/pglite'
import { worker } from '@electric-sql/pglite/worker'

import { live } from '@electric-sql/pglite/live'

worker({
  async init(options) {
    return new PGlite({
      dataDir: options.dataDir,
      extensions: {
        live,
      },
    })
  },
})
