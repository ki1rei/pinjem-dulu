import nextConfig from 'eslint-config-next';
import prettierPlugin from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Pola hydration umum: setState di useEffect empty-deps untuk menandai client-mount.
      // Sengaja dimatikan agar starter tetap jalan.
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: true,
          endOfLine: 'auto',
        },
      ],
      indent: ['error', 2, { SwitchCase: 1 }],
    },
  },
  prettierPlugin,
];

export default config;
