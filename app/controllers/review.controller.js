const db=require("../models");
const { use } = require("../routes/user.routes");
const Review=db.reviews;
const User=db.users;
const Consultant=db.consultants;
const Order=db.orders;

exports.create_Review=async(req,res)=>{
    const orderId=req.params.id;
    const{rating,Comment,reward_amount}=req.body;
    try{
        const order=await Order.findOne({where:{id:orderId,status:'completed'}});
        const consultant=await Consultant.findByPk(order.Consultant_id);
        const user=await User.findByPk(order.User_id);
        const existingReiew=await Review.findOne({where:{Order_id:orderId}});

        if(!order){
            return res.status(404).send({
                message:'Order not found or cannot be reviewed.'
            });
        }
        if(existingReiew){
            return res.status(404).send({
                message:'You have made an review already.'
            });
        }

        const consltantId=order.Consultant_id;
        const userId=order.User_id;
        const review =await Review.create({
            Order_id:orderId,
            User_id:userId,
            Consultant_id:consltantId,
            rating,
            Comment,
            reward_amount
        });
        if(user.coin<reward_amount){
            return res.status(200).send({
                message:'Your coin is not enough'
            })
        }
        user.coin-=reward_amount;
        consultant.coin+=reward_amount;
        consultant.comment_count++;
        consultant.rating=(rating+(consultant.rating*(consultant.comment_count-1)))/consultant.comment_count;
        await consultant.save();
        await user.save();
        return res.status(200).send({
            message:'Review and reward submitted successfully.'
        });
    }catch(error){
        console.error(error);
        return res.status(500).send({
            error:'An error occurred while processing your request.'
        });
    }
};