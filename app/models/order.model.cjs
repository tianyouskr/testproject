module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define('order', {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    isUrgent: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    expiredAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('DATE_ADD(NOW(),INTERVAL 1 DAY)'),
      // 建表的时候不能加上这句，可能由于mysql版本不兼容，无法建表，但是当存在表之后，加上也可以正常显示
    },
    status: {
      // eslint-disable-next-line new-cap
      type: Sequelize.ENUM('pending', 'expired', 'completed'),
      defaultValue: 'pending',
    },
    isResponse: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    consultantReply: {
      type: Sequelize.TEXT,
      defaultValue: 'The order is waiting for a reply',
    },
    userId: {
      type: Sequelize.INTEGER,
      defaultValue: '0',
    },
    consultantId: {
      type: Sequelize.INTEGER,
      defaultValue: '0',
    },
  });
  return Order;
};
