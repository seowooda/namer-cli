import * as changeCase from 'change-case';
import { NamerConfig } from './configLoader.js';
import fs from 'fs';
import path from 'path';

// 🛠️ 템플릿 파일을 읽어서 구멍을 채워주는 도우미 함수
function loadUserTemplate(templatePath: string, name: string): string | null {
  try {
    // 사용자가 입력한 경로를 절대 경로로 변환
    const fullPath = path.resolve(process.cwd(), templatePath);

    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf-8');

      // 🔥 치환 로직 (사용자가 템플릿에 적은 변수를 실제 값으로 변경)
      // {{Name}} -> UserProfile (PascalCase)
      content = content.replace(/{{Name}}/g, changeCase.pascalCase(name));
      // {{name}} -> userProfile (camelCase)
      content = content.replace(/{{name}}/g, changeCase.camelCase(name));
      // {{kebab}} -> user-profile (paramCase)
      content = content.replace(/{{kebab}}/g, changeCase.kebabCase(name));

      return content;
    }
  } catch {
    return null;
  }
  return null;
}

export function generateCode(name: string, extension: string, config: NamerConfig): string {
  const componentName = changeCase.pascalCase(name);

  // ---------------------------------------------------------
  // 1️⃣ React 컴포넌트 (.tsx, .jsx)
  // ---------------------------------------------------------
  if (extension === '.tsx' || extension === '.jsx') {
    // 🚀 [Custom] 사용자 템플릿이 설정되어 있으면 그걸 먼저 사용
    if (config.templates?.component) {
      const customContent = loadUserTemplate(config.templates.component, name);
      if (customContent) return customContent;
    }

    // (사용자 템플릿이 없으면 내장 로직 실행)

    // A. Styled-components 사용 시
    if (config.styleType === 'styled-components') {
      const componentDecl =
        config.reactTemplate === 'arrow'
          ? `const ${componentName} = () => {
  return (
    <Container>
      {/* ${componentName} Component */}
    </Container>
  );
};

export default ${componentName};`
          : `export default function ${componentName}() {
  return (
    <Container>
      {/* ${componentName} Component */}
    </Container>
  );
}`;

      return `import React from 'react';
import styled from 'styled-components';

const Container = styled.div\`
  display: block;
\`;

${componentDecl}
`;
    }

    // B. CSS Modules 또는 일반 CSS 사용 시
    const styleImport =
      config.styleType === 'module-css'
        ? `import styles from './${componentName}.module.css';`
        : `import './${componentName}.css';`;

    const classNameUsage =
      config.styleType === 'module-css' ? 'className={styles.container}' : 'className="container"';

    if (config.reactTemplate === 'arrow') {
      return `import React from 'react';
${styleImport}

const ${componentName} = () => {
  return (
    <div ${classNameUsage}>
      {/* ${componentName} Component */}
    </div>
  );
};

export default ${componentName};
`;
    } else {
      return `import React from 'react';
${styleImport}

export default function ${componentName}() {
  return (
    <div ${classNameUsage}>
      {/* ${componentName} Component */}
    </div>
  );
}
`;
    }
  }

  // ---------------------------------------------------------
  // 2️⃣ 스타일 시트 (.css, .module.css, .scss)
  // ---------------------------------------------------------
  if (extension.includes('css') || extension.includes('scss')) {
    // 🚀 [Custom] 스타일용 커스텀 템플릿 확인
    if (config.templates?.style) {
      const customContent = loadUserTemplate(config.templates.style, name);
      if (customContent) return customContent;
    }

    return `/* ${name} styles */
.container {
  display: block;
}
`;
  }

  // ---------------------------------------------------------
  // 3️⃣ Index 파일 (re-export)
  // ---------------------------------------------------------
  if (extension === 'index') {
    // 🚀 [Custom] index용 커스텀 템플릿 확인
    if (config.templates?.index) {
      const customContent = loadUserTemplate(config.templates.index, name);
      if (customContent) return customContent;
    }

    return `export { default } from './${componentName}';
export * from './${componentName}';
`;
  }

  // ---------------------------------------------------------
  // 4️⃣ 일반 로직 (.ts, .js)
  // ---------------------------------------------------------
  if (extension === '.ts' || extension === '.js') {
    const varName = changeCase.camelCase(name);
    const isTs = extension === '.ts';

    // A. React Hook 감지 (use...)
    if (varName.startsWith('use')) {
      return `import { useState, useEffect } from 'react';

export const ${varName} = () => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // TODO: Implement logic
  }, []);

  return { state };
};
`;
    }

    // B. Boolean 함수 감지 (is..., has..., can..., should...)
    if (
      varName.startsWith('is') ||
      varName.startsWith('has') ||
      varName.startsWith('can') ||
      varName.startsWith('should')
    ) {
      return `export const ${varName} = ${isTs ? '(): boolean' : ''} => {
  return true;
};
`;
    }

    // C. 그 외 일반 함수
    return `export const ${varName} = () => {
  // TODO: Implement ${varName}
};
`;
  }

  return '';
}
