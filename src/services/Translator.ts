import axios from "axios";
import { translate as googleTranslate } from "google-translate-api-x";
import dotenv from "dotenv";

dotenv.config();

interface TranslationResult {
  text: string;
  source: "DeepL" | "Google";
}

export class Translator {
  private deeplApiKey: string;

  constructor() {
    this.deeplApiKey = process.env.DEEPL_API_KEY || "";
  }

  public async translate(query: string): Promise<TranslationResult> {
    try {
      // DeepL 키가 없으면 바로 구글로
      if (!this.deeplApiKey) return await this.translateWithGoogle(query);
      return await this.translateWithDeepL(query);
    } catch (error: any) {
      // 456 에러(한도초과)나 기타 에러 시 구글로
      return await this.translateWithGoogle(query);
    }
  }

  private async translateWithDeepL(text: string): Promise<TranslationResult> {
    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      null,
      {
        params: {
          auth_key: this.deeplApiKey,
          text: text,
          target_lang: "EN",
        },
      }
    );
    return { text: response.data.translations[0].text, source: "DeepL" };
  }

  private async translateWithGoogle(text: string): Promise<TranslationResult> {
    const response = await googleTranslate(text, { to: "en" });
    return { text: response.text, source: "Google" };
  }
}
