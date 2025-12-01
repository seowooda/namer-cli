import { translate as googleTranslate } from 'google-translate-api-x';

interface TranslationResult {
  text: string;
  source: 'Google';
}

export class Translator {
  constructor() {}

  public async translate(query: string): Promise<TranslationResult | null> {
    try {
      const response = await googleTranslate(query, { to: 'en' });
      return { text: response.text, source: 'Google' };
    } catch {
      // 2차 방어선: 번역 API까지 실패한 경우
      // 여기서 에러를 숨기지 않고 null을 반환하여 호출자가 처리하게 함
      return null;
    }
  }
}
