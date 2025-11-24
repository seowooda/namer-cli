import inquirer from 'inquirer';
import { AiNamer } from '../services/AiNamer.js';
import { Translator } from '../services/Translator.js';
import { handleBranchAction } from './branchAction.js';
import { handleVariableAction } from './variableAction.js';
import { loadConfig } from '../utils/configLoader.js';

export async function startInteractiveMode(aiNamer: AiNamer, translator: Translator) {
  console.log('\n🚀 Namer CLI 대화형 모드에 오신 것을 환영합니다!');
  console.log("💡 종료하려면 'exit' 또는 'q'를 입력하세요.\n");

  const config = loadConfig();

  while (true) {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: '💬 입력 (한글 문장 또는 명령어):',
        prefix: '👉',
      },
    ]);

    const trimmed = input.trim();

    // 종료 조건
    if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'q') {
      console.log('👋 안녕히 가세요!');
      break;
    }

    if (!trimmed) continue;

    // 모드 선택 (브랜치 vs 변수명)
    // 입력값에 '-b'나 '--branch'가 포함되어 있으면 브랜치 모드로 처리
    const isBranchMode = trimmed.endsWith(' -b') || trimmed.endsWith(' --branch');
    const cleanInput = trimmed.replace(/ -(b|-branch)$/, '').trim();

    try {
      if (isBranchMode) {
        await handleBranchAction(cleanInput, aiNamer, translator);
      } else {
        await handleVariableAction(cleanInput, aiNamer, translator, config);
      }
      console.log(''); // 줄바꿈
    } catch (error) {
      console.error('❌ 오류 발생:', error);
    }
  }
}
