import { Command } from 'commander';
import { globalConfig } from '../utils/globalConfig.js';
import inquirer from 'inquirer';
import { GoogleGenerativeAI } from '@google/generative-ai';

export function registerConfigCommand(program: Command) {
  const configCommand = program.command('config').description('글로벌 설정 관리 (API Key 등)');

  // 1. Set Key
  configCommand
    .command('set <key> <value>')
    .description('설정 값 저장 (예: set key AIzaSy...)')
    .action(async (key, value) => {
      if (key === 'key') {
        console.log('⏳ API Key 유효성 검사 중...');
        try {
          const genAI = new GoogleGenerativeAI(value);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
          // 간단한 테스트 요청으로 키 검증
          await model.generateContent('test');

          globalConfig.setApiKey(value);
          console.log(`✅ 유효한 API Key입니다! 성공적으로 저장되었습니다.`);
        } catch {
          console.error(`❌ 유효하지 않은 API Key입니다. 다시 확인해주세요.`);
          // console.error(error); // 필요 시 상세 에러 출력
        }
      } else {
        console.error(`❌ 알 수 없는 키입니다: ${key}`);
      }
    });

  // 2. Get Key
  configCommand
    .command('get <key>')
    .description('설정 값 확인')
    .action((key) => {
      if (key === 'key') {
        const storedKey = globalConfig.getApiKey();
        if (storedKey) {
          // 보안을 위해 일부 마스킹
          const masked = storedKey.slice(0, 5) + '*'.repeat(10) + storedKey.slice(-5);
          console.log(`🔑 현재 등록된 API Key: ${masked}`);
        } else {
          console.log('📭 등록된 API Key가 없습니다.');
        }
      } else {
        console.error(`❌ 알 수 없는 키입니다: ${key}`);
      }
    });

  // 3. Delete Key
  configCommand
    .command('delete <key>')
    .description('설정 값 삭제')
    .action(async (key) => {
      if (key === 'key') {
        const answer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: '정말로 API Key를 삭제하시겠습니까?',
            default: false,
          },
        ]);

        if (answer.confirm) {
          globalConfig.deleteApiKey();
          console.log('🗑️ API Key가 삭제되었습니다.');
        }
      } else {
        console.error(`❌ 알 수 없는 키입니다: ${key}`);
      }
    });
}
