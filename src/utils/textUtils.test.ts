import { cleanText } from "./textUtils.js";

describe("텍스트 정제 (cleanText)", () => {
  it("불용어(stopwords)를 제거해야 한다", () => {
    const input = "a user login for the system";
    const expected = "user login system";
    expect(cleanText(input)).toBe(expected);
  });

  it("불필요한 공백을 제거해야 한다", () => {
    const input = "user   login";
    const expected = "user login";
    expect(cleanText(input)).toBe(expected);
  });

  it("빈 문자열을 처리해야 한다", () => {
    expect(cleanText("")).toBe("");
  });

  it("불용어 대소문자를 구분하지 않고 제거해야 한다", () => {
    const input = "THE user IS login";
    const expected = "user login";
    expect(cleanText(input)).toBe(expected);
  });
});
