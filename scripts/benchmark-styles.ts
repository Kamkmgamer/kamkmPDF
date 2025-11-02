/**
 * ANSI Color Codes and Formatting Utilities
 * For beautiful benchmark output
 */

export const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Text colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",

  // Extended colors
  gray: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
};

export const styles = {
  title: (text: string) =>
    `${colors.brightCyan}${colors.bright}${text}${colors.reset}`,
  success: (text: string) => `${colors.brightGreen}${text}${colors.reset}`,
  error: (text: string) => `${colors.brightRed}${text}${colors.reset}`,
  warning: (text: string) => `${colors.brightYellow}${text}${colors.reset}`,
  info: (text: string) => `${colors.brightBlue}${text}${colors.reset}`,
  metric: (text: string) => `${colors.brightMagenta}${text}${colors.reset}`,
  dim: (text: string) => `${colors.dim}${colors.gray}${text}${colors.reset}`,
};

export function createHeader(title: string, subtitle?: string) {
  const width = 70;
  const border = "═".repeat(width);
  const titlePadding = Math.floor((width - title.length - 2) / 2);
  const titleLine = `  ${" ".repeat(titlePadding)}${title}${" ".repeat(width - titlePadding - title.length - 2)}`;

  let output = `\n${colors.brightCyan}╔${border}╗${colors.reset}\n`;
  output += `${colors.brightCyan}║${colors.reset}${titleLine}${colors.brightCyan}║${colors.reset}\n`;

  if (subtitle) {
    const subtitlePadding = Math.floor((width - subtitle.length - 2) / 2);
    const subtitleLine = `  ${" ".repeat(subtitlePadding)}${subtitle}${" ".repeat(width - subtitlePadding - subtitle.length - 2)}`;
    output += `${colors.brightCyan}║${colors.reset}${subtitleLine}${colors.brightCyan}║${colors.reset}\n`;
  }

  output += `${colors.brightCyan}╚${border}╝${colors.reset}\n`;
  return output;
}

export function createSeparator(char = "─", width = 70) {
  return `${colors.dim}${char.repeat(width)}${colors.reset}`;
}

export function createProgressBar(progress: number, width = 50) {
  const filled = Math.floor((progress / 100) * width);
  const empty = width - filled;

  const filledBar = `${colors.brightGreen}${"█".repeat(filled)}${colors.reset}`;
  const emptyBar = `${colors.dim}${"░".repeat(empty)}${colors.reset}`;

  return `${filledBar}${emptyBar}`;
}

export function formatMetric(
  label: string,
  value: string | number,
  color: (s: string) => string = styles.metric,
) {
  return `  ${colors.dim}${label}:${colors.reset} ${color(String(value))}`;
}

export function formatStatus(status: {
  completed: number;
  processing: number;
  queued: number;
  failed: number;
}) {
  return [
    `${colors.brightGreen}✅ ${status.completed}${colors.reset}`,
    `${colors.brightBlue}⚙️  ${status.processing}${colors.reset}`,
    `${colors.yellow}⏳ ${status.queued}${colors.reset}`,
    `${colors.brightRed}❌ ${status.failed}${colors.reset}`,
  ].join(" | ");
}
