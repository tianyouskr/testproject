const db = require('../models/index.cjs');
const User = db.users;
const Consultant = db.consultants;
const FavoriteTable = db.favoriteTables;

exports.createFavoriteTable = async (req, res) => {
  const userId = req.params.id;
  const {consultantId} = req.body;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).send({
        message: 'User not found',
      });
    }
    const consultant = await Consultant.findByPk(consultantId);
    if (!consultant) {
      return res.status(400).send({
        message: 'Consultant not found',
      });
    }
    const isFavorited = await FavoriteTable.findOne({
      where: {
        userId: userId,
        consultantId: consultantId,
      },
    });
    if (isFavorited) {
      return res.status(400).send({
        message: 'The user has already favorited this consultant',
      });
    }
    const favoriteTable = await FavoriteTable.create({
      userId: userId,
      consultantId: consultantId,
    });
    return res.status(200).send({
      favoriteTable,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'An error occurred while processing your request.',
    });
  }
};
exports.getFavoriteTableList = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).send({
        message: 'User not found',
      });
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
    return res.status(200).send({
      consultants,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'An error occurred while processing your request.',
    });
  }
};
