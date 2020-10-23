import { ESLint } from 'eslint';
import * as path from 'path';
import { generateConfig } from '../dist';

function cleanResults(results: ESLint.LintResult[]) {
  return results.map((result) => {
    return {
      ...result,
      messages: result.messages.map(({ line, column, ruleId, message }) => {
        return { line, column, ruleId, message };
      }),
    };
  });
}

describe('functional', function () {
  test('basic lint', async function () {
    const eslint = new ESLint({
      baseConfig: generateConfig(),
    });

    const results = cleanResults(
      await eslint.lintText(`console.log("Hello world!")`, { filePath: path.join(__dirname, 'file.js') })
    );

    expect(results[0].messages).toMatchInlineSnapshot(`
      Array [
        Object {
          "column": 1,
          "line": 1,
          "message": "Unexpected console statement.",
          "ruleId": "no-console",
        },
        Object {
          "column": 13,
          "line": 1,
          "message": "Replace \`\\"Hello·world!\\")\` with \`'Hello·world!');⏎\`",
          "ruleId": "prettier/prettier",
        },
        Object {
          "column": 28,
          "line": 1,
          "message": "Missing semicolon.",
          "ruleId": "semi",
        },
      ]
    `);
  });

  describe('Vue', function () {
    test('basic lint', async function () {
      const eslint = new ESLint({
        baseConfig: generateConfig({
          vue: true,
        }),
      });

      const results = cleanResults(await eslint.lintFiles(path.join(__dirname, 'fixtures', 'component.vue')));

      expect(results[0].messages).toMatchInlineSnapshot(`
        Array [
          Object {
            "column": 5,
            "line": 4,
            "message": "Component name \\"transition\\" is not PascalCase.",
            "ruleId": "vue/component-name-in-template-casing",
          },
          Object {
            "column": 29,
            "line": 5,
            "message": "Replace \`⏎········my·image:·<img·src=\\"https://example.com/image.png\\"·/>⏎······\` with \`my·image:·<img·src=\\"https://example.com/image.png\\"·/>\`",
            "ruleId": "prettier/prettier",
          },
          Object {
            "column": 19,
            "line": 6,
            "message": "Disallow self-closing on HTML void elements (<img/>).",
            "ruleId": "vue/html-self-closing",
          },
          Object {
            "column": 28,
            "line": 13,
            "message": "Delete \`·\`",
            "ruleId": "prettier/prettier",
          },
          Object {
            "column": 5,
            "line": 18,
            "message": "Component name \\"v-component\\" is not PascalCase.",
            "ruleId": "vue/component-name-in-template-casing",
          },
          Object {
            "column": 5,
            "line": 30,
            "message": "Unexpected console statement.",
            "ruleId": "no-console",
          },
          Object {
            "column": 17,
            "line": 30,
            "message": "Replace \`\\"Hello·world!\\"\` with \`'Hello·world!'\`",
            "ruleId": "prettier/prettier",
          },
        ]
      `);
    });
  });
});
