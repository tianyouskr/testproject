module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('user', {
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
    birth: {
      type: Sequelize.DATE,
    },
    gender: {
      type: Sequelize.STRING,
    },
    bio: {
      type: Sequelize.TEXT,
    },
    about: {
      type: Sequelize.TEXT,
    },
    coin: {
      type: Sequelize.INTEGER,
    },
  });
  return User;
};
