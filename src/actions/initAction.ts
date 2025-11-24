import { Command } from 'commander';
import inquirer from 'inquirer';
import { globalConfig } from '../utils/globalConfig.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export function registerInitCommand(program: Command) {
  program
    .command('init')
    .description('초기 설정 마법사 (API Key 및 기본 설정)')
    .action(async () => {
      console.log('\n👋 안녕하세요! namer-cli 초기 설정을 시작합니다.\n');

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKey',
          message: '🔑 Google Gemini API Key를 입력해주세요 (없으면 Enter로 건너뛰기):',
          validate: async (input) => {
            if (!input) return true; // 건너뛰기 허용
            try {
              const genAI = new GoogleGenerativeAI(input);
              const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
              await model.generateContent('test');
              return true;
            } catch {
              return '❌ 유효하지 않은 API Key입니다. 다시 확인해주세요.';
            }
          },
        },
        {
          type: 'list',
          name: 'styleType',
          message: '🎨 React 컴포넌트 생성 시 사용할 스타일 방식을 선택하세요:',
          choices: [
            { name: 'Styled-components', value: 'styled-components' },
            { name: 'CSS Modules (.module.css)', value: 'module-css' },
            { name: '일반 CSS (.css)', value: 'css' },
          ],
          default: 'styled-components',
        },
        {
          type: 'list',
          name: 'reactTemplate',
          message: '⚛️ 선호하는 React 컴포넌트 선언 방식은?',
          choices: [
            { name: '화살표 함수 (const App = () => {})', value: 'arrow' },
            { name: '일반 함수 (function App() {})', value: 'function' },
          ],
          default: 'arrow',
        },
      ]);

      // 설정 저장
      if (answers.apiKey) {
        globalConfig.setApiKey(answers.apiKey);
        console.log('\n✅ API Key가 저장되었습니다.');
      }

      // namer.config.json 생성
      const fs = await import('fs');
      const path = await import('path');

      const configContent = {
        styleType: answers.styleType,
        reactTemplate: answers.reactTemplate,
        templates: {},
      };

      const configPath = path.resolve(process.cwd(), 'namer.config.json');
      fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));

      console.log(`\n✅ 현재 폴더에 설정 파일이 생성되었습니다: ${configPath}`);
      console.log('\n🎉 모든 설정이 완료되었습니다! 이제 `namer <한글>` 명령어를 사용해보세요.');
    });
}
