import Conf from "conf";

interface GlobalConfig {
  apiKey?: string;
}

// 프로젝트 이름으로 설정 파일 생성 (예: ~/.config/ai-namer-cli/config.json)
const config = new Conf<GlobalConfig>({
  projectName: "ai-namer-cli",
  encryptionKey: "namer-cli-secure-encryption-key",
});

export const globalConfig = {
  // API Key 저장
  setApiKey(key: string) {
    config.set("apiKey", key);
  },

  // API Key 가져오기
  getApiKey(): string | undefined {
    return config.get("apiKey");
  },

  // API Key 삭제
  deleteApiKey() {
    config.delete("apiKey");
  },

  // 설정 파일 경로 확인 (디버깅용)
  getPath() {
    return config.path;
  },
};
