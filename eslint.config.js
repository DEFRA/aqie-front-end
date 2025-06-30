import { fileURLToPath } from 'url'
import { dirname } from 'path'
import neostandard from 'neostandard'

const dirnamePath = dirname(fileURLToPath(import.meta.url)) // ''

export default neostandard({
  env: ['node', 'vitest'],
  ignores: [
    ...neostandard.resolveIgnoresFromGitignore(),
    'src/client/**/*',
    'src/client/assets/**/*',
    'src/**/*.scss',
    '.public/**/*',
    'dist/**/*',
    '.venv/**/*',
    'public/javascripts/**/*',
    'src/server/common/**/*'
  ],
  files: ['src/**/*.js'],
  noJsx: true,
  noStyle: true,
  plugins: [dirnamePath + '/node_modules/eslint-plugin-prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
})
