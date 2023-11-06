/* eslint-disable max-len */
'use strict';
const db = require('../models/index.cjs');
const Order = db.orders;
// const User = db.users;
// const Consultant = db.consultants;
const orderService=require('../services/order.service.cjs');
// const {createCoinLog, consultantCoinLog} = require('./coinLog.controllers.cjs');
const sendResponse=require('../../apiResponse.cjs');


exports.createOrder = async (req, res) => {
  try {
    const {title, description, price, isUrgent, userId} = req.body;

    const order = await orderService.createOrder({
      title,
      description,
      price,
      isUrgent,
      userId,
    });

    sendResponse(res, 201, order.message, order.data);
  } catch (error) {
    sendResponse(res, 500, error.message || 'Server error');
  }
};

exports.createOrderWithConsultant = async (req, res) => {
  try {
    const {title, description, isUrgent, userId, consultantId} = req.body;

    const orderData = {title, description, isUrgent, userId, consultantId};

    const order = await orderService.createOrderWithConsultant(orderData);

    sendResponse(res, 200, order.message, order.data);
  } catch (error) {
    sendResponse(res, 500, error.message || 'Server error');
  }
};


exports.acceptOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order=await Order.findByPk(orderId);
    if (!order) {
      sendResponse(res, 400, 'Order not found', null);
      return;
      // return {status: 400, message: 'Order not found', data: null};
    }
    const {consultantId, consultantReply} = req.body;
    if (order.consultantId) {
      sendResponse(res, 400, 'Order has already been accepted by another consultant', null);
      return;
      // return {status: 400, message: 'Order has already been accepted by another consultant', data: null};
    }
    const acceptedOrder= await orderService.acceptOrderByConsultantId(orderId, consultantId, consultantReply);

    sendResponse(res, acceptedOrder.status, acceptedOrder.message, null);
  } catch (error) {
    sendResponse(res, 500, error.message || 'Server error');
  }
};


exports.acceptOrderWithConsultant = async (req, res) => {
  try {
    const orderId=req.params.id;
    const order =await Order.findByPk(orderId);
    if (!order) {
      sendResponse(res, 400, 'Order not found', null);
      return;
    }
    const {consultantReply}=req.body;
    const acceptedOrder =await orderService.acceptOrderByConsultantId(orderId, order.consultantId, consultantReply);
    sendResponse(res, acceptedOrder.status, acceptedOrder.message, null);
  } catch (error) {
    sendResponse(res, 500, error.message||'Server error');
  }
};


exports.getOrderList=async (req, res) =>{
  try {
    const filter=req.query;
    const orders=await orderService.getOrderList(filter);
    sendResponse(res, orders.status, orders.message, orders.data);
  } catch (error) {
    sendResponse(res, 500, error.message||'Server error');
  }
};


exports.getOrderDetails = async (req, res) => {
  const orderId = req.params.id;

  try {
    const orderDetails = await orderService.getOrderDetails(orderId);
    if (!orderDetails) {
      sendResponse(res, 400, 'OrderDetails not found', null);
      return;
    } else {
      sendResponse(res, orderDetails.status, orderDetails.message, orderDetails.data);
    }
  } catch (error) {
    sendResponse(res, 500, error.message||'Server error');
  }
};


exports.deleteOrder = async (req, res) => {
  const orderId = req.params.id;
  try {
    const result = await orderService.deleteOrder(orderId);
    sendResponse(res, result.status, result.message, result.data);
  } catch (error) {
    sendResponse(res, 500, error.message||'Server error');
  }
};
