/* eslint-disable require-jsdoc */
const db = require('../models/index.cjs');
const CoinLog = db.coinLogs;
const Order = db.orders;
const Consultant = db.consultants;
const User = db.users;
const Review = db.reviews;
async function createCoinLog(
    orderId,
    reviewId,
    userId,
    consultantId,
    userCoin,
    consultantCoin,
    timestamp,
    currentUserCoinChange,
    currentConsultantChange,
    reason,
) {
  try {
    await CoinLog.create({
      orderId,
      reviewId,
      userId,
      consultantId,
      userCoin,
      consultantCoin,
      timestamp,
      currentUserCoinChange: currentUserCoinChange,
      currentConsultantChange,
      reason,
    });
  } catch (error) {
    console.error(error);
    throw new Error('Server error');
  }
}


async function consultantCoinLog(orderId) {
  try {
    const order = await Order.findByPk(orderId);
    if (!orderId) {
      throw new Error('Server error');
    }
    const consultantId = order.consultantId;
    const userId = order.userId;
    if (!userId) {
      throw new Error('Server error');
    }
    const user = await User.findByPk(userId);
    if (consultantId) {
      const consultant = await Consultant.findByPk(consultantId);
      if (!consultant) {
        throw new Error('Server error');
      }
      const payAmount = order.isUrgent ? order.price * 1.5 : order.price;
      const timestamp = new Date();
      const currentConsultantChange = payAmount;
      const reason = 'Order id been reponsed';
      await createCoinLog(
          orderId,
          0,
          userId,
          consultantId,
          user.coin,
          consultant.coin,
          timestamp,
          0,
          currentConsultantChange,
          reason,
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error('Server error');
  }
}


async function handleOrderTimeout(orderId) {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('Server error');
    }
    const userId = order.userId;
    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Server error');
      }

      const refundAmount = order.price;
      const timestamp = new Date();
      const currentUserCoinChange = refundAmount;
      const reason = 'Order timeout refund';
      await createCoinLog(
          orderId,
          0,
          userId,
          0,
          user.coin,
          0,
          timestamp,
          currentUserCoinChange,
          0,
          reason,
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error('Server error');
  }
}


async function handleUrgentTimeout(orderId) {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('Server error ');
    }
    const userId = order.userId;
    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('server error');
      }

      const refundAmount = 0.5 * order.price;
      const timestamp = new Date();
      const currentUserCoinChange = refundAmount;
      const reason = 'Urgent Order timeout refund';
      await createCoinLog(
          orderId,
          0,
          userId,
          0,
          user.coin,
          0,
          timestamp,
          currentUserCoinChange,
          0,
          reason,
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error('Server error');
  }
}


async function rewardCoinLog(reviewId) {
  try {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      throw new Error('Server error');
    }
    const userId = review.userId;
    const consultantId = review.consultantId;
    if (!userId || !consultantId) {
      throw new Error('Server error ');
    }
    const user = await User.findByPk(userId);
    const consultant = await Consultant.findByPk(consultantId);
    if (!user || !consultant) {
      throw new Error('Server error');
    }
    const changeAmount = review.rewardAmount;
    const timestamp = new Date();
    const currentUserCoinChange = -changeAmount;
    const currentConsultantChange = changeAmount;
    const reason = 'rewardAmount';
    await createCoinLog(
        review.orderId,
        reviewId,
        userId,
        consultantId,
        user.coin,
        consultant.coin,
        timestamp,
        currentUserCoinChange,
        currentConsultantChange,
        reason,
    );
  } catch (error) {
    console.error(error);
    throw new Error('Server error');
  }
}


module.exports = {
  createCoinLog,
  consultantCoinLog,
  handleOrderTimeout,
  handleUrgentTimeout,
  rewardCoinLog,
};
