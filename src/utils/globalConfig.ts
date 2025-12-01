import Conf from 'conf';
import os from 'os';
import crypto from 'crypto';
import pkg from 'node-machine-id';
const { machineIdSync } = pkg;

// 사용자 기반 + PC 기반 AES 키 자동 생성
function generateCliOptimizedKey() {
  const username = os.userInfo().username;
  const machineId = machineIdSync(); 
  const projectSalt = 'ai-namer-cli-v1'; 

  const raw = username + machineId + projectSalt;

  // SHA-256 해시 → 32바이트 AES-256 key
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

const encryptionKey = generateCliOptimizedKey();

// v1 설정 파일이 남아있다면 삭제
try {
  const oldConfig = new Conf({ projectName: 'ai-namer-cli' });
  if (oldConfig.size > 0) {
    oldConfig.clear(); // 파일 내용 삭제
  }
} catch {
  // 무시 (이미 지워졌거나 접근 불가 시)
}

interface GlobalConfig {
  apiKey?: string;
}

// v2 설정
const config = new Conf<GlobalConfig>({
  projectName: 'ai-namer-cli-v2',
  encryptionKey,
});

export const globalConfig = {
  setApiKey(key: string) {
    config.set('apiKey', key);
  },

  getApiKey(): string | undefined {
    return config.get('apiKey');
  },

  deleteApiKey() {
    config.delete('apiKey');
  },

  getPath() {
    return config.path;
  },
};
