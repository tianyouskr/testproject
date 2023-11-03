/* eslint-disable max-len */
'use strict';
const db = require('../models/index.cjs');
// const jwtUtil = require('../../jwtUtil.cjs');
const Consultant = db.consultants;
// const Review = db.reviews;
const CoinLog = db.coinLogs;
const Op = db.Sequelize.Op;
const sendResponse = require('/Users/qingdu/nodejsserver/apiResponse.cjs');
const consultantService = require('../services/consultant.service.cjs');
// const middleware=require('../middlewares/verifyToken.cjs');
exports.createConsultant = async (req, res) => {
  if (!req.body.phoneNumber || !req.body.passWord) {
    return sendResponse(res, 400, 'phone number and passWord are required!', null);
  }

  const consultantData = {
    phoneNumber: req.body.phoneNumber,
    passWord: req.body.passWord,
    name: req.body.name,
    coin: req.body.coin,
    workingCondition: req.body.workingCondition,
    serviceStatus: req.body.serviceStatus,
    totalOrders: req.body.totalOrders,
    rating: req.body.rating,
    commentCount: req.body.commentCount,
    price: req.body.price,
    introduction: req.body.introduction,
  };
  try {
    const resdata = await consultantService.createConsultant(consultantData);
    sendResponse(res, resdata.status, resdata.message, resdata.data);
  } catch (err) {
    sendResponse(
        res,
        500,
        err.message || 'Some error occurred while creating the Consultant',
        null,
    );
  }
};


exports.update = async (req, res) => {
  const id = req.params.id;
  const consultantData = req.body;
  try {
    const response=await consultantService.updateConsultant(id, consultantData);
    return sendResponse(res, response.status, response.message, null);
  } catch (err) {
    return sendResponse(res, 500, err.message, null);
  }
};


exports.getConsultantList = async (req, res) => {
  const queryParams=req.query;
  try {
    const consultants=await consultantService.getConsultantList(queryParams);
    return sendResponse(res, 200, 'Consultant list retrieved successfully', consultants);
  } catch (err) {
    return sendResponse(res, 500, err.message, null);
  }
};


exports.getConsultantById = async (req, res) => {
  try {
    const {id} =req.params;
    const consultantDetails =await consultantService.getConsultantById(id);
    return sendResponse(res, 200, 'Consultant details retrieved successfully', consultantDetails);
  } catch (err) {
    return sendResponse(res, 500, err.message, null);
  }
};


exports.login = async (req, res) => {
  try {
    const {phoneNumber, passWord} = req.body;
    const loginResult = await consultantService.login(phoneNumber, passWord);
    return sendResponse(res, 200, loginResult.message, loginResult.token);
  } catch (err) {
    return sendResponse(res, 500, err.message, null);
  }
};


exports.getConsultant = async (req, res) => {
  try {
    const consultantId = req.params.id;
    const consultant = await consultantService.getConsultant(consultantId);
    return sendResponse(res, 200, consultant.message, consultant.data);
  } catch (err) {
    return sendResponse(res, 500, err.message, null);
  }
};


exports.deleteConsultants=async (req, res)=>{
  const consultantId=req.params.id;
  try {
    const deleteConsultant=await consultantService.deleteConsultant(consultantId);
    return sendResponse(res, 200, deleteConsultant.message, deleteConsultant.data);
  } catch (error) {
    sendResponse(res, 500, error.message||'Server error', null);
  }
};

exports.getConsultantCoinLog = async (req, res) => {
  const consultantId = req.params.id;
  try {
    const consultant = await Consultant.findByPk(consultantId);
    if (!consultant) {
      return res.status(404).send({
        error: 'Consultant not found',
      });
    }
    const coinLogs = await CoinLog.findAll({
      where: {
        consultantId,
        currentConsultantChange: {[Op.ne]: 0},
      },
    });
    const consultantCoinLogs = coinLogs.map((coinLog) => ({
      userId: coinLog.userId,
      consultantId: coinLog.consultantId,
      orderId: coinLog.orderId,
      reviewId: coinLog.reviewId,
      timestamp: coinLog.timestamp,
      currentUserCoinChange: coinLog.currentUserCoinChange,
      currentConsultantChange: coinLog.currentConsultantChange,
      reason: coinLog.reason,
      userCoin: coinLog.userCoin,
    }));
    res.status(200).send({
      consultantCoinLogs: consultantCoinLogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: 'Server error',
    });
  }
};
