/* eslint-disable require-jsdoc */
'use strict';
const db = require('./app/models/index.cjs');
const Order = db.orders;
const User = db.users;
const {
  handleOrderTimeout,
  handleUrgentTimeout,
} = require('./app/controllers/coinLog.controllers.cjs');

async function startOrderStatusCheck() {
  try {
    const orders = await Order.findAll({where: {status: 'pending'}});

    for (const order of orders) {
      const createdTime = new Date(order.createdAt);
      const currentTime = new Date();
      const timeDifference = currentTime - createdTime;
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));
      if (minutesDifference >= 1440) {
        order.status = 'expired';
        order.updatedAt = new Date();
        await order.save();
        const user = await User.findByPk(order.userId);
        if (user) {
          user.coin += order.price;
          await user.save();
        }
        handleOrderTimeout(order.id);
      }
    }
  } catch (error) {
    console.error(error);
  }
}
async function checkUrgentOrders() {
  try {
    const orders = await Order.findAll({where: {isUrgent: true}});

    for (const order of orders) {
      const createdTime = new Date(order.createdAt);
      // const expiresAt=new Date(createdTime.getTime()+60*60*1000);
      const expiresAt = new Date(createdTime.getTime() + 60 * 1000);
      // 测试用，先搞成1分钟就过期
      const currentTime = new Date();
      if (currentTime >= expiresAt) {
        order.isUrgent = false;
        order.updatedAt = new Date();
        await order.save();
        const user = await User.findByPk(order.userId);
        if (user) {
          user.coin += 0.5 * order.price;
          await user.save();
        }
        handleUrgentTimeout(order.id);
      }
    }
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  checkUrgentOrders,
  startOrderStatusCheck,
};
