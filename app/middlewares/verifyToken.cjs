const jwtUtil=require('../../jwtUtil.cjs');
const consultantService =require('../services/consultant.service.cjs');
const userService=require('../services/user.service.cjs');
const sendResponse = require('../../apiResponse.cjs');


exports.verifyConsultantToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return sendResponse(res, 403, 'No token provided', null);
    }

    token = token.substr(7);
    const decoded = await jwtUtil.verifyToken(token);
    if (decoded.id != req.params.id) {
      return sendResponse(res, 500, 'Id error', null);
    }

    const consultant = await consultantService.getConsultant(decoded.id);
    req.consultant = consultant;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return sendResponse(res, 401, 'Unauthorized', null);
    }

    return sendResponse(res, 500, err.message || 'Internal Server Error', null);
  }
};

exports.verifyUserToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return sendResponse(res, 403, 'No token provided', null);
    }

    token = token.substr(7);
    const decoded = await jwtUtil.verifyToken(token);
    if (decoded.id != req.params.id) {
      return sendResponse(res, 500, 'Id error', null);
    }

    const user = await userService.getUser(decoded.id);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return sendResponse(res, 401, 'Unauthorized', null);
    }

    return sendResponse(res, 500, err.message || 'Internal Server Error', null);
  }
};

