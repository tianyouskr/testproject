module.exports = (sequelize, Sequelize) => {
  const CoinLog = sequelize.define('coinLog', {
    orderId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    reviewId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    consultantId: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    timestamp: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
    },
    currentUserCoinChange: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    currentConsultantChange: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    reason: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userCoin: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    consultantCoin: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  });
  return CoinLog;
};
