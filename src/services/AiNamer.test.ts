import { jest, describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import type { AiNamer as AiNamerType } from './AiNamer.js';

const mockGetApiKey = jest.fn() as jest.Mock<() => string | undefined>;
const mockGenerateContent = jest.fn() as jest.Mock<
  (prompt: string) => Promise<{ response: { text: () => string } }>
>;
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
})) as jest.Mock;

jest.unstable_mockModule('../utils/globalConfig.js', () => ({
  globalConfig: {
    getApiKey: mockGetApiKey,
  },
}));

jest.unstable_mockModule('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

const { AiNamer } = await import('./AiNamer.js');

describe('AiNamer Service', () => {
  let aiNamer: AiNamerType;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('API Key가 없으면 모델이 초기화되지 않고 빈 배열을 반환해야 한다', async () => {
    mockGetApiKey.mockReturnValue(undefined);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    aiNamer = new AiNamer();
    const result = await aiNamer.suggestNames('test');

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Gemini API Key가 설정되지 않았습니다')
    );
    consoleSpy.mockRestore();
  });

  test('API Key가 있으면 모델이 초기화되고 이름을 추천해야 한다', async () => {
    mockGetApiKey.mockReturnValue('fake-api-key');

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'name1, name2, name3, name4',
      },
    });

    aiNamer = new AiNamer();
    const result = await aiNamer.suggestNames('user id');

    expect(mockGetGenerativeModel).toHaveBeenCalled();
    expect(mockGenerateContent).toHaveBeenCalled();
    expect(result).toEqual(['name1', 'name2', 'name3', 'name4']);
  });

  test('AI 호출 실패 시 빈 배열을 반환해야 한다', async () => {
    mockGetApiKey.mockReturnValue('fake-api-key');
    mockGenerateContent.mockRejectedValue(new Error('AI Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    aiNamer = new AiNamer();
    const result = await aiNamer.suggestNames('user id');

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('suggestBranchNames도 정상적으로 동작해야 한다', async () => {
    mockGetApiKey.mockReturnValue('fake-api-key');
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'feat/login, fix/bug',
      },
    });

    aiNamer = new AiNamer();
    const result = await aiNamer.suggestBranchNames('login feature');

    expect(result).toEqual(['feat/login', 'fix/bug']);
  });
});
