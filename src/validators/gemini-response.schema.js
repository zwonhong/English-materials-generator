const { z } = require('zod');

const bilingualTextSchema = z
  .object({
    en: z.string(),
    ko: z.string(),
  })
  .strict();

const ocrChangeSchema = z
  .object({
    language: z.enum(['en', 'ko']),
    type: z.string(),
    before: z.string(),
    after: z.string(),
    reason: z.string(),
  })
  .strict();

const sentenceSchema = z
  .object({
    id: z.number().int().positive(),
    english: z.string(),
    korean: z.string(),
  })
  .strict();

const geminiResponseZodSchema = z
  .object({
    correctedText: z.string(),
    ocrChanges: z.array(ocrChangeSchema),
    summary: bilingualTextSchema,
    mainIdea: bilingualTextSchema,
    keyPoints: z.array(bilingualTextSchema).length(3),
    sentences: z.array(sentenceSchema).min(1),
  })
  .strict()
  .superRefine((data, context) => {
    data.sentences.forEach((sentence, index) => {
      if (sentence.id !== index + 1) {
        context.addIssue({
          code: 'custom',
          path: ['sentences', index, 'id'],
          message: '문장 ID는 1부터 순서대로 증가해야 합니다.',
        });
      }
    });
  });

module.exports = geminiResponseZodSchema;
