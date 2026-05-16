import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 're-menu-media'
const STORE = 'slots'

export interface StoredMedia {
  blob: Blob
  type: string
}

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE)
        }
      },
    })
  }
  return dbPromise
}

export async function getMedia(key: string): Promise<StoredMedia | null> {
  const db = await getDB()
  return (await db.get(STORE, key)) ?? null
}

export async function setMedia(key: string, value: StoredMedia) {
  const db = await getDB()
  await db.put(STORE, value, key)
}

export async function clearMedia() {
  const db = await getDB()
  await db.clear(STORE)
}
