
const db = require('../models/index.cjs');
const Review = db.reviews;
const User = db.users;
const Consultant = db.consultants;
const Order = db.orders;
const {rewardCoinLog} = require('./coinLog.controllers.cjs');
const redis = require('redis');
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});
exports.createReview = async (req, res) => {
  const orderId = req.params.id;
  const {rating, comment, rewardAmount} = req.body;
  if (!comment) {
    return res.status(400).send({
      message: 'comment is required.',
    });
  }
  try {
    const order = await Order.findOne({
      where: {id: orderId, status: 'completed'},
    });
    if (!order) {
      return res.status(404).send({
        message: 'Order not found or cannot be reviewed.',
      });
    }
    const consultant = await Consultant.findByPk(order.consultantId);
    const user = await User.findByPk(order.userId);
    const existingReiew = await Review.findOne({where: {orderId: orderId}});
    if (existingReiew) {
      return res.status(404).send({
        message: 'You have made an review already.',
      });
    }
    let enoughcoin = true;
    const consultantId = order.consultantId;
    const userId = order.userId;
    if (user.coin < rewardAmount) {
      enoughcoin = false;
      return res.status(200).send({
        message: 'Your coin is not enough',
      });
    }
    if (enoughcoin) {
      const review = await Review.create({
        orderId: orderId,
        userId: userId,
        consultantId: consultantId,
        rating,
        comment,
        rewardAmount,
        userName: user.name,
      });
      user.coin -= rewardAmount;
      consultant.coin += rewardAmount;
      consultant.commentCount++;
      consultant.rating =
        (rating + consultant.rating * (consultant.commentCount - 1)) /
        consultant.commentCount;
      await consultant.save();
      await user.save();
      rewardCoinLog(review.id);
      return res.status(200).send({
        message: 'Review and reward submitted successfully.',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'An error occurred while processing your request.',
    });
  }
};

exports.getConsultantReview = async (req, res) => {
  const consultantId = req.params.id;
  const consultant = await Consultant.findByPk(consultantId);
  if (!consultant) {
    return res.status(500).send({
      message: 'Consultant not found',
    });
  }

  // 检查Redis缓存中是否有评论数据
  redisClient.get(`consultantReviews:${consultantId}`, async (err, reply) => {
    if (reply) {
      // 如果有缓存，将缓存的数据作为响应发送
      const consultantReviews = JSON.parse(reply);
      res.status(200).send({
        consultantReviews: consultantReviews,
      });
    } else {
      try {
        const reviews = await Review.findAll({
          where: {consultantId: consultantId},
          attributes: [
            'rating',
            'comment',
            'rewardAmount',
            'userName',
            'orderId',
          ],
        });
        const consultantReviews = reviews.map((consultantReview) => ({
          rating: consultantReview.rating,
          comment: consultantReview.comment,
          rewardAmount: consultantReview.rewardAmount,
          userName: consultantReview.userName,
          orderId: consultantReview.orderId,
        }));

        // 将查询结果存储到Redis缓存中
        redisClient.setex(
            `consultantReviews:${consultantId}`,
            3600,
            JSON.stringify(consultantReviews),
        );

        res.status(200).send({
          consultantReviews: consultantReviews,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({
          error: 'Server error',
        });
      }
    }
  });
};

exports.getUserReview = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(500).send({
      message: 'User not found',
    });
  }

  try {
    redisClient.get(`userReviews:${userId}`, async (err, reply) => {
      if (reply) {
        const userReviews = JSON.parse(reply);
        return res.status(200).send({
          userReviews: userReviews,
        });
      } else {
        const reviews = await Review.findAll({
          where: {userId: userId},
          attributes: [
            'rating',
            'comment',
            'rewardAmount',
            'userName',
            'orderId',
            'consultantId',
          ],
        });
        const userReviews = reviews.map((userReview) => ({
          rating: userReview.rating,
          comment: userReview.comment,
          rewardAmount: userReview.rewardAmount,
          userName: userReview.userName,
          orderId: userReview.orderId,
          consultantId: userReview.consultantId,
        }));
        redisClient.setex(
            `userReviews:${userId}`,
            3600,
            JSON.stringify(userReviews),
        );

        res.status(200).send({
          userReviews: userReviews,
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: 'Server error',
    });
  }
};
