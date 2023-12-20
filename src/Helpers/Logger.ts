import * as pino from "pino";

const log = pino.default({
  transport: {
    target: 'pino-pretty'
  },
  level: 'debug'
})

export { log };
