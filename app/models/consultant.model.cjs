/* eslint-disable new-cap */
module.exports = (sequelize, Sequelize) => {
  const Consultant = sequelize.define('consultant', {
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    passWord: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    coin: {
      type: Sequelize.INTEGER,
    },
    workingCondition: {
      type: Sequelize.ENUM('Idle', 'Busy'),
      defaultValue: 'Idle',
    },
    serviceStatus: {
      type: Sequelize.ENUM('Available', 'Unavailable'),
      defaultValue: 'Available',
    },
    totalOrders: {
      type: Sequelize.INTEGER,
    },
    completedOrders: {
      type: Sequelize.INTEGER,
    },
    rating: {
      type: Sequelize.FLOAT,
    },
    commentCount: {
      type: Sequelize.INTEGER,
    },
    price: {
      type: Sequelize.INTEGER,
    },
    introduction: {
      type: Sequelize.TEXT,
    },
  });
  return Consultant;
};
