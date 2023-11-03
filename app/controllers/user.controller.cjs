/* eslint-disable max-len */
const db = require('../models/index.cjs');
const User = db.users;
const Op = db.Sequelize.Op;
const CoinLog = db.coinLogs;
const userService=require('../services/user.service.cjs');
const sendResponse = require('../../apiResponse.cjs');


exports.createUser=async (req, res)=>{
  try {
    if (!req.body.phoneNumber || !req.body.passWord) {
      return sendResponse(res, 400, 'phone number and passWord are required!', null);
    }
    const userData = {
      phoneNumber: req.body.phoneNumber,
      passWord: req.body.passWord,
      name: req.body.name,
      birth: req.body.birth,
      gender: req.body.gender,
      bio: req.body.bio,
      about: req.body.about,
      coin: req.body.coin,
    };
    const createUser=await userService.createUser(userData);
    return sendResponse(res, createUser.status, createUser.message, createUser.data);
  } catch (error) {
    return sendResponse(res, 500, 'Server', null);
  }
};


exports.update = async (req, res) => {
  const userId = req.params.id;
  const userData = req.body;
  try {
    const updatedUser = await userService.updateUser(userId, userData);
    return sendResponse(res, updatedUser.status, updatedUser.message, null);
  } catch (error) {
    return sendResponse(res, 500, error.message, null);
  }
};


exports.login = async (req, res) => {
  try {
    const {phoneNumber, passWord} = req.body;
    const loginResult = await userService.login(phoneNumber, passWord);
    return sendResponse(res, 200, loginResult.message, loginResult.token);
  } catch (err) {
    return sendResponse(res, 500, err.message, null);
  }
};


exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUser(userId);
    return sendResponse(res, 200, user.message, user.data);
  } catch (err) {
    return sendResponse(res, 500, err.message, null);
  }
};

exports.deleteUsers=async (req, res)=>{
  const userId=req.params.id;
  try {
    const deleteUser=await userService.deleteUser(userId);
    return sendResponse(res, 200, deleteUser.message, deleteUser.data);
  } catch (error) {
    sendResponse(res, 500, error.message||'Server error', null);
  }
};


exports.getUserCoinLog = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({
        error: 'User not found',
      });
    }
    const coinLogs = await CoinLog.findAll({
      where: {
        userId: userId,
        currentUserCoinChange: {[Op.ne]: 0},
      },
    });
    const userCoinLogs = coinLogs.map((coinLog) => ({
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
      userCoinLogs: userCoinLogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: 'Server error',
    });
  }
};
