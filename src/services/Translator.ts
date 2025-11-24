import { translate as googleTranslate } from 'google-translate-api-x';

interface TranslationResult {
  text: string;
  source: 'Google';
}

export class Translator {
  constructor() {}

  public async translate(query: string): Promise<TranslationResult> {
    try {
      const response = await googleTranslate(query, { to: 'en' });
      return { text: response.text, source: 'Google' };
    } catch (error) {
      console.error('❌ 구글 번역 실패:', error);
      // 실패 시 원본 텍스트 반환하여 프로그램이 죽지 않게 함
      return { text: query, source: 'Google' };
    }
  }
}
