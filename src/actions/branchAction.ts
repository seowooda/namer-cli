import { AiNamer } from '../services/AiNamer.js';
import { Translator } from '../services/Translator.js';
import { cleanText } from '../utils/textUtils.js';
import { ui } from '../utils/ui.js';
import * as changeCase from 'change-case';
import inquirer from 'inquirer';

export async function handleBranchAction(korean: string, aiNamer: AiNamer, translator: Translator) {
  console.log(`\n🌿 AI(Gemini)가 Git 브랜치 이름을 생성 중입니다...`);
  const branchSuggestions = await aiNamer.suggestBranchNames(korean);
  let choices: (inquirer.Separator | { name: string; value: string })[] = [];

  if (branchSuggestions.length > 0) {
    choices = ui.formatChoices(branchSuggestions, '🌿 ');
  } else {
    console.log('   (AI 호출 실패로 일반 변환을 시도합니다)');
    const result = await translator.translate(korean);

    if (!result) {
      console.error(
        '\n❌ [Critical Error] 모든 변환 서비스(AI, Google Translate)가 응답하지 않습니다.'
      );
      console.error('   - 네트워크 연결을 확인해주세요.');
      console.error('   - 잠시 후 다시 시도해주세요.');
      process.exit(1);
    }

    const cleaned = cleanText(result.text);
    const kebab = changeCase.kebabCase(cleaned);
    choices = [
      { name: `🌿 feat/${kebab}`, value: `feat/${kebab}` },
      { name: `🌿 fix/${kebab}`, value: `fix/${kebab}` },
      { name: `🌿 chore/${kebab}`, value: `chore/${kebab}` },
    ];
  }

  //다시 추천받기 옵션
  choices.push(new inquirer.Separator());
  choices.push({ name: '🔄 다시 추천받기', value: 'RETRY' });

  const selectedBranch = await ui.selectBranch(choices);

  if (selectedBranch === 'RETRY') {
    console.log('\n🔄 다른 이름으로 다시 시도합니다...');
    return handleBranchAction(korean, aiNamer, translator); // 재귀 호출
  }

  const gitCommand = `git checkout -b ${selectedBranch}`;

  ui.copyToClipboard(gitCommand, `💡 터미널에 붙여넣기(Ctrl+V) 후 엔터를 누르세요.\n`);
}
