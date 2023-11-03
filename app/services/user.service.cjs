/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const db = require('../models/index.cjs');
const User=db.users;
const jwtUtil = require('../../jwtUtil.cjs');
exports.createUser = async (userData) => {
  try {
    const existingUser = await User.findOne({
      where: {phoneNumber: userData.phoneNumber},
    });
    if (existingUser) {
      return {status: 400, message: 'This phone number is already registered', data: null};
    }
    const user = await User.create(userData);
    return {status: 200, message: 'Consultant created successfully', data: user};
  } catch (error) {
    console.error(error);
    return {status: 500, message: 'error', data: null};
  }
};

exports.updateUser =async (userId, userData)=>{
  try {
    const [num, _]=await User.update(userData, {
      where: {id: userId},
    });
    if (num==1) {
      return {status: 200, message: 'User is updated successfully.'};
    } else {
      return {status: 404, message: `Cannot update User with=${id}`};
    }
  } catch (err) {
    return {status: 404, message: `Error updating User with id=${id}: ${err.message}`};
  }
};

exports.login = async (phoneNumber, passWord) => {
  try {
    const user = await User.findOne({where: {phoneNumber}});
    if (!user) {
      return {status: 404, message: 'User not found', data: null};
    }

    if (user.passWord !== passWord) {
      return {status: 404, message: 'Invalid password', data: null};
    }

    const token = jwtUtil.signToken({
      id: user.id,
      phoneNumber: user.phoneNumber,
    });

    return {
      message: 'Login success',
      token: token,
      userId: user.id,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Error occurred while logging in');
  }
};


exports.getUser = async (id) => {
  try {
    const user = await User.findOne({where: {id}});
    if (!user) {
      return {status: 404, message: 'User not found', data: null};
    }
    return {status: 200, message: 'successfull', data: user};
  } catch (error) {
    return {status: 500, message: 'error'||error.message, data: null};
  };
};


exports.deleteUser = async (userId)=>{
  try {
    const user =await User.findByPk(userId);
    if (!user) {
      return {status: 400, message: 'User not found', data: null};
    }
    await user.destroy();
    return {status: 200, message: 'User deleted successfully', data: null};
  } catch (error) {
    return {status: 401, message: 'Server', data: null};
  }
};
