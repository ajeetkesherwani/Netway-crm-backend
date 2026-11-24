const { AsyncLocalStorage } = require("async_hooks");
const { randomUUID } = require("crypto");

const requestStorage = new AsyncLocalStorage();

const requestContext = (req, res, next) => {
  const context = { req, requestId: randomUUID() };
  req.requestId = context.requestId;
  res.setHeader("X-Request-Id", context.requestId);
  requestStorage.run(context, next);
};

const getRequestContext = () => requestStorage.getStore();

module.exports = { requestContext, getRequestContext };
