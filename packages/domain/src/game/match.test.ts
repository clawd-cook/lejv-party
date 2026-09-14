import { describe, expect, it } from 'vitest'

import { checkAnswer, normalize } from './match.js'

describe('normalize', () => {
  it('strips whitespace and punctuation', () => {
    expect(normalize('  《晴天》  ')).toBe('晴天')
  })
})

describe('checkAnswer', () => {
  it('accepts exact title', () => {
    expect(checkAnswer('晴天', '晴天')).toBe(true)
  })

  it('accepts one edit distance', () => {
    expect(checkAnswer('稻乡', '稻香')).toBe(true)
  })

  it('rejects far-off answers', () => {
    expect(checkAnswer('晴天', '稻香')).toBe(false)
  })
})
