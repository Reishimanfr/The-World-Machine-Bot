import * as pino from "pino";

const logger = pino.default({
  transport: {
    target: 'pino-pretty'
  },
  level: 'debug'
})

export { logger };
