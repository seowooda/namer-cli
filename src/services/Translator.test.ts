import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import type { Translator as TranslatorType } from './Translator.js';

// 1. Mock 정의
const mockTranslate = jest.fn() as jest.Mock<
  (
    text: string,
    options?: unknown
  ) => Promise<{ text: string; from: { language: { iso: string } } }>
>;

// 2. 모듈 Mocking (unstable_mockModule 사용)
jest.unstable_mockModule('google-translate-api-x', () => ({
  translate: mockTranslate,
}));

// 3. 동적 임포트 (Mock 적용 후)
const { Translator } = await import('./Translator.js');

describe('Translator Service', () => {
  let translator: TranslatorType;

  beforeEach(() => {
    translator = new Translator();
    mockTranslate.mockReset(); // 초기화
  });

  test('번역 성공 시 번역된 텍스트를 반환해야 한다', async () => {
    mockTranslate.mockResolvedValue({
      text: 'Hello',
      from: { language: { iso: 'ko' } },
    });

    const result = await translator.translate('안녕');

    expect(mockTranslate).toHaveBeenCalledWith('안녕', { to: 'en' });
    expect(result).toEqual({ text: 'Hello', source: 'Google' });
  });

  test('번역 실패 시 원본 텍스트를 반환해야 한다 (Fallback)', async () => {
    mockTranslate.mockRejectedValue(new Error('Network Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await translator.translate('안녕');

    expect(result).toEqual({ text: '안녕', source: 'Google' });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
