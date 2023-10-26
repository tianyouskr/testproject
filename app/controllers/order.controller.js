'use strict';
const { or } = require("sequelize");
const db=require("../models");
const { USER } = require("../config/db.config");
const consultantModel = require("../models/consultant.model");
const Order=db.orders;
const User=db.users;
const Consultant=db.consultants;

exports.create_Order=async(req,res)=>{
    try{
        const {title,description,price,is_urgent,User_id}=req.body;

        const user=await User.findByPk(User_id);
        let urgentprice=price*1.5;
        if(is_urgent){
            console.log(`isurgent:${is_urgent}`);
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
            is_urgent,
            User_id
        });
        res.status(201).json({order});
    }catch(error){
        console.error(error);
        res.status(500).json({error:'Server error'});
    }
};

exports.accept_Order=async(req,res)=>{
    try{
        const order_id=req.params.id;
        const {Consultant_id,Consultant_reply}=req.body;
        const consultant=await Consultant.findByPk(Consultant_id);
        const order=await Order.findByPk(order_id);
        if(!order){
            return res.status(404).send({
                message:'Order not found'
            });
        }
        if(order.is_response){
            return res.status(400).send({
                message:'Order has already been responded'
            });
        }
        if(order.status!=='pending'){
            return res.status(400).send({
                message:'Order is not pending'
            });
        }

        if(order.expired_at<new Date()){
            return res.status(400).send({
                message:'Order has expired'
            });
        }
        order.is_response=true;
        order.Consultant_reply=Consultant_reply;
        order.status='completed';
        order.Consultant_id=Consultant_id;
        if(order.is_urgent){
            consultant.coin+=order.price*1.5;
        }else{
            consultant.coin+=order.price;
        }
        await order.save();
        await consultant.save();
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
            attributes:['title','description','status','User_id','Consultant_id']
        });
        const userIds=orders.map(order=>order.User_id);
        const consultantIds=orders.map(order=>order.Consultant_id);

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
            userName:userMap[order.User_id],
            consltantName:consultantMap[order.Consultant_id]||"The order has not been replied yet."
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
    try{
        const orderId=req.params.id;

        const order=await Order.findByPk(orderId);
        if(!order){
            return res.status(404).send({
                message:'Order not found'
            });
        }
        const user=await User.findByPk(order.User_id);
        if(!user){
            return res.status(404).send({
                message:'User not found'
            });
        }
        const consultant=await Consultant.findByPk(order.Consultant_id);
        if(!consultant){
            return res.status(201).send({
                message:'The order has not been replied to yet ',
                order,
                user
            });
        }
        res.status(200).send({
            order,
            user,
            consultant
        })
    }catch(error){
        console.error(error);
        res.status(500).json({error:'Server error'});
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


