/**
 * Optimal Recognition Point (ORP) calculation
 *
 * The ORP is the position in a word where the eye naturally fixates.
 * For speed reading, we center words on this point so the eye doesn't need to move.
 * Research suggests ~30% into the word is optimal.
 */

const ORP_TABLE: Record<number, number> = {
  1: 0, // a → a
  2: 0, // in → [i]n
  3: 1, // the → t[h]e
  4: 1, // word → w[o]rd
  5: 1, // about → a[b]out
  6: 2, // sample → sa[m]ple
  7: 2, // reading → re[a]ding
  8: 2, // computer → co[m]puter
  9: 3, // different → dif[f]erent
  10: 3, // understand → und[e]rstand
  11: 3, // information → inf[o]rmation
  12: 4, // communication → comm[u]nication
  13: 4, // extraordinary → extr[a]ordinary
}

/**
 * Calculate the Optimal Recognition Point index for a word
 * @param word - The word to calculate ORP for
 * @returns The 0-based index of the ORP character
 */
export function calculateORP(word: string): number {
  const len = word.length
  if (len <= 0) return 0
  if (len <= 13) return ORP_TABLE[len]
  // For longer words, use ~30% position
  return Math.floor(len * 0.3)
}

/**
 * Split a word into three parts around the ORP
 * @param word - The word to split
 * @returns Tuple of [before, orp, after]
 */
export function splitAtORP(word: string): [string, string, string] {
  const orpIndex = calculateORP(word)
  return [word.slice(0, orpIndex), word[orpIndex] || '', word.slice(orpIndex + 1)]
}
