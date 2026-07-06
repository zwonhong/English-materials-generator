# TASKS

---

## Step 1. Development Environment

- Initialize Node.js project
- Initialize npm
- Install required packages
- Configure Express
- Configure .gitignore
- Create .env.example
- Configure npm start
- Verify local server runs

---

## Step 2. Authentication

Create login page.

Requirements

- Read MASTER_ID from .env
- Read MASTER_PASSWORD from .env
- Create session login
- Create logout functionality.
- Redirect to Main UI after login
- Create authentication middleware.
- Redirect unauthenticated users to /login.

Keep authentication simple and appropriate for one private master account. Do not implement registration, roles, account management, or password recovery.

---

## Step 3. Main UI

Implement

- Title Input
- English OCR Textarea
- Existing Korean Translation Checkbox
- Korean OCR Textarea
- Generate Button

Rules

Korean OCR textarea is disabled until checkbox is checked.

---

## Step 4. Gemini

Create prompts/system.txt

Store the Gemini system prompt there.

Load it dynamically from the application.

Connect Gemini API.

Requirements

- Read API Key from .env
- Use Gemini 2.5 Flash
- Apply Persona
- Apply Prompt
- Validate returned JSON
- Return the validated JSON to the browser
- Store generated JSON only in browser memory
- Do not persist generated JSON on the server, in files, in localStorage, or in sessionStorage
- Reuse the same browser-memory JSON for every output
- Clear generated JSON on New Project, logout, page close, or page reload
- When an existing Korean translation does not map perfectly to English sentence boundaries, align the existing translation naturally
- During alignment, allow only moving, splitting, or combining existing restored Korean translation text
- Never create, rewrite, paraphrase, or add a new sentence translation during alignment
- Include both English and Korean OCR changes in ocrChanges, identified by language

Gemini must only be called once per project.

---

## Step 5. Student Summary PDF

Generate PDF using HTML template.

Include

- Title
- Passage
- Summary
- Main Idea
- 3 Key Points

Download immediately.

---

## Step 6. Teacher Summary PDF

Generate PDF using HTML template.

Include

- Title
- Corrected English Passage
- Summary (EN/KO)
- Main Idea (EN/KO)
- 3 Key Points (EN/KO)

Do not include the full Korean translation of the original passage.

Korean is included only for Summary, Main Idea, and Key Points.

Download immediately.

---

## Step 7. English Line PDF

Generate PDF.

Requirements

- Number every sentence
- One blank line between sentences
- Entire passage should fit on a single page whenever reasonably possible
- Download immediately

---

## Step 8. English-Korean Line PDF

Generate PDF.

Requirements

- Same layout as English Line PDF
- Korean translation below each sentence
- Preserve numbering
- Download immediately

---

## Step 9. OCR Change Log

Generate

Title_OCR교정로그.txt

Include

- Language (EN/KO)
- Before
- After
- Numbering

Include both English and Korean OCR changes when applicable.

Download immediately.

---

## Step 10. Download Buttons

After successful Gemini response

Display

Buttons remain disabled until a valid Gemini response has been successfully parsed.

- Student Summary PDF
- Teacher Summary PDF
- English Line PDF
- English-Korean Line PDF
- OCR Change Log

Downloads begin immediately when each button is clicked.

---

## Step 11. Local Testing

Run application locally.

Verify

- Login
- Main UI
- Gemini
- JSON
- Student PDF
- Teacher PDF
- English Line PDF
- English-Korean Line PDF
- OCR Log

Verify malformed JSON handling.

Verify Gemini API failure handling.

Verify empty OCR input handling.

Keep error handling focused on essential failures for a private tool. Assume the master user follows the documented input rules, and do not over-engineer rare edge cases.

Fix all detected issues.

---

## Step 12. Refactoring

Review project.

Improve

- folder structure
- duplicate code
- readability
- maintainability

Do NOT change functionality.

---

## Step 13. Deployment

Deploy application.

Verify

- login
- Gemini
- PDF generation
- download
- production environment variables
