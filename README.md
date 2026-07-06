# English Helper

## 프로젝트 소개

English Helper는 영어 학원 업무에서 반복되는 OCR 교정, 문장 정렬, 요약 자료 작성 및 PDF 출력을 자동화하기 위한 개인용 웹 애플리케이션입니다.

한 명의 마스터 사용자만 사용하는 것을 전제로 하며, Gemini API 사용량을 최소화하면서 하나의 일관된 JSON 결과로 여러 교육 자료를 만드는 것이 목표입니다.

현재는 개발 환경과 기본 Express 서버만 구성되어 있습니다. 인증, Gemini 연동, 화면 및 PDF 생성 기능은 이후 단계에서 구현됩니다.

## 주요 기능

최종적으로 다음 기능을 제공합니다.

- 마스터 계정 로그인 및 로그아웃
- 영어 OCR 오류 복원
- 기존 한국어 OCR 오류 복원 및 영문 문장과의 정렬
- 기존 번역이 없는 경우 한국어 문장 번역 생성
- 영어·한국어 요약, 중심 내용(Main Idea), 핵심 포인트 생성
- 학생용 요약 PDF 생성
- 교사용 요약 PDF 생성
- 영어 한 줄 PDF 생성
- 영한 한 줄 PDF 생성
- 영어·한국어 OCR 교정 로그 생성

## 기술 스택

- 런타임: Node.js 20 이상
- 백엔드: Express
- 프런트엔드: HTML, CSS, Vanilla JavaScript
- 생성형 AI: Gemini 2.5 Flash (`@google/genai`)
- PDF: Puppeteer 및 HTML 템플릿
- 환경변수: dotenv
- 세션: express-session
- 데이터 검증: Zod
- 기본 보안: Helmet, express-rate-limit
- 개발 서버: Nodemon
- 데이터베이스: 사용하지 않음

## 폴더 구조

```text
teacher_auto/
├─ assets/
│  └─ fonts/          # PDF에 사용할 폰트 파일
├─ prompts/           # Gemini 시스템 프롬프트
├─ public/
│  ├─ css/            # 프런트엔드 스타일
│  └─ js/             # 브라우저 JavaScript
├─ src/
│  ├─ config/         # 환경변수 및 공통 설정
│  ├─ controllers/    # HTTP 요청과 응답 처리
│  ├─ middleware/     # 인증 및 공통 미들웨어
│  ├─ routes/         # 페이지 및 API 라우트
│  ├─ services/       # Gemini, PDF 등 핵심 서비스
│  ├─ templates/      # PDF용 HTML 템플릿
│  ├─ utils/          # 공통 유틸리티
│  ├─ validators/     # 입력 및 JSON 스키마 검증
│  ├─ app.js          # Express 애플리케이션 설정
│  └─ server.js       # 서버 실행 진입점
├─ tests/
│  ├─ fixtures/       # 테스트용 샘플 데이터
│  ├─ integration/    # 통합 테스트
│  └─ unit/           # 단위 테스트
├─ .env               # 실제 비밀 환경변수(커밋 금지)
├─ .env.example       # 환경변수 작성 예시
├─ package.json       # npm 패키지와 실행 스크립트
├─ SPEC.md            # 프로젝트 요구사항
└─ TASKS.md           # 단계별 구현 작업
```

## 설치 방법

### 1. Node.js 확인

Node.js 20 이상이 필요합니다.

```bash
node --version
```

### 2. npm 패키지 설치

프로젝트 루트에서 다음 명령을 실행합니다.

```bash
npm install
```

PowerShell 실행 정책으로 `npm.ps1` 실행이 차단되는 환경에서는 다음 명령을 사용합니다.

```powershell
npm.cmd install
```

## 환경변수 설정

### `.env.example`을 복사하여 `.env` 만들기

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Windows 명령 프롬프트:

```cmd
copy .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

복사한 `.env` 파일을 열어 실제 값을 입력합니다.

```dotenv
MASTER_ID=your_master_id
MASTER_PASSWORD=your_master_password
SESSION_SECRET=replace_with_a_long_random_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
NODE_ENV=development
```

### Gemini API Key 설정 위치

Gemini API 키는 프로젝트 루트의 `.env` 파일에 설정합니다.

```dotenv
GEMINI_API_KEY=실제_Gemini_API_키
```

클라이언트 JavaScript나 Git 저장소에는 API 키를 기록하지 않습니다.

### 마스터 로그인 계정 설정 위치

마스터 계정의 ID와 비밀번호도 프로젝트 루트의 `.env` 파일에 설정합니다.

```dotenv
MASTER_ID=실제_마스터_ID
MASTER_PASSWORD=실제_마스터_비밀번호
```

이 프로젝트는 한 명의 마스터 사용자만 사용하며 회원가입이나 다중 사용자 기능을 제공하지 않습니다.

## 서버 실행 방법

### 개발 서버 실행

파일 변경 시 Nodemon이 서버를 자동으로 다시 시작합니다.

```bash
npm run dev
```

PowerShell에서 npm 실행이 차단되는 경우:

```powershell
npm.cmd run dev
```

### 운영 서버 실행

```bash
npm start
```

PowerShell에서 npm 실행이 차단되는 경우:

```powershell
npm.cmd start
```

별도의 `PORT`를 지정하지 않으면 서버는 기본적으로 다음 주소에서 실행됩니다.

```text
http://localhost:3000
```

## 로컬 테스트 방법

현재 단계에서는 서버를 실행한 뒤 상태 확인 엔드포인트를 호출하여 Express 서버가 정상 작동하는지 확인할 수 있습니다.

브라우저에서 다음 주소를 엽니다.

```text
http://localhost:3000/health
```

또는 PowerShell에서 호출합니다.

```powershell
Invoke-RestMethod http://localhost:3000/health
```

정상 응답:

```json
{
  "status": "ok"
}
```

전체 기능이 구현된 이후에는 로그인, OCR 입력, Gemini JSON, 각 PDF 및 OCR 로그 생성 흐름도 단계별로 테스트합니다.

## 주의사항

- `.env`에는 로그인 정보와 Gemini API 키가 들어 있으므로 절대로 Git에 커밋하거나 외부에 공유하지 않습니다.
- `.env.example`에는 실제 비밀값을 넣지 않고 변수 이름과 예시값만 유지합니다.
- Gemini는 유효한 결과가 확정된 프로젝트당 한 번만 호출하는 것을 원칙으로 합니다.
- Gemini가 잘못된 JSON을 반환하면 자동 재시도하지 않으며, 오류를 확인한 사용자가 Generate를 다시 눌러 수동으로 재시도합니다.
- 모든 결과물은 한 번 확정된 동일 JSON을 재사용하여 일관성을 유지합니다.
- 생성된 JSON은 브라우저 메모리에만 보관하며 서버, 파일, `localStorage`, `sessionStorage`에는 저장하지 않습니다.
- PDF는 Gemini가 직접 생성하지 않습니다. 애플리케이션의 HTML 템플릿을 Puppeteer로 렌더링하여 생성합니다.
- 데이터베이스는 사용하지 않습니다.
- 이 프로젝트는 개인용 단일 마스터 계정 도구이며 공개 회원가입이나 다중 사용자 운영을 전제로 하지 않습니다.
