#!/usr/bin/env node
import { Command } from "commander";
import { Translator } from "./services/Translator";
import { cleanText } from "./utils/textUtils";
import { generateCode } from "./utils/fileGenerator";
import { loadConfig } from "./utils/configLoader"; // 👈 Loader 추가
import * as changeCase from "change-case";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";

const program = new Command();
const translator = new Translator();

program
  .version("1.0.0")
  .argument("<korean>", "번역할 한글 문장")
  .action(async (korean) => {
    try {
      // 🔥 0. 설정 로드 (가장 먼저 실행)
      const config = loadConfig();

      // 1. 번역
      const result = await translator.translate(korean);
      const cleaned = cleanText(result.text);

      // 2. 추천 목록
      const choices = [
        {
          name: `🐪 camelCase:  ${changeCase.camelCase(cleaned)}`,
          value: changeCase.camelCase(cleaned),
        },
        {
          name: `🐍 snake_case: ${changeCase.snakeCase(cleaned)}`,
          value: changeCase.snakeCase(cleaned),
        },
        {
          name: `🥙 kebab-case: ${changeCase.paramCase(cleaned)}`,
          value: changeCase.paramCase(cleaned),
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

      const answerName = await inquirer.prompt([
        {
          type: "list",
          name: "selected",
          message: "✨ 마음에 드는 변수명을 선택하세요:",
          choices: choices,
        },
      ]);
      const selectedName = answerName.selected;

      const answerType = await inquirer.prompt([
        {
          type: "list",
          name: "createType",
          message: "어떤 형태로 생성하시겠습니까?",
          choices: [
            { name: "📄 단일 파일 생성", value: "single" },
            { name: "📦 컴포넌트 번들 생성", value: "bundle" },
          ],
        },
      ]);

      // A. 단일 파일
      if (answerType.createType === "single") {
        const fileOpts = await inquirer.prompt([
          {
            type: "list",
            name: "extension",
            message: "확장자:",
            choices: [".tsx", ".ts", ".jsx", ".js", ".css", "직접입력"],
          },
          {
            type: "input",
            name: "customExt",
            message: "입력:",
            when: (a) => a.extension === "직접입력",
          },
          { type: "input", name: "folder", message: "폴더:", default: "." },
        ]);

        const ext =
          fileOpts.extension === "직접입력"
            ? fileOpts.customExt
            : fileOpts.extension;
        const folderPath = path.resolve(process.cwd(), fileOpts.folder);
        if (!fs.existsSync(folderPath))
          fs.mkdirSync(folderPath, { recursive: true });

        const fullPath = path.join(folderPath, `${selectedName}${ext}`);

        // config 전달
        fs.writeFileSync(fullPath, generateCode(selectedName, ext, config));
        console.log(`✅ 생성 완료: ${fullPath}`);
      }

      // B. 번들 생성
      else {
        const bundleOpts = await inquirer.prompt([
          {
            type: "input",
            name: "folder",
            message: "위치할 상위 폴더:",
            default: ".",
          },
        ]);

        const componentName = changeCase.pascalCase(selectedName);
        const folderPath = path.resolve(
          process.cwd(),
          bundleOpts.folder,
          componentName
        );

        if (!fs.existsSync(folderPath))
          fs.mkdirSync(folderPath, { recursive: true });
        console.log(`\n📁 폴더 생성: ${folderPath}`);

        // 1. Component.tsx (config 전달)
        fs.writeFileSync(
          path.join(folderPath, `${componentName}.tsx`),
          generateCode(componentName, ".tsx", config)
        );
        console.log(`  └─ ⚛️ ${componentName}.tsx`);

        // 2. 스타일 파일 (설정에 따라 확장자 결정)
        const styleExt =
          config.styleType === "module-css" ? ".module.css" : ".css";
        fs.writeFileSync(
          path.join(folderPath, `${componentName}${styleExt}`),
          generateCode(componentName, styleExt, config)
        );
        console.log(`  └─ 🎨 ${componentName}${styleExt}`);

        // 3. index.ts
        fs.writeFileSync(
          path.join(folderPath, `index.ts`),
          generateCode(componentName, "index", config)
        );
        console.log(`  └─ 🔗 index.ts`);

        console.log(
          `\n🎉 설정(${config.reactTemplate}, ${config.styleType})에 맞춰 생성 완료!`
        );
      }
    } catch (error) {
      console.error("❌ 오류:", error);
    }
  });

program.parse(process.argv);
