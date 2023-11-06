/* eslint-disable max-len */
const favoriteTableService =require('../services/favoriteTable.service.cjs');
const sendResponse=require('../../apiResponse.cjs');

exports.createFavoriteTable = async (req, res) => {
  const userId = req.params.id;
  const {consultantId} = req.body;
  try {
    const result = await favoriteTableService.createFavoriteTable(userId, consultantId);
    sendResponse(res, result.status, result.message, result.data);
  } catch (error) {
    sendResponse(res, 500, error.message||'Server error');
  }
};

exports.getFavoriteTableList = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await favoriteTableService.getFavoriteTableList(userId);
    sendResponse(res, result.status, result.message, result.data);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, error.message||'Server error');
  }
};


exports.deleteFavoriteTable = async (req, res) => {
  const {userId, consultantId}=req.body;
  try {
    const result = await favoriteTableService.deleteFavoriteTable(userId, consultantId);
    sendResponse(res, result.status, result.message, result.data);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, error.message||'Server error');
  }
};
