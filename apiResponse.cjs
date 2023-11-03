/* eslint-disable require-jsdoc */
function sendResponse(res, statusCode, message, data) {
  const response = {
    status: statusCode,
    message: message,
    data: data,
  };
  res.status(statusCode).json(response);
}

module.exports = sendResponse;
