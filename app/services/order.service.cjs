/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const db = require('../models/index.cjs');
const Order = db.orders;
const User=db.users;
const Consultant=db.consultants;
const {consultantCoinLog, createCoinLog} = require('../controllers/coinLog.controllers.cjs');
const redis = require('ioredis');
const redisClient = new redis({
  host: 'localhost',
  port: 6379,
});

exports.createOrder = async (orderData) => {
  try {
    const {title, description, price, isUrgent, userId} = orderData;

    const user = await User.findByPk(userId);

    if (!user) {
      return {status: 400, message: 'Not user', data: null};
    }

    const urgentPrice = price * 1.5;
    if (isUrgent) {
      if (user.coin < urgentPrice) {
        return {status: 400, message: 'Insufficient coin', data: null};
      }
      user.coin -= urgentPrice;
    } else {
      if (user.coin < price) {
        return {status: 400, message: 'Insufficient coin', data: null};
      }
      user.coin -= price;
    }

    await user.save();

    const order = await Order.create({
      title,
      description,
      price,
      isUrgent,
      userId,
    });

    const payAmount = order.isUrgent ? order.price * 1.5 : order.price;
    await createCoinLog(
        order.id,
        0,
        userId,
        0,
        user.coin,
        0,
        Date.now(),
        -payAmount,
        0,
        'createOrder',
    );

    return {status: 200, message: 'Order created', data: order};
  } catch (error) {
    return {status: 500, message: error.message||'Some error', data: null};
  }
};


exports.createOrderWithConsultant = async (orderData) => {
  try {
    const {title, description, isUrgent, userId, consultantId} = orderData;

    const user = await User.findByPk(userId);
    if (!user) {
      return {status: 400, message: 'Not user', data: null};
    }
    const consultant = await Consultant.findByPk(consultantId);
    if (!consultant) {
      return {status: 400, message: 'Not consultant', data: null};
    }
    const price = consultant.price;
    const urgentprice = price * 1.5;
    if (isUrgent) {
      if (user.coin < urgentprice) {
        return {status: 400, message: 'Insufficient coin', data: null};
      }
      user.coin -= urgentprice;
    } else {
      if (user.coin < price) {
        return {status: 400, message: 'Insufficient coin', data: null};
      }
      user.coin -= price;
    }
    consultant.totalOrders++;
    await consultant.save();
    await user.save();
    const order = await Order.create({
      title,
      description,
      price,
      isUrgent,
      userId,
      consultantId,
    });
    const payAmount = order.isUrgent ? order.price * 1.5 : order.price;
    await createCoinLog(
        order.id,
        0,
        userId,
        0,
        user.coin,
        0,
        Date.now(),
        -payAmount,
        0,
        'createOrder',
    );
    return {status: 200, message: 'Successfull', data: order};
  } catch (error) {
    return {status: 400, message: error.message||'Some error', data: null};
  }
};


exports.acceptOrderByConsultantId = async (orderId, consultantId, consultantReply) => {
  const consultant = await Consultant.findByPk(consultantId);

  const order = await Order.findByPk(orderId);

  if (!consultant || !order) {
    return {status: 400, message: 'Consultant or Order not found', data: null};
  }

  if (order.isResponse) {
    return {status: 400, message: 'Order is benn responsed', data: null};
  }

  if (order.status !== 'pending') {
    return {status: 400, message: 'Order is not pending', data: null};
  }

  if (order.expiredAt < new Date()) {
    return {status: 400, message: 'Order has expired', data: null};
  }

  if (consultant.serviceStatus === 'Unavailable') {
    return {status: 400, message: 'Consultant is unavailable', data: null};
  }
  /*
  if (order.consultantId) {
    return {status: 400, message: 'Order has already been accepted by another consultant', data: null};
  }
*/
  consultant.workingCondition = 'Busy';
  consultant.totalOrders++;
  consultant.completedOrders++;

  order.isResponse = true;
  order.consultantReply = consultantReply;
  order.status = 'completed';
  order.consultantId = consultantId;

  if (order.isUrgent) {
    consultant.coin += order.price * 1.5;
  } else {
    consultant.coin += order.price;
  }

  await order.save();
  await consultant.save();

  consultantCoinLog(orderId);
  return {status: 200, message: 'Successfully', data: null};
};


exports.getOrderList = async (filter) =>{
  try {
    const {status, userId, consultantId, title, description}=filter;
    const whereClause ={};
    if (status) {
      whereClause.status=status;
    }
    if (userId) {
      whereClause.userId=userId;
    }
    if (consultantId) {
      whereClause.consultantId=consultantId;
    }
    if (title) {
      whereClause.title=title;
    }
    if (description) {
      whereClause.description=description;
    }
    const orders= await Order.findAll({
      where: whereClause,
      attributes: ['id', 'title', 'description', 'status', 'userId', 'consultantId'],
    });
    const userIds = orders.map((order) => order.userId);
    const consultantIds = orders.map((order) => order.consultantId);
    const users = await User.findAll({
      where: {id: userIds},
      attributes: ['id', 'name'],
    });
    const consultants = await Consultant.findAll({
      where: {id: consultantIds},
      attributes: ['id', 'name'],
    });
    const userMap = users.reduce((map, user) => {
      map[user.id] = user.name;
      return map;
    }, {});
    const consultantMap = consultants.reduce((map, consultant) => {
      map[consultant.id] = consultant.name;
      return map;
    }, {});
    const updatedOrders = orders.map((order) => ({
      id: order.id,
      title: order.title,
      description: order.description,
      status: order.status,
      userName: userMap[order.userId],
      consltantName:
        consultantMap[order.consultantId] ||
        'The order has not been replied yet.',
    }));
    return {status: 200, message: 'Successfull', data: updatedOrders};
  } catch (error) {
    return {status: 400, message: error.message||'Some error', data: null};
  }
};


exports.getOrderDetails=async (orderId)=>{
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return {status: 400, message: 'Not order', data: null};
    }
    const user =await User.findByPk(order.userId);
    if (!user) {
      return {status: 400, message: 'Not user', data: null};
    }
    const orderDetails = {
      orderId: order.id,
      title: order.title,
      description: order.description,
      price: order.price,
      isUrgent: order.isUrgent,
      expiredAt: order.expiredAt,
      status: order.status,
      isResponse: order.isResponse,
      consultantReply: order.consultantReply,
      userId: order.userId,
      consultantId: order.consultantId,
      userName: user.name,
    };

    const cacheKey = `orderDetails:${orderId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    await redisClient.set(
        cacheKey,
        JSON.stringify(orderDetails),
        'EX',
        3600,
    );
    return {status: 200, message: 'Successfull', data: orderDetails};
  } catch (error) {
    return {status: 400, message: error.message||'Some error', data: null};
  }
};


exports.deleteOrder = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return {status: 404, message: 'Order not found', data: null};
    }
    await order.destroy();
    return {status: 200, message: 'Order deleted successfully', data: null};
  } catch (error) {
    console.error(error);
    return {status: 500, message: 'Server error', data: null};
  }
};
