const fs = require('fs/promises');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const env = require('../config/env');
const geminiResponseSchema = require('../config/gemini-response-schema');

const systemPromptPath = path.join(
  __dirname,
  '..',
  '..',
  'prompts',
  'system.txt',
);

async function loadSystemPrompt() {
  try {
    const prompt = await fs.readFile(systemPromptPath, 'utf8');

    if (!prompt.trim()) {
      throw new Error('시스템 프롬프트 파일이 비어 있습니다.');
    }

    return prompt;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('prompts/system.txt 파일을 찾을 수 없습니다.');
    }

    throw error;
  }
}

function buildUserPrompt({ title, hasTranslation, englishOCR, koreanOCR }) {
  const sections = [
    'Title',
    title,
    '',
    'Has Existing Korean Translation',
    String(hasTranslation),
    '',
    'English OCR',
    englishOCR,
  ];

  if (hasTranslation) {
    sections.push('', 'Korean OCR', koreanOCR);
  }

  return sections.join('\n');
}

async function generateStructuredProjectData(input) {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY가 .env에 설정되어 있지 않습니다.');
  }

  if (!env.geminiModel) {
    throw new Error('GEMINI_MODEL이 .env에 설정되어 있지 않습니다.');
  }

  const systemPrompt = await loadSystemPrompt();
  const userPrompt = buildUserPrompt(input);
  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
  const response = await ai.models.generateContent({
    model: env.geminiModel,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: geminiResponseSchema,
    },
  });

  try {
    return {
      model: env.geminiModel,
      rawText: response.text,
      data: JSON.parse(response.text),
    };
  } catch (error) {
    const structuredOutputError = new Error(
      `Gemini 구조화 JSON 응답을 해석할 수 없습니다: ${error.message}`,
    );
    structuredOutputError.rawResponse = response.text;
    throw structuredOutputError;
  }
}

module.exports = {
  buildUserPrompt,
  generateStructuredProjectData,
  loadSystemPrompt,
};
