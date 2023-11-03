/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const {query} = require('express');
const db = require('../models/index.cjs');
const Consultant = db.consultants;
const {Op} = require('sequelize');
const {default: sendResponse} = require('../../apiResponse.cjs');
const Review=db.reviews;
const jwtUtil = require('../../jwtUtil.cjs');

exports.createConsultant = async (consultantData) => {
  try {
    const existingConsultant = await Consultant.findOne({
      where: {phoneNumber: consultantData.phoneNumber},
    });

    if (existingConsultant) {
      return {
        status: 400,
        message: 'This phone number is already registered.',
        data: null,
      };
    }
    const newConsultant = await Consultant.create(consultantData);
    return {status: 200, message: 'Consultant created successfully', data: newConsultant};
  } catch (err) {
    return {status: 500, message: 'Some error occurred while creating the Consultant', data: null};
  }
};


exports.updateConsultant=async (id, consultantData)=>{
  try {
    const [num, _]=await Consultant.update(consultantData, {
      where: {id: id},
    });
    if (num==1) {
      return {status: 200, message: 'Consultant is updated successfully.'};
    } else {
      return {status: 404, message: `Cannot update consultant with=${id}`};
    }
  } catch (err) {
    return {status: 404, message: `Error updating Consultant with id=${id}: ${err.message}`};
  }
};


exports.getConsultantList = async (queryParams)=>{
  try {
    const queryOptions={
      attributes: [
        'name',
        'workingCondition',
        'serviceStatus',
        'rating',
        'price',
        'introduction',
      ],
    };
    if (queryParams) {
      const filter = {};

      if (queryParams.name) {
        filter.name = {[Op.like]: `%${queryParams.name}%`};
      }

      if (queryParams.introduction) {
        filter.introduction = {[Op.like]: `%${queryParams.introduction}%`};
      }

      if (queryParams.workingCondition) {
        filter.workingCondition = queryParams.workingCondition === 'true';
      }

      if (queryParams.serviceStatus) {
        filter.serviceStatus = queryParams.serviceStatus;
      }

      queryOptions.where = filter;
    }
    const consultants=await Consultant.findAll(queryOptions);
    return consultants;
  } catch (err) {
    return {status: 404, message: 'Error occurred while retrieving consultant list'};
  }
};


exports.getConsultantById= async (id) =>{
  try {
    const consultant =await Consultant.findByPk(id, {
      attributes: [
        'name',
        'price',
        'introduction',
        'rating',
        'commentCount',
        'completedOrders',
        'totalOrders',
      ],
    });
    if (!consultant) {
      return {status: 401, message: 'Consultant not found', data: null};
    }
    const reviews=await Review.findAll({
      where: {consultantId: id},
      attributes: ['comment', 'rating', 'userName', 'rewardAmount'],
    });
    const comments = reviews.map((review)=>{
      return {
        comment: review.comment,
        rating: review.rating,
        userName: review.username,
        rewardAmount: review.rewardAmount,
      };
    });
    return {
      name: consultant.name,
      price: consultant.price,
      introduction: consultant.introduction,
      rating: consultant.rating,
      commentCount: consultant.commentCount,
      totalOrders: consultant.totalOrders,
      completedOrders: consultant.completedOrders,
      comments: comments,
    };
  } catch (error) {
    return {status: 404, message: 'Error occurred while retrieving consultant list'};
  }
};


exports.login = async (phoneNumber, passWord) => {
  try {
    const consultant = await Consultant.findOne({where: {phoneNumber}});
    if (!consultant) {
      return {status: 404, message: 'Consultant not found', data: null};
    }

    if (consultant.passWord !== passWord) {
      return {status: 404, message: 'Invalid password', data: null};
    }

    const token = jwtUtil.signToken({
      id: consultant.id,
      phoneNumber: consultant.phoneNumber,
    });

    return {
      message: 'Login success',
      token: token,
      consultantId: consultant.id,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Error occurred while logging in');
  }
};


exports.getConsultant = async (id) => {
  try {
    const consultant = await Consultant.findOne({where: {id}});
    if (!consultant) {
      return {status: 404, message: 'Consultant not found', data: null};
    }
    return {status: 200, message: 'successfull', data: consultant};
  } catch (error) {
    return {status: 500, message: 'error'||error.message, data: null};
  }
};


exports.deleteConsultant = async (consultantId)=>{
  try {
    const consultant =await Consultant.findByPk(consultantId);
    if (!consultant) {
      return {status: 400, message: 'Consultant not found', data: null};
    }
    await consultant.destroy();
    return {status: 200, message: 'Consultant deleted successfully', data: null};
  } catch (error) {
    return {status: 401, message: 'Server', data: null};
  }
};
