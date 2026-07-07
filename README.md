# English Helper

개인용 영어 학원 업무 자동화 도구입니다. OCR로 추출한 영어 원문을 Gemini로 한 번만 처리해 검증된 JSON을 만들고, 그 JSON을 브라우저 메모리에만 보관한 뒤 여러 PDF와 OCR 교정 로그를 생성합니다.

DB는 사용하지 않습니다. 회원가입도 없으며, `.env`에 설정한 마스터 계정 하나로만 로그인합니다.

## 주요 기능

- 마스터 계정 로그인 / 로그아웃
- 영어 OCR 입력
- 선택적 기존 한국어 OCR 입력
- Gemini 구조화 JSON 생성
- Zod 기반 JSON 검증
- 브라우저 메모리 기반 결과 유지
- 학생용 요약 PDF
- 선생님용 요약 PDF
- 영어 한줄 PDF
- 영한 한줄 PDF
- OCR 교정 로그 TXT
- 검증 JSON 클립보드 복사
- New Project / Reset으로 브라우저 메모리 초기화

## 기술 스택

- Runtime: Node.js 20 이상
- Backend: Express
- Frontend: HTML, CSS, Vanilla JavaScript
- Session: express-session
- Security: helmet, express-rate-limit
- LLM: Gemini via `@google/genai`
- Validation: Zod
- PDF: Puppeteer
- Environment: dotenv
- Database: 사용하지 않음

## 폴더 구조

```text
teacher_auto/
├─ assets/
├─ prompts/
│  └─ system.txt
├─ public/
│  ├─ css/
│  │  ├─ auth.css
│  │  └─ main.css
│  ├─ js/
│  │  └─ main.js
│  ├─ login.html
│  ├─ login-error.html
│  └─ main.html
├─ src/
│  ├─ config/
│  │  ├─ env.js
│  │  └─ gemini-response-schema.js
│  ├─ controllers/
│  │  ├─ auth.controller.js
│  │  ├─ gemini.controller.js
│  │  ├─ ocr-log.controller.js
│  │  └─ pdf.controller.js
│  ├─ middleware/
│  │  └─ auth.js
│  ├─ routes/
│  │  ├─ auth.routes.js
│  │  ├─ gemini.routes.js
│  │  ├─ ocr-log.routes.js
│  │  ├─ page.routes.js
│  │  └─ pdf.routes.js
│  ├─ services/
│  │  ├─ gemini.service.js
│  │  └─ pdf.service.js
│  ├─ templates/
│  │  ├─ english-korean-line.template.js
│  │  ├─ english-line.template.js
│  │  ├─ line-pdf.css
│  │  ├─ line-pdf.template.js
│  │  ├─ ocr-log.template.js
│  │  ├─ student-summary.css
│  │  ├─ student-summary.template.js
│  │  ├─ summary-pdf.template.js
│  │  └─ teacher-summary.template.js
│  ├─ utils/
│  │  └─ filename.js
│  ├─ validators/
│  │  └─ gemini-response.schema.js
│  ├─ app.js
│  └─ server.js
├─ tests/
│  └─ fixtures/
├─ .env
├─ .env.example
├─ .gitignore
├─ package.json
├─ SPEC.md
└─ TASKS.md
```

## 환경변수 설정

프로젝트 루트에 `.env` 파일을 만들고 아래 값을 설정합니다.

```dotenv
MASTER_ID=your_master_id
MASTER_PASSWORD=your_master_password
SESSION_SECRET=replace_with_a_long_random_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
NODE_ENV=development
```

### `.env.example`을 복사해서 `.env` 만들기

PowerShell:

```powershell
Copy-Item .env.example .env
```

cmd:

```cmd
copy .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

## Gemini API Key 설정 위치

Gemini API 키는 `.env`에 설정합니다.

```dotenv
GEMINI_API_KEY=your_real_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

키는 서버에서만 읽으며 프론트엔드로 노출하지 않습니다.

## 마스터 로그인 계정 설정 위치

마스터 계정은 `.env`에 설정합니다.

```dotenv
MASTER_ID=your_master_id
MASTER_PASSWORD=your_master_password
SESSION_SECRET=replace_with_a_long_random_string
```

개인용 단일 계정 도구이므로 회원가입, 권한 역할, 비밀번호 재설정 기능은 없습니다.

## 설치

```bash
npm install
```

PowerShell에서 npm 실행 정책 문제가 있으면 다음 명령을 사용합니다.

```powershell
npm.cmd install
```

## 개발 서버 실행

```bash
npm run dev
```

PowerShell:

```powershell
npm.cmd run dev
```

기본 주소:

```text
http://localhost:3000
```

## 운영 서버 실행

```bash
npm start
```

PowerShell:

```powershell
npm.cmd start
```

운영 환경에서는 `.env`의 `NODE_ENV=production`과 충분히 긴 `SESSION_SECRET`을 사용하세요.

## 로컬 테스트

서버 상태 확인:

```text
http://localhost:3000/health
```

PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

기본 테스트 순서:

1. `npm run dev` 실행
2. 브라우저에서 `http://localhost:3000` 접속
3. `.env`의 마스터 계정으로 로그인
4. 제목과 영어 OCR 입력
5. 기존 한국어 번역이 있으면 체크 후 한국어 OCR 입력
6. Generate 클릭
7. 생성 완료 후 다운로드 버튼과 Copy JSON 확인
8. New Project / Reset으로 초기화 확인

## 출력 파일

- `<Title>_요약본(학생).pdf`
- `<Title>_요약본(선생님).pdf`
- `<Title>_영어한줄.pdf`
- `<Title>_영한한줄.pdf`
- `<Title>_OCR교정로그.txt`

개발용 preview 파일은 프로젝트 루트에 생성될 수 있습니다.

- `preview_student_summary.pdf`
- `preview_teacher_summary.pdf`
- `preview_english_line.pdf`
- `preview_english_korean_line.pdf`
- `preview_ocr_log.txt`

preview 파일은 개발 확인용이며 Git에 커밋하지 않습니다.

## 주의사항

- `.env`는 절대로 Git에 올리면 안 됩니다.
- `.env.example`에는 실제 비밀값을 넣지 않습니다.
- Gemini는 한 프로젝트당 1회 호출하는 것을 원칙으로 합니다.
- 검증된 JSON은 브라우저 메모리에만 보관합니다.
- JSON은 서버, 파일, DB, `localStorage`, `sessionStorage`에 저장하지 않습니다.
- PDF는 HTML 템플릿을 Puppeteer로 렌더링해 생성합니다.
- DB는 사용하지 않습니다.
- Gemini가 invalid JSON을 반환하면 자동 재시도하지 않고 오류를 표시합니다.
- 사용자는 Generate를 다시 눌러 수동으로 재시도할 수 있습니다.
