exports.successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
  });
};

exports.errorResponse = (res, message, statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    status: false,
    message,
    error,
  });
};
