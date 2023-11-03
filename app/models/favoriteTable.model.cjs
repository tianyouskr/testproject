module.exports = (sequelize, Sequelize) => {
  const FavoriteTable = sequelize.define('favoriteTable', {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    consultantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });
  return FavoriteTable;
};
