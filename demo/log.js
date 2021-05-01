const { util } = require('../');

const logger = util.log.createLogger('hh');

logger.debug('我是 debug');
logger.info('我是 info');
logger.error('我是 error');
