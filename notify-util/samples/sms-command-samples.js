import { parseInboundSmsCommand } from '../index.js'

// Global STOP
console.log('[SMS] STOP ->', parseInboundSmsCommand('STOP'))

// Specific STOP without prefix filtering
console.log('[SMS] STOP ACME-123 ->', parseInboundSmsCommand('STOP ACME-123'))

// Specific STOP with prefix filtering (prefix: ACME)
console.log(
  '[SMS] STOP ACME-123 (prefix ACME) ->',
  parseInboundSmsCommand('STOP ACME-123', { prefix: 'ACME' })
)

// Specific STOP with non-matching prefix (prefix: DEF) falls back to global
console.log(
  '[SMS] STOP ACME-123 (prefix DEF) ->',
  parseInboundSmsCommand('STOP ACME-123', { prefix: 'DEF' })
)

// Unknown command
console.log('[SMS] START ->', parseInboundSmsCommand('START'))
