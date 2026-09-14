import { z } from 'zod'

export const nicknameSchema = z
  .string()
  .min(1, 'nickname required')
  .max(16, 'nickname too long')
  .refine((v) => v.trim().length > 0, 'nickname required')

export const cefrLevelSchema = z.enum(['A2', 'B1', 'B2', 'C1'])

export const eraSchema = z.enum(['80s', '90s', '00s', '10s', '20s'])

export const genreSchema = z.enum(['流行', '摇滚', '民谣', '说唱', '影视 OST'])

export const victoryScoreSchema = z.union([
  z.literal(3),
  z.literal(5),
  z.literal(10),
])

export const createRoomBodySchema = z.object({
  nickname: nicknameSchema,
})

export const joinRoomBodySchema = z.object({
  nickname: nicknameSchema,
})

export const leaveRoomBodySchema = z.object({
  playerId: z.string().min(1),
})

export const configPatchSchema = z
  .object({
    level: cefrLevelSchema.optional(),
    eras: z.array(eraSchema).min(1).optional(),
    genres: z.array(genreSchema).min(1).optional(),
    victoryScore: victoryScoreSchema.optional(),
  })
  .refine(
    (patch) => Object.keys(patch).length > 0,
    'patch must contain at least one field',
  )

export const updateConfigBodySchema = z.object({
  actorId: z.string().min(1),
  patch: configPatchSchema,
})

export const startGameBodySchema = z.object({
  actorId: z.string().min(1),
})

export const answerBodySchema = z.object({
  playerId: z.string().min(1),
  answer: z.string().min(1).max(64),
})

export const skipQuestionBodySchema = z.object({
  actorId: z.string().min(1),
})

export const roomIdParamSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{6}$/, 'room id must be 6 alphanumeric characters')
