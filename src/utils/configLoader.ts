import fs from "fs";
import path from "path";

export interface NamerConfig {
  reactTemplate: "function" | "arrow";
  styleType: "css" | "module-css" | "styled-components";
  // 🔥 [추가] 템플릿 경로를 담는 객체
  templates?: {
    component?: string; // 컴포넌트용 템플릿 경로 (예: ./templates/component.txt)
    style?: string; // 스타일용 템플릿 경로
    index?: string; // index용 템플릿 경로
  };
}

const DEFAULT_CONFIG: NamerConfig = {
  reactTemplate: "function",
  styleType: "module-css",
  templates: {}, // 기본값은 비워둠
};

export function loadConfig(): NamerConfig {
  try {
    const configPath = path.join(process.cwd(), "namer.config.json");
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, "utf-8");
      const userConfig = JSON.parse(fileContent);
      return { ...DEFAULT_CONFIG, ...userConfig };
    }
  } catch (error) {
    console.warn("⚠️ 설정 파일 로드 실패 (기본값 사용):", error);
  }
  return DEFAULT_CONFIG;
}
