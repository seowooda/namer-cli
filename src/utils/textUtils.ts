const STOPWORDS = [
  'a',
  'an',
  'the', // 관사
  'to',
  'of',
  'in',
  'on',
  'at',
  'by',
  'for',
  'from',
  'with', // 전치사
  'it',
  'is',
  'are',
  'that',
  'this',
  'which', // 대명사/비동사
  'will',
  'can',
  'should',
  'must', // 조동사
];

export function cleanText(text: string): string {
  return text
    .split(' ') // 띄어쓰기 기준으로 쪼갬
    .filter((word) => {
      // 소문자로 바꿔서 불용어 목록에 있는지 확인
      const lowerWord = word.toLowerCase();
      // 불용어가 아니고(AND), 빈 문자열이 아닌 것만 남김
      return !STOPWORDS.includes(lowerWord) && lowerWord.trim() !== '';
    })
    .join(' '); // 다시 합침
}
