# 🚀 Namer CLI

**AI 기반 변수명 & 브랜치명 추천 도구**

`namer-cli`는 개발자가 변수명이나 Git 브랜치 이름을 고민하는 시간을 줄여주는 CLI 도구입니다.
단순 번역을 넘어, Google Gemini AI를 활용하여 문맥에 맞는 변수명, 함수명, 브랜치명을 추천하고, 프로젝트 컨벤션에 맞는 코드까지 즉시 생성해줍니다.

## ✨ 주요 기능

- **🤖 AI 작명:** 한글 설명만 입력하면 Gemini AI가 적절한 영어 변수명/함수명을 추천합니다.
- **🌿 Git 브랜치 추천:** 작업 내용에 맞춰 `feat/`, `fix/` 등의 컨벤션을 지킨 브랜치 이름을 제안합니다.
- **💬 대화형 모드:** 명령어 없이 실행하면 대화형 인터페이스로 편리하게 사용할 수 있습니다.
- **📋 클립보드 복사:** 선택한 이름을 자동으로 클립보드에 복사합니다.
- **📂 파일 생성:** 추천받은 이름으로 파일(.ts, .tsx 등)이나 폴더 구조를 자동으로 생성합니다.
- **🔄 스마트 코드 생성:** `use...`는 React Hook으로, `is...`는 Boolean 함수로 템플릿을 자동 완성합니다.
- **🌍 글로벌 설정:** API Key를 안전하게 암호화하여 전역으로 관리합니다.

## 📦 설치 (Installation)

```bash
npm install -g @namer-cli/tool
```

## 🔑 초기 설정 (Setup)

이 도구는 Google Gemini API를 사용합니다. 원활한 사용을 위해 API Key 설정이 필요합니다.
(키가 없으면 무료 구글 번역기를 통한 단순 변환만 지원됩니다.)

### 1. 간편 설정 (추천)

명령어 한 번으로 API Key 등록과 프로젝트 스타일 설정을 마법사 형태로 진행할 수 있습니다.

```bash
namer init
```

- **API Key 등록:** 입력 즉시 유효성을 검사하고 안전하게 저장합니다.
- **스타일 설정:** React 컴포넌트 스타일(Styled-components 등)과 템플릿 방식을 선택하여 `namer.config.json`을 자동 생성합니다.

### 2. 수동 설정

API Key만 따로 등록하고 싶다면 아래 명령어를 사용하세요.

1. **API Key 발급:** [Google AI Studio](https://aistudio.google.com/app/apikey)에서 무료로 발급받으세요.
2. **키 등록:**
   ```bash
   namer config set key <YOUR_API_KEY>
   ```
   _키는 로컬에 암호화되어 안전하게 저장됩니다._

## 🚀 사용법 (Usage)

### 1. 변수명 추천

```bash
namer "사용자 로그인 훅"
```

- AI가 `useLogin`, `useUserAuth` 등을 추천해줍니다.
- 선택 후 파일 생성까지 한 번에 가능합니다.

### 2. Git 브랜치 이름 추천 (`-b` 옵션)

```bash
namer -b "로그인 페이지 버그 수정"
```

- `fix/login-page-bug`, `fix/auth-error` 등을 추천해줍니다.
- 선택 시 `git checkout -b ...` 명령어가 클립보드에 복사됩니다.

### 3. 대화형 모드 (Interactive Mode)

```bash
namer
```

- 인자 없이 실행하면 대화형 모드가 시작됩니다.
- 여기서 계속해서 질문하고 추천받을 수 있습니다.

## ⚙️ 설정 관리 (Configuration)

### 글로벌 설정 (API Key)

- **키 등록:** `namer config set key <VALUE>`
- **키 확인:** `namer config get key`
- **키 삭제:** `namer config delete key`

### 프로젝트별 설정 (`namer.config.json`)

프로젝트 루트에 `namer.config.json` 파일을 만들어서 파일 생성 옵션을 커스텀할 수 있습니다.

```json
{
  "reactTemplate": "arrow", // "function" | "arrow"
  "styleType": "module-css", // "css" | "module-css" | "styled-components"
  "templates": {
    "component": "./templates/component.txt", // 컴포넌트 템플릿 경로
    "style": "./templates/style.txt", // 스타일 템플릿 경로
    "index": "./templates/index.txt" // index.ts 템플릿 경로
  }
}
```

### 🎨 커스텀 템플릿 만들기 (Custom Templates)

자신만의 코드 스타일이 있다면 템플릿 파일을 만들어 사용할 수 있습니다.
템플릿 파일 내에서 아래의 **치환 변수**들을 사용할 수 있습니다.

| 변수        | 설명                           | 예시 (입력: "user profile") |
| :---------- | :----------------------------- | :-------------------------- |
| `{{Name}}`  | PascalCase (클래스/컴포넌트명) | `UserProfile`               |
| `{{name}}`  | camelCase (변수/함수명)        | `userProfile`               |
| `{{kebab}}` | kebab-case (파일/CSS클래스명)  | `user-profile`              |

**예시 (`templates/component.txt`):**

```tsx
import React from 'react';
import styles from './{{Name}}.module.css';

interface {{Name}}Props {
  // props definition
}

export const {{Name}} = (props: {{Name}}Props) => {
  return (
    <div className={styles.container}>
      {/* {{Name}} Component */}
    </div>
  );
};
```

## 🛠️ 개발 및 기여 (Development)

```bash
# 저장소 클론
git clone https://github.com/seowooda/namer-cli.git

# 의존성 설치
npm install

# 빌드
npm run build

# 로컬 테스트 (심볼릭 링크)
npm link
```

## 📝 License

MIT
