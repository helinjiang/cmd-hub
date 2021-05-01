import debug from 'debug';

interface createLoggerReturn {
  debug: debug.Debugger;
  info: debug.Debugger;
  error: debug.Debugger;
}

export const LOG_LEVEL = {
  ERROR: 'error',
  INFO: 'info',
  DEBUG: 'debug',
};

export const LOG_TARGET_KEY = {
  ERROR: `${getLogTagName(true)}error`,
  INFO: `${getLogTagName(true)}info`,
  DEBUG: `${getLogTagName(true)}debug`,
  CMD_OUT: `${getLogTagName(true)}stdout`,
  CMD_ERR: `${getLogTagName(true)}stderr`,
};

export const createDebug = debug;

/**
 * 获得 tag 名字，在日志最开始打印出来，可用于区分日志
 *
 * @param {boolean} [withSep]  是否需要追加一个分隔符号:
 */
export function getLogTagName(withSep?: boolean): string {
  const name = process.env.LOG_TAG_NAME || '';

  return withSep && name ? `${name}:` : name;
}

/**
 * 创建 logger
 *
 * @param {string} [namespace] 额外的标识
 */
export function createLogger(namespace?: string): createLoggerReturn {
  const extra = namespace ? `:${namespace}` : '';

  return {
    // 这个级别最低的东东，一般的来说，在系统实际运行过程中，一般都是不输出的。
    // 因此这个级别的信息，可以随意的使用，任何觉得有利于在调试时更详细的了解系统运行状态的东东，比如变量的值等等，都输出来看看也无妨。
    // 注意不要用 [debug] 这种，因为会被当做正则表达式去过滤的
    debug: createDebug(`${LOG_TARGET_KEY.DEBUG}${extra}`),

    // 这个应该用来反馈系统的当前状态给最终用户的，所以，在这里输出的信息，应该对最终用户具有实际意义，也就是最终用户要能够看得明白是什么意思才行。
    // 从某种角度上说，Info 输出的信息可以看作是软件产品的一部分（就像那些交互界面上的文字一样），所以需要谨慎对待，不可随便。
    info: createDebug(`${LOG_TARGET_KEY.INFO}${extra}`),

    error: createDebug(`${LOG_TARGET_KEY.ERROR}${extra}`),
  };
}

function getDebugEnableConfig(logLevel: string) {
  const LOG_NAMESPACE = {
    ERROR: [`${LOG_TARGET_KEY.ERROR}*`],
    INFO: [`${LOG_TARGET_KEY.INFO}*`],
    DEBUG: [`${LOG_TARGET_KEY.DEBUG}*`],
    CMD: [LOG_TARGET_KEY.CMD_OUT, LOG_TARGET_KEY.CMD_ERR],
  };

  let result: string[] = [];

  switch (logLevel) {
    case LOG_LEVEL.ERROR:
      result = result.concat(LOG_NAMESPACE.ERROR, LOG_NAMESPACE.CMD);
      break;
    case LOG_LEVEL.DEBUG:
      result = result.concat(
        LOG_NAMESPACE.ERROR,
        LOG_NAMESPACE.INFO,
        LOG_NAMESPACE.DEBUG,
        LOG_NAMESPACE.CMD,
      );
      break;
    default:
      result = result.concat(LOG_NAMESPACE.ERROR, LOG_NAMESPACE.INFO, LOG_NAMESPACE.CMD);
      break;
  }

  return result.join(',');
}

// 默认使用 info 级别的日志
debug.enable(getDebugEnableConfig(process.env.LOG_LEVEL || LOG_LEVEL.INFO));
