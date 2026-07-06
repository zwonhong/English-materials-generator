# English Helper

## Project Overview

English Helper is a private web application for automating repetitive English academy work.

This project is designed for personal use only.

No user registration is required.

Only one master account can access the application.

The goal is to minimize repetitive work while minimizing Gemini API usage.

---

# Tech Stack

Frontend
- Node.js
- HTML
- CSS
- Vanilla JavaScript

Backend
- Node.js
- Express

LLM
- Gemini 2.5 Flash

PDF
- Puppeteer

Storage
- No Database
- Generated JSON is stored only in browser memory.
- Do not store generated JSON on the server, in files, in localStorage, or in sessionStorage.
- Every output reuses the same JSON held in browser memory.
- Generated JSON is cleared when the user starts a new project, logs out, closes the page, or reloads the page.

---

# Authentication

No registration.

One master account only.

Credentials are stored in .env.

Authentication should remain appropriate for a private, single-master-account automation tool.

Use a simple session login and logout flow. Do not add registration, account management, roles, password recovery, or other multi-user features.

Example

MASTER_ID=admin
MASTER_PASSWORD=password

---

# Development Rules

Each Generate action must call Gemini only once.

After valid JSON is successfully accepted for a project, Gemini must not be called again for that project.

Every output must reuse the same JSON.

If Gemini returns invalid JSON, display an error message.

Do NOT retry automatically.

Allow the user to press Generate again manually after an invalid JSON response.

An invalid JSON response does not complete the project and does not enable any output buttons.

Gemini returns ONLY JSON.

Gemini never returns HTML.

Gemini never generates PDFs.

PDFs are generated from HTML templates.

---

# General Principles

Always prioritize consistency over creativity.

Never invent information.

Never change the author's intent.

Every output must be deterministic and suitable for educational materials.

The generated JSON will be reused to generate multiple PDFs.

Therefore consistency is more important than creativity.

Keep implementation and error handling proportionate to a private personal tool.

Assume the master user follows the documented input rules.

Handle essential failures clearly, including empty required input, authentication failure, Gemini API failure, invalid Gemini JSON, and PDF generation failure, without introducing unnecessary complexity for rare edge cases.

---

# User Flow

Login

↓

Main Page

↓

Enter title

↓

Paste English OCR

↓

Check "Existing Korean Translation"

↓

If checked

Paste Korean OCR

↓

Generate

↓

Gemini

↓

JSON

↓

PDF Buttons

↓

Download

↓

New Project

↓

Clear Memory

---

# Main UI

Title Input

English OCR Textarea

Checkbox

Existing Korean Translation

When checked

Enable Korean OCR Textarea

Generate Button

After generation

Show:

- Student PDF
- Teacher PDF
- English Line PDF
- English-Korean Line PDF
- OCR Change Log (.txt)

---

# OCR Rules

Gemini restores OCR errors ONLY.

Allowed

- punctuation restoration
- quotation marks
- apostrophes
- commas
- periods
- capitalization
- line breaks inside sentences → spaces
- preserve paragraph breaks
- restore spacing
- merge broken words
- split merged words
- OCR character confusion
  - rn↔m
  - I↔l
  - O↔0
- restore hyphenated words split across lines

    Example

    inter-
    esting

    ↓

    interesting
- Restore common OCR ligature errors.

    Examples:

    ﬁ → fi

    ﬂ → fl

Forbidden

- rewriting
- grammar improvement
- style improvement
- sentence order changes
- summarization
- information addition
- information removal

---

# Translation Rules

If Existing Korean Translation is FALSE

Gemini generates

- sentence translations
- summary translation
- main idea translation
- key point translations

Preserve grammatical relationships.
Translate phrases and idioms naturally while remaining as close as possible to the original wording.
Do not translate word-by-word.

If Existing Korean Translation is TRUE

Gemini

- restores English OCR
- restores Korean OCR
- aligns English and Korean sentences
- generates Summary (EN/KO)
- generates Main Idea (EN/KO)
- generates 3 Key Points (EN/KO)

Gemini must NOT regenerate sentence translations.

Only OCR restoration is allowed for sentence translations.

If the English and Korean sentence boundaries do not map perfectly, Gemini must align the existing Korean translation naturally to the corresponding English sentences.

During alignment, Gemini may move, split, or combine only the existing restored Korean translation text as needed.

Gemini must never create, rewrite, paraphrase, or add a new Korean sentence translation during alignment.

---

# Summary Output

Summary

3~5 sentences

Main Idea

Exactly one sentence

Key Points

Exactly three concise sentences.

Layout

Title

────────────────────────

Original Passage

────────────────────────

Summary

────────────────────────

Main Idea

────────────────────────

Key Points

• Point 1

• Point 2

• Point 3


Student Version

- Title
- Corrected English Passage
- Summary (EN)
- Main Idea (EN)
- 3 Key Points (EN)


Teacher Version

- Title
- Corrected English Passage
- Summary (EN)
- Summary (KO)
- Main Idea (EN)
- Main Idea (KO)
- 3 Key Points (EN)
- 3 Key Points (KO)

The Teacher Version must not include the full Korean translation of the corrected English passage.

Korean is included only for Summary, Main Idea, and Key Points.

---

# Sentence Structure

The sentences array is the primary data source.

Example

{
    "id":1,
    "english":"",
    "korean":""
}

Every PDF except the summary PDFs uses this array.

---

# JSON Schema

{

    "correctedText":"",

    "ocrChanges":[
        {
            "language":"en",
            "type":"",
            "before":"",
            "after":"",
            "reason":""
        }
    ],

    "summary":{
        "en":"",
        "ko":""
    },

    "mainIdea":{
        "en":"",
        "ko":""
    },

    "keyPoints":[
        {
            "en":"",
            "ko":""
        },
        {
            "en":"",
            "ko":""
        },
        {
            "en":"",
            "ko":""
        }
    ],

    "sentences":[
        {
            "id":1,
            "english":"",
            "korean":""
        }
    ]
}


Input title will be used in the .value and output PDFs and filenames.
---

# Output Files

Student Summary

Title_요약본(학생).pdf

Teacher Summary

Title_요약본(선생님).pdf

English Line

Title_영어한줄.pdf

English-Korean Line

Title_영한한줄.pdf

OCR Log

Title_OCR교정로그.txt

---

# OCR Change Log

Gemini must return both English and Korean OCR correction history when applicable.

Each change must identify its language as `en` or `ko`.

The application generates

Title_OCR교정로그.txt

Example

[1]

Before

rnust

After

must

----------------

[2]

Before

The dog
ran.

After

The dog ran.

The generated log must display the language, before text, after text, and numbering for every English and Korean OCR change.

---

# System Prompt


You are an experienced English reading instructor for Korean high school students.

Return ONLY valid JSON.

Your primary goals are:

1. Restore OCR errors.
2. Preserve the author's wording.
3. Produce accurate reading materials.
4. Generate translations suitable for Korean students.

==========================
OCR Restoration
==========================

Restore ONLY OCR errors.

Allowed:

- punctuation
- quotation marks
- commas
- periods
- apostrophes
- capitalization
- spacing
- broken words
- merged words
- OCR character confusion
(rn↔m, I↔l, O↔0)

Replace line breaks inside sentences with a single space.

Preserve paragraph breaks.

Never rewrite the author's writing.

When restoring punctuation, only restore punctuation that is highly likely to have been lost due to OCR. Do not invent punctuation unless the omission is obvious from the context.

==========================
Summary
==========================

Generate:

- One concise summary. 3~5 sentences.

- One main idea. Exactly one sentence.

- Exactly THREE key points. Each key point should be a concise sentence.

Key points should represent supporting ideas.

Avoid overlap with the main idea.


==========================
Translation
==========================

If hasTranslation is FALSE:

Generate Korean translations.

Translation Guidelines:

- Prefer natural literal translation.
- Stay as close as possible to the original wording.
- Preserve the meaning of vocabulary.
- Preserve the meaning of idioms.
- Minor paraphrasing is acceptable only when required for natural Korean.
- Do NOT over-paraphrase.
- Do NOT summarize.
- Do NOT omit information.
- Do NOT add information.
- Keep sentence order identical to English.

The translation should resemble the style used in Korean high school English workbooks.

If hasTranslation is TRUE:

You are given both English OCR and Korean OCR.

Your tasks are:

- Restore OCR errors in English.
- Restore OCR errors in Korean.
- Align each Korean sentence with its corresponding English sentence.
- Generate Summary (EN/KO).
- Generate Main Idea (EN/KO).
- Generate exactly THREE Key Points (EN/KO).

Do NOT regenerate sentence translations.

Preserve the original translator's wording.

If English and Korean sentence boundaries do not map perfectly, align the existing Korean translation naturally with the corresponding English sentences.

You may move, split, or combine only the existing restored Korean translation text for alignment.

Never create, rewrite, paraphrase, or add a new Korean sentence translation during alignment.

Include both English and Korean OCR restorations in ocrChanges. Set language to "en" or "ko" for every change.

==========================
Output
==========================

Return ONLY valid JSON.

Never return Markdown.

Never return HTML.

Never explain anything.

The returned JSON must exactly follow the JSON schema below.

Do not omit any fields.

Use empty strings when a value is unavailable.



JSON Format

{

    "correctedText":"",

    "ocrChanges":[
        {
            "language":"en",
            "type":"",
            "before":"",
            "after":"",
            "reason":""
        }
    ],

    "summary":{
        "en":"",
        "ko":""
    },

    "mainIdea":{
        "en":"",
        "ko":""
    },

    "keyPoints":[
        {
            "en":"",
            "ko":""
        },
        {
            "en":"",
            "ko":""
        },
        {
            "en":"",
            "ko":""
        }
    ],

    "sentences":[
        {
            "id":1,
            "english":"",
            "korean":""
        }
    ]
}

# User Prompt

Title

{{title}}

Has Existing Korean Translation

{{true/false}}

English OCR

{{englishOCR}}

Korean OCR

{{koreanOCR}}


# PDF Style Guide

All PDFs should prioritize readability.

- Fixed to A4 portrait orientation.
- Fit all content onto a single page if possible.
- Prioirize fitting the content onto a single pave by adjusting font size and margins rather than jletting it spill over to a second page.
- Exceeding one page is permitted only if the content is too long to fit on a single page even after adjusting font size and margins.

## Font

Primary font for both English and Korean

HamchoromDotum

Fallback font

Nanum Gothic

## Font Size

Margins

Top: 20mm

Bottom: 20mm

Left: 18mm

Right: 18mm

Title

16pt
Bold

Section Title

12pt
Bold

English Passage

10pt

Korean Translation

8pt

## Line Spacing

English passage

1.5

English-Korean Line PDF

English sentence

↓

Korean translation immediately below

↓

One blank line

Example

1. I like my dog.

   나는 나의 개를 좋아한다.

2. My dog is very friendly.

   나의 개는 매우 친근하다.

The Korean translation must start at the same horizontal position as the English sentence.

The translation should NOT start under the numbering.

Good

1. I like my dog.

   나는 나의 개를 좋아한다.

Bad

1. I like my dog.

나는 나의 개를 좋아한다.

The entire content should remain visually balanced.

Avoid unnecessary page breaks.

If the content fits on one page with reasonable font scaling and margin adjustments, keep it on one page.

Do not reduce readability simply to force a single page.
