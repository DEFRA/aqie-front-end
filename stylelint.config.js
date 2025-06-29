/**
 * @type {Config}
 */
export default {
  extends: ['stylelint-config-gds/scss'],
  ignoreFiles: [
    '**/public/**',
    '**/package/**',
    '**/vendor/**',
    'src/client/assets/stylesheets/components/**/*.scss'
  ]
}

/**
 * @import { Config } from 'stylelint'
 */
