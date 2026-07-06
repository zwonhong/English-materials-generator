const { Type } = require('@google/genai');

const bilingualTextSchema = {
  type: Type.OBJECT,
  properties: {
    en: {
      type: Type.STRING,
      description: 'English text.',
    },
    ko: {
      type: Type.STRING,
      description: 'Accurate Korean translation of the English text.',
    },
  },
  required: ['en', 'ko'],
};

const geminiResponseSchema = {
  type: Type.OBJECT,
  properties: {
    correctedText: {
      type: Type.STRING,
      description: 'The complete corrected English passage.',
    },
    ocrChanges: {
      type: Type.ARRAY,
      description: 'All English and Korean OCR corrections. May be empty.',
      items: {
        type: Type.OBJECT,
        properties: {
          language: {
            type: Type.STRING,
            enum: ['en', 'ko'],
            description: 'Language of the corrected OCR text.',
          },
          type: {
            type: Type.STRING,
            description: 'Short category describing the OCR correction.',
          },
          before: {
            type: Type.STRING,
            description: 'Text before OCR correction.',
          },
          after: {
            type: Type.STRING,
            description: 'Text after OCR correction.',
          },
          reason: {
            type: Type.STRING,
            description: 'Brief reason for the OCR correction.',
          },
        },
        required: ['language', 'type', 'before', 'after', 'reason'],
      },
    },
    summary: bilingualTextSchema,
    mainIdea: bilingualTextSchema,
    keyPoints: {
      type: Type.ARRAY,
      description: 'Exactly three concise supporting key points.',
      minItems: '3',
      maxItems: '3',
      items: bilingualTextSchema,
    },
    sentences: {
      type: Type.ARRAY,
      description: 'Corrected English sentences and corresponding Korean translations.',
      minItems: '1',
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.INTEGER,
            description: 'Sequential sentence ID beginning with 1.',
          },
          english: {
            type: Type.STRING,
            description: 'One corrected English sentence.',
          },
          korean: {
            type: Type.STRING,
            description: 'Corresponding Korean sentence translation.',
          },
        },
        required: ['id', 'english', 'korean'],
      },
    },
  },
  required: [
    'correctedText',
    'ocrChanges',
    'summary',
    'mainIdea',
    'keyPoints',
    'sentences',
  ],
};

module.exports = geminiResponseSchema;
