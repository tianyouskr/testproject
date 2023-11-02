'use strict';
const { or } = require("sequelize");
const db=require("../models");
const { USER } = require("../config/db.config");
const consultantModel = require("../models/consultant.model");
const Order=db.orders;
const User=db.users;
const Consultant=db.consultants;
const {createCoinLog,consultantCoinLog}=require("./coinLog.controllers");
const redis =require('redis');
const redisClient=redis.createClient({
    host:'localhost',
    port:6379
})


exports.createOrder=async(req,res)=>{
    try{
        const {title,description,price,isUrgent,userId}=req.body;

        const user=await User.findByPk(userId);

        if(!user){
            return res.status(404).send({
                message:'User not found'
            });
        }
        let urgentprice=price*1.5;
        if(isUrgent){
            if(user.coin<urgentprice){
                return res.status(400).send({
                    message:'Insufficient coin'
                });
            }
            user.coin-=urgentprice;
        }else{
            if(user.coin<price){
                return res.status(400).send({
                    message:'Insufficient coin'
                });
            }
            user.coin-=price;
        }
        await user.save();

        const order =await Order.create({
            title,
            description,
            price,
            isUrgent,
            userId
        });
        let payAmount=order.isUrgent?order.price*1.5:order.price;
        await createCoinLog(order.id,0,userId,0,user.coin,0,Date.now(),-payAmount,0,"createOrder");
        res.status(201).json({order});
    }catch(error){
        console.error(error);
        res.status(500).json({error:'Server error'});
    }
};
exports.createOrderWithConsultant=async(req,res)=>{
    try{
        const{title,description,isUrgent,userId,consultantId}=req.body;

        const user=await User.findByPk(userId);
        const consultant=await Consultant.findByPk(consultantId);
        const price=consultant.price;
        let urgentprice=price*1.5;
        if(isUrgent){
            if(user.coin<urgentprice){
                return res.status(400).send({
                    message:'Insufficent coin'
                });
            }
            user.coin-=urgentprice;
        }else{
            if(user.coin<price){
                return res.status(400).send({
                    message:'Insufficient coin'
                });
            }
            user.coin-=price;
        }
        consultant.totalOrders++;
        await consultant.save();
        await user.save();
        const order=await Order.create({
            title,
            description,
            price,
            isUrgent,
            userId,
            consultantId
        });
        let payAmount=order.isUrgent?order.price*1.5:order.price;
        await createCoinLog(order.id,0,userId,0,user.coin,0,Date.now(),-payAmount,0,"createOrder");
        res.status(201).send({order});
    }catch(error){
        console.error(error);
        return  res.status(500).send({
            error:'Server error'
        });
    }
};



exports.acceptOrder=async(req,res)=>{   // 需要修改的地方是当已经存在consultantid时，无法通过此接口接单
    try{
        const orderId=req.params.id;
        const {consultantId,consultantReply}=req.body;
        const consultant=await Consultant.findByPk(consultantId);
        const order=await Order.findByPk(orderId);
        if(!consultant){
            return res.status(404).send({
                message:'Consultant not found'
            });
        }
        if(!order){
            return res.status(404).send({
                message:'Order not found'
            });
        }
        if(order.isResponse){
            return res.status(400).send({
                message:'Order has already been responded'
            });
        }
        if(order.status!=='pending'){
            return res.status(400).send({
                message:'Order is not pending'
            });
        }

        if(order.expiredAt<new Date()){
            return res.status(400).send({
                message:'Order has expired'
            });
        }
        if(consultant.serviceStatus==='Unavailable'){
            return res.status(404).send({
                message:'Consultant is unavailabe.'
            })
        }
        if(order.consultantId){
            return res.status(404).send({
                message:'Order has already been accepted by another consultant.'
            });
        }
        consultant.workingCondition='Busy',
        consultant.totalOrders++;
        consultant.completedOrders++;
        order.isResponse=true;
        order.consultantReply=consultantReply;
        order.status='completed';
        order.consultantId=consultantId;
        if(order.isUrgent){
            consultant.coin+=order.price*1.5;
        }else{
            consultant.coin+=order.price;
        }
        await order.save();
        await consultant.save();
        consultantCoinLog(orderId);
        res.status(200).send({
            message:'Order accepted successfully'
        });
    }catch(error){
        console.error(error);
        res.status(500).send({
            error:'Server error'
        });
    }
};

exports.acceptOrderWithConsultant=async(req,res)=>{
    try{
        const orderId=req.params.id;
        const {consultantReply}=req.body;
        const order =await Order.findByPk(orderId);
        if(!order){
            return res.status(404).send({
                message:'Order not found'
            });
        }
        const consultant=await Consultant.findByPk(order.consultantId);
        const price=consultant.price;
        const urgentprice=1.5*price;
        if(order.isResponse){
            return res.status(400).send({
                message:'Order has already been responsed'
            });
        }
        if(order.expiredAt<new Date()){
            order.status='expired';
            await order.save();
            return res.status(400).send({
                message:'Order has expired'
            });
        }
        if(consultant.serviceStatus==='Unavailable'){
            return res.status(404).send({
                message:'Consultant is unavailable'
            });
        }
        consultant.workingCondition='Busy',
        consultant.completedOrders++;
        order.isResponse=true;
        order.consultantReply=consultantReply;
        order.status='completed';
        if(order.isUrgent){
            consultant.coin+=urgentprice;
        }else{
            consultant.coin+=price;
        }
        await order.save();
        await consultant.save();
        consultantCoinLog(orderId);
        res.status(200).send({
            message:'Order accepted successfully'
        });
    }catch(error){
        console.error(error);
        res.status(500).send({
            error:'Server error'
        });
    }
};


exports.getOrderList=async(req,res)=>{
    try{
        const orders=await Order.findAll({
            attributes:['title','description','status','userId','consultantId']
        });
        const userIds=orders.map(order=>order.userId);
        const consultantIds=orders.map(order=>order.consultantId);

        const users= await User.findAll({
            where:{id:userIds},
            attributes:['id','name']
        });

        const consultants=await Consultant.findAll({
            where:{id:consultantIds},
            attributes:['id','name']
        });


        const userMap=users.reduce((map,user)=>{
            map[user.id]=user.name;
            return map;  
        },{});
        const consultantMap=consultants.reduce((map,consultant)=>{
            map[consultant.id]=consultant.name;
            return map;
        },{});

        const updatedOrders=orders.map(order=>({
            title:order.title,
            description:order.description,
            status:order.status,
            userName:userMap[order.userId],
            consltantName:consultantMap[order.consultantId]||"The order has not been replied yet."
        }));

        res.status(200).send({
            orders:updatedOrders
        });
    }catch(error){
        console.error(error);
        res.status(500).send({
            error:'Server error'
        });
    }
};

exports.getOrderDetails=async(req,res)=>{
    const orderId=req.params.id;
    const order=await Order.findByPk(orderId);
    if(!order){
        return res.status(500).send({
            message:'Order not found'
        });
    }
    try{
        const user=await User.findByPk(order.userId);
        if(!user){
            return res.status(500).send({
                message:'User not found'
            });
        }
        redisClient.get(`orderDetails:${orderId}`,async(err,reply)=>{
            if(reply){
                const orderDetails=JSON.parse(reply);
                return res.status(200).send({
                    orderDetails:orderDetails
                });
            }else{
                const orderDetails= {
                    orderId:order.id,
                    title:order.title,
                    description:order.description,
                    price:order.price,
                    isUrgent:order.isUrgent,
                    expiredAt:order.expiredAt,
                    status:order.status,
                    isResponse:order.isResponse,
                    consultantReply:order.consultantReply,
                    userId:order.userId,
                    consultantId:order.consultantId
                }
                redisClient.setex(`orderDetails:${orderId}`,3600,JSON.stringify(orderDetails));
                return res.status(200).send({
                    orderDetails:orderDetails
                });
            }
        });
    }catch(error){
        console.error(error);
        return res.status(500).send({
            message:'Internal Server Error'
        });
    }
};

exports.delete_Orders=async(req,res)=>{
    const orderId=req.params.id;
    try{
       const order =await Order.findByPk(orderId);


       if(!order){
            return res.status(404).send({
                error:'Order not found'
            });
       }
       await order.destroy();

       res.status(200).send({
            message:'Order deleted successfully'
       });
    }catch(error){
        console.error(error);
        res.status(500).send({
            error:'Server error'
        });
    }
};


