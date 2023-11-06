/* eslint-disable max-len */
const db = require('../models/index.cjs');
const User = db.users;
const Consultant = db.consultants;
const FavoriteTable = db.favoriteTables;


exports.createFavoriteTable = async (userId, consultantId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return {status: 400, message: 'User not found', data: null};
    }
    const consultant = await Consultant.findByPk(consultantId);
    if (!consultant) {
      return {status: 400, message: 'Consultant not found', data: null};
    }
    const isFavorited = await FavoriteTable.findOne({
      where: {
        userId: userId,
        consultantId: consultantId,
      },
    });
    if (isFavorited) {
      return {status: 400, message: 'The user has already favorited this consultant', data: null};
    }
    const favoriteTable = await FavoriteTable.create({
      userId: userId,
      consultantId: consultantId,
    });
    return {status: 200, message: 'FavoriteTable created successfully', data: favoriteTable};
  } catch (error) {
    console.error(error);
    return {status: 500, message: 'An error occurred while processing your request.', data: null};
  }
};


exports.getFavoriteTableList = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return {status: 400, message: 'User not found', data: null};
    }
    const favoriteTables = await FavoriteTable.findAll({
      where: {userId: userId},
      attributes: ['consultantId'],
    });
    const consultantIds = favoriteTables.map(
        (favoriteTable) => favoriteTable.consultantId,
    );
    const consultants = await Consultant.findAll({
      where: {
        id: consultantIds,
      },
      attributes: [
        'name',
        'workingCondition',
        'serviceStatus',
        'rating',
        'introduction',
        'price',
      ],
    });
    return {status: 200, message: 'FavoriteTable list retrieved successfully', data: consultants};
  } catch (error) {
    console.error(error);
    return {status: 500, message: 'An error occurred while processing your request.', data: null};
  }
};


exports.deleteFavoriteTable = async (userId, consultantId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return {status: 400, message: 'User not found', data: null};
    }
    const favoriteTable = await FavoriteTable.findOne({
      where: {
        userId: userId,
        consultantId: consultantId,
      },
    });
    if (!favoriteTable) {
      return {status: 400, message: 'FavoriteTable not found', data: null};
    }
    await favoriteTable.destroy();
    return {status: 200, message: 'FavoriteTable deleted successfully', data: null};
  } catch (error) {
    console.error(error);
    return {status: 500, message: 'An error occurred while processing your request.', data: null};
  }
};
