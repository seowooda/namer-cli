import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import dotenv from 'dotenv';
import { globalConfig } from '../utils/globalConfig.js';

dotenv.config({ debug: false, quiet: true });
if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

export class AiNamer {
  private model: GenerativeModel | undefined;

  constructor() {
    // 1. .env 파일 확인
    let apiKey = process.env.GEMINI_API_KEY;

    // 2. 없으면 글로벌 설정 확인
    if (!apiKey) {
      apiKey = globalConfig.getApiKey();
    }

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  async suggestNames(description: string): Promise<string[]> {
    if (!this.model) {
      this.printApiKeyGuidance();
      return [];
    }

    const prompt = `
      You are an expert software engineer specializing in Clean Code and naming conventions.
      Your task is to suggest 4 excellent variable, function, or class names based on the user's description.

      [Input Description]
      "${description}"

      [Analysis Guidelines]
      1. **Identify the Type**: Is it a function (action), a variable (data), a boolean (flag), a class (object), or a React Hook?
      2. **Apply Conventions**:
         - **Boolean**: Must start with is, has, can, should, or did.
         - **Function**: Must start with a verb (e.g., get, set, fetch, handle, on).
         - **React Hook**: Must start with 'use'.
         - **Class/Component**: Use PascalCase (Noun).
         - **Constant**: Use UPPER_CASE if it implies a fixed configuration.
      3. **Variety**: Provide a mix of:
         - A standard, descriptive name.
         - A concise/short name.
         - A more specific/context-aware name.

      [Output Rules]
      - Return **ONLY** the 4 suggested names, separated by commas.
      - Do NOT include any explanations, markdown formatting, or numbering.
      - Example Output: getUserInfo, fetchUserData, retrieveProfile, loadUser
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return response
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    } catch (error) {
      console.error('⚠️ AI 호출 실패:', error);
      // 실패 시 빈 배열 반환 -> 일반 번역기로 넘어감
      return [];
    }
  }

  async suggestBranchNames(description: string): Promise<string[]> {
    if (!this.model) {
      this.printApiKeyGuidance();
      return [];
    }

    const prompt = `
      You are an expert software engineer specializing in Git workflows and version control.
      Your task is to suggest 4 excellent Git branch names based on the user's description.

      [Input Description]
      "${description}"

      [Naming Conventions]
      - Use 'kebab-case' (lowercase, hyphen-separated).
      - Start with a category prefix:
        - 'feat/': New feature
        - 'fix/': Bug fix
        - 'docs/': Documentation changes
        - 'style/': Formatting, missing semi colons, etc; no code change
        - 'refactor/': Refactoring production code
        - 'test/': Adding missing tests, refactoring tests
        - 'chore/': Updating build tasks, package manager configs, etc
      
      [Analysis Guidelines]
      1. Analyze the intent of the description to choose the correct prefix.
      2. **Keep it SHORT and CONCISE**: Limit the name to 3-5 words max (excluding prefix).
      3. Avoid redundant words like 'update', 'change', 'modify' if possible.

      [Output Rules]
      - Return **ONLY** the 4 suggested branch names, separated by commas.
      - Do NOT include any explanations, markdown formatting, or numbering.
      - Example Output: feat/user-login, fix/auth-token, refactor/payment, chore/deps-update
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return response
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    } catch (error) {
      console.error('⚠️ AI 호출 실패:', error);
      return [];
    }
  }

  private printApiKeyGuidance() {
    console.log('\n⚠️  Gemini API Key가 설정되지 않았습니다.');
    console.log('   👉 `namer config set key <YOUR_API_KEY>` 명령어로 키를 설정해주세요.');
    console.log('   🔗 발급 링크: https://aistudio.google.com/app/apikey\n');
  }
}
