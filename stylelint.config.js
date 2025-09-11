/**
 * @type {Config}
 */
export default {
  extends: ['stylelint-config-gds/scss'],
  ignoreFiles: [
    '**/public/**',
    '**/package/**',
    '**/vendor/**',
    'src/client/assets/stylesheets/components/**/*.scss',
    'src/server/common/**/*.scss',
    '**/*.map',
    '**/*.scss.map',
    'node_modules/**',
    '.cache/**',
    'coverage/**'
  ]
}

/**
 * @import { Config } from 'stylelint'
 */
