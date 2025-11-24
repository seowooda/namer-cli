import inquirer from 'inquirer';
import clipboardy from 'clipboardy';

export const ui = {
  // AI 추천 결과나 번역 결과를 선택지로 변환
  formatChoices(items: string[], prefix: string = '') {
    return items.map((item) => ({
      name: `${prefix}${item}`,
      value: item,
    }));
  },

  // 브랜치 선택 프롬프트
  async selectBranch(choices: (inquirer.Separator | { name: string; value: string })[]) {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: '🌿 생성할 브랜치 이름을 선택하세요:',
        choices: choices,
      },
    ]);
    return answer.selected;
  },

  // 변수명 선택 프롬프트
  async selectVariable(choices: (inquirer.Separator | { name: string; value: string })[]) {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: '✨ 마음에 드는 변수명을 선택하세요:',
        choices: choices,
      },
    ]);
    return answer.selected;
  },

  // 파일 생성 방식 선택
  async selectCreateType() {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'createType',
        message: '어떤 형태로 생성하시겠습니까?',
        choices: [
          { name: '📋 복사만 하고 종료', value: 'copy_only' },
          { name: '📄 단일 파일 생성', value: 'single' },
          { name: '📦 컴포넌트 번들 생성', value: 'bundle' },
        ],
      },
    ]);
    return answer.createType;
  },

  // 단일 파일 옵션 입력
  async askSingleFileOpts() {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'extension',
        message: '확장자:',
        choices: ['.tsx', '.ts', '.jsx', '.js', '.css', '직접입력'],
      },
      {
        type: 'input',
        name: 'customExt',
        message: '입력:',
        when: (a) => a.extension === '직접입력',
      },
      { type: 'input', name: 'folder', message: '폴더:', default: '.' },
    ]);
  },

  // 번들 폴더 옵션 입력
  async askBundleOpts() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'folder',
        message: '위치할 상위 폴더:',
        default: '.',
      },
    ]);
  },

  // 클립보드 복사 및 알림
  copyToClipboard(text: string, message: string) {
    clipboardy.writeSync(text);
    console.log(`\n📋 클립보드에 복사되었습니다: "${text}"`);
    console.log(message);
  },
};
