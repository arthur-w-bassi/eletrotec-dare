type LogLevel = "error" | "warn" | "info";

function writeLine(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const line = JSON.stringify({
    level,
    message,
    ...meta,
    ts: new Date().toISOString(),
  });
  process.stderr.write(`${line}\n`);
}

export const logService = {
  error(message: string, meta?: Record<string, unknown>): void {
    writeLine("error", message, meta);
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    writeLine("warn", message, meta);
  },
  info(message: string, meta?: Record<string, unknown>): void {
    writeLine("info", message, meta);
  },
};
