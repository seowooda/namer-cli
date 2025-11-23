import { AiNamer } from "../services/AiNamer.js";
import { Translator } from "../services/Translator.js";
import { cleanText } from "../utils/textUtils.js";
import { generateCode } from "../utils/fileGenerator.js";
import { ui } from "../utils/ui.js";
import * as changeCase from "change-case";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

export async function handleVariableAction(
  korean: string,
  aiNamer: AiNamer,
  translator: Translator,
  config: any
) {
  let choices: any[] = [];

  // 1. AI 추천
  console.log(`\n🤖 AI(Gemini)가 문맥을 파악하여 작명 중입니다...`);
  const aiSuggestions = await aiNamer.suggestNames(korean);

  if (aiSuggestions.length > 0) {
    choices = ui.formatChoices(aiSuggestions, "✨ AI 추천: ");
    choices.push(new inquirer.Separator());
  } else {
    console.log("   (AI 설정이 없거나 실패하여 일반 번역기로 전환합니다)");
  }

  // 2. 일반 번역 (Fallback)
  if (choices.length === 0 || choices.length === 1) {
    // Separator만 있는 경우 대비
    const result = await translator.translate(korean);
    const cleaned = cleanText(result.text);

    choices = [
      ...choices,
      {
        name: `🐪 camelCase:  ${changeCase.camelCase(cleaned)}`,
        value: changeCase.camelCase(cleaned),
      },
      {
        name: `🐍 snake_case: ${changeCase.snakeCase(cleaned)}`,
        value: changeCase.snakeCase(cleaned),
      },
      {
        name: `🥙 kebab-case: ${changeCase.kebabCase(cleaned)}`,
        value: changeCase.kebabCase(cleaned),
      },
      {
        name: `👔 PascalCase: ${changeCase.pascalCase(cleaned)}`,
        value: changeCase.pascalCase(cleaned),
      },
      {
        name: `📢 Constant:    ${changeCase.constantCase(cleaned)}`,
        value: changeCase.constantCase(cleaned),
      },
    ];
  }

  // [NEW] 다시 추천받기 옵션 추가
  choices.push(new inquirer.Separator());
  choices.push({ name: "🔄 다시 추천받기", value: "RETRY" });

  // 3. 선택 및 복사
  const selectedName = await ui.selectVariable(choices);

  if (selectedName === "RETRY") {
    console.log("\n🔄 다른 이름으로 다시 시도합니다...");
    return handleVariableAction(korean, aiNamer, translator, config); // 재귀 호출
  }

  ui.copyToClipboard(selectedName, "");

  // 4. 파일 생성 로직
  const createType = await ui.selectCreateType();

  if (createType === "copy_only") {
    console.log("👋 종료합니다.");
    return;
  }

  if (createType === "single") {
    await handleSingleFile(selectedName, config);
  } else {
    await handleBundle(selectedName, config);
  }
}

async function handleSingleFile(selectedName: string, config: any) {
  const fileOpts = await ui.askSingleFileOpts();
  const ext =
    fileOpts.extension === "직접입력" ? fileOpts.customExt : fileOpts.extension;
  const folderPath = path.resolve(process.cwd(), fileOpts.folder);

  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  const fullPath = path.join(folderPath, `${selectedName}${ext}`);
  fs.writeFileSync(fullPath, generateCode(selectedName, ext, config));
  console.log(`✅ 생성 완료: ${fullPath}`);
}

async function handleBundle(selectedName: string, config: any) {
  const bundleOpts = await ui.askBundleOpts();
  const componentName = changeCase.pascalCase(selectedName);
  const folderPath = path.resolve(
    process.cwd(),
    bundleOpts.folder,
    componentName
  );

  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
  console.log(`\n📁 폴더 생성: ${folderPath}`);

  // Component
  fs.writeFileSync(
    path.join(folderPath, `${componentName}.tsx`),
    generateCode(componentName, ".tsx", config)
  );
  console.log(`  └─ ⚛️ ${componentName}.tsx`);

  // Style
  const styleExt = config.styleType === "module-css" ? ".module.css" : ".css";
  fs.writeFileSync(
    path.join(folderPath, `${componentName}${styleExt}`),
    generateCode(componentName, styleExt, config)
  );
  console.log(`  └─ 🎨 ${componentName}${styleExt}`);

  // Index
  fs.writeFileSync(
    path.join(folderPath, `index.ts`),
    generateCode(componentName, "index", config)
  );
  console.log(`  └─ 🔗 index.ts`);

  console.log(
    `\n🎉 설정(${config.reactTemplate}, ${config.styleType})에 맞춰 생성 완료!`
  );
}
