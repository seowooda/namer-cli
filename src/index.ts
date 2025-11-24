#!/usr/bin/env node
import { Command } from 'commander';
import { Translator } from './services/Translator.js';
import { AiNamer } from './services/AiNamer.js';
import { loadConfig } from './utils/configLoader.js';
import { handleBranchAction } from './actions/branchAction.js';
import { handleVariableAction } from './actions/variableAction.js';
import { startInteractiveMode } from './actions/interactiveAction.js';
import { registerConfigCommand } from './actions/configAction.js';
import { registerInitCommand } from './actions/initAction.js';

const program = new Command();

registerInitCommand(program);
registerConfigCommand(program);

const translator = new Translator();
const aiNamer = new AiNamer();

program
  .version('1.0.0')
  .argument('[korean]', '번역할 한글 문장 (생략 시 대화형 모드 진입)')
  .option('-b, --branch', 'Git 브랜치 이름 추천 모드')
  .action(async (korean, options) => {
    try {
      // 인자가 없으면 대화형 모드 실행
      if (!korean) {
        await startInteractiveMode(aiNamer, translator);
        return;
      }

      const config = loadConfig();

      // 1. Git 브랜치 모드
      if (options.branch) {
        await handleBranchAction(korean, aiNamer, translator);
        return;
      }

      // 2. 변수명 생성 모드 (기본)
      await handleVariableAction(korean, aiNamer, translator, config);
    } catch (error) {
      console.error('❌ 오류:', error);
    }
  });

program.parse(process.argv);
