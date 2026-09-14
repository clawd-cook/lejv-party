const WHITESPACE_RE = /[\s　]+/g

const PUNCTUATION_RE =
  /[《》「」『』""''（），！？：；、·。.,!?:;'"()[\]{}<>]/g

export function normalize(s: string): string {
  return s
    .trim()
    .replace(WHITESPACE_RE, '')
    .replace(PUNCTUATION_RE, '')
    .toLowerCase()
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let short = b
  let long = a
  if (short.length > long.length) {
    const tmp = short
    short = long
    long = tmp
  }

  const m = short.length
  let prev = new Array<number>(m + 1)
  let curr = new Array<number>(m + 1)

  for (let j = 0; j <= m; j++) prev[j] = j

  for (let i = 1; i <= long.length; i++) {
    curr[0] = i
    const li = long.charCodeAt(i - 1)
    for (let j = 1; j <= m; j++) {
      const cost = li === short.charCodeAt(j - 1) ? 0 : 1
      const del = prev[j]! + 1
      const ins = curr[j - 1]! + 1
      const sub = prev[j - 1]! + cost
      let min = del < ins ? del : ins
      if (sub < min) min = sub
      curr[j] = min
    }
    const tmp = prev
    prev = curr
    curr = tmp
  }

  return prev[m]!
}

export function checkAnswer(input: string, title: string): boolean {
  return levenshtein(normalize(input), normalize(title)) <= 1
}
