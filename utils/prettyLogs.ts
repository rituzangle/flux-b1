// utils/prettyLogs.ts
/** Shared logging utility that’s:
- Colorful for quick visual parsing
- Includes line numbers to pinpoint issues
- No timestamps (cleaner output)
- Focused on meaningful, upfront info
- Uses ANSI escape codes for color, and Error().stack to extract line numbers.
**/
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const colors: Record<LogLevel, string> = {
  info: '\x1b[36m',   // cyan
  warn: '\x1b[33m',   // yellow
  error: '\x1b[31m',  // red
  debug: '\x1b[35m',  // magenta
};

function getLineInfo(): string {
  const stack = new Error().stack;
  if (!stack) return '';
  const lines = stack.split('\n');
  const caller = lines[3] || lines[2]; // skip logger internal frames
  const match = caller.match(/\(([^)]+)\)/);
  return match ? `at ${match[1]}` : caller.trim();
}

function log(level: LogLevel, message: string, context?: string) {
  const color = colors[level];
  const reset = '\x1b[0m';
  const lineInfo = getLineInfo();
  const prefix = context ? `[${context}]` : '';
  console.log(`${color}${level.toUpperCase()} ${prefix} ${message} ${reset} ${lineInfo}`);
}

export const logger = {
  info: (msg: string, ctx?: string) => log('info', msg, ctx),
  warn: (msg: string, ctx?: string) => log('warn', msg, ctx),
  error: (msg: string, ctx?: string) => log('error', msg, ctx),
  debug: (msg: string, ctx?: string) => log('debug', msg, ctx),
};
