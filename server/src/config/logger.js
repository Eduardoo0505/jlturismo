/**
 * Logger simples com timestamp e nível (substitui console.log/error diretos).
 */
const NIVEIS = { debug: 0, info: 1, warn: 2, error: 3 };
const NIVEL_ATUAL = NIVEIS[process.env.LOG_LEVEL?.toLowerCase()] ?? NIVEIS.info;

function log(nivel, ...args) {
  if (NIVEIS[nivel] < NIVEL_ATUAL) return;
  const timestamp = new Date().toISOString();
  const prefixo = `[${timestamp}] [${nivel.toUpperCase()}]`;
  if (nivel === "error") {
    console.error(prefixo, ...args);
  } else if (nivel === "warn") {
    console.warn(prefixo, ...args);
  } else {
    console.log(prefixo, ...args);
  }
}

const logger = {
  debug: (...args) => log("debug", ...args),
  info:  (...args) => log("info",  ...args),
  warn:  (...args) => log("warn",  ...args),
  error: (...args) => log("error", ...args),
};

export default logger;
