/*!
 * ============================================================
 * THIS FILE IS WITHHELD FROM THE PUBLIC SHOWCASE.
 * ============================================================
 * The full implementation lives in the private source
 * repository alongside the rest of the project. Without it,
 * the menu compiles but the media drop-zone persistence,
 * default-backdrop fetch, and IndexedDB lifecycle do not
 * behave as designed.
 *
 * If you are evaluating this codebase for a hiring decision
 * and want to read the omitted file, contact:
 *
 *     nhhuy130@gmail.com
 *
 * See LICENSE — All Rights Reserved.
 * ============================================================
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface MediaState {
  url: string | null
  type: string | null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function usePersistedMedia(_key: string, _opts?: { defaultUrl?: string }) {
  throw new Error(
    'usePersistedMedia is withheld from the public showcase. ' +
      'Contact nhhuy130@gmail.com for licensing.',
  )
}
