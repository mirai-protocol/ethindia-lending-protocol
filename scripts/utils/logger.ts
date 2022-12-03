const logger = require("fancy-log");

export function log(a: string) {
  logger(a);
}
export function logError(a: string) {
  logger.error(a);
}
