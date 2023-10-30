const db=require("../models");
const { use } = require("../routes/user.routes");
const Review=db.reviews;
const User=db.users;
const Consultant=db.consultants;
const Order=db.orders;

exports.createReview=async(req,res)=>{
    const orderId=req.params.id;
    const{rating,comment,rewardAmount}=req.body;
    if (!comment) {
        return res.status(400).send({
          message: 'comment is required.',
        });
      }
    try{
        const order=await Order.findOne({where:{id:orderId,status:'completed'}});
        if(!order){
            return res.status(404).send({
                message:'Order not found or cannot be reviewed.'
            });
        }
        const consultant=await Consultant.findByPk(order.consultantId);
        const user=await User.findByPk(order.userId);
        const existingReiew=await Review.findOne({where:{orderId:orderId}});
        if(existingReiew){
            return res.status(404).send({
                message:'You have made an review already.'
            });
        }
        let enoughcoin=true;
        const consltantId=order.consultantId;
        const userId=order.userId;
        if(user.coin<rewardAmount){
            enoughcoin=false;
            return res.status(200).send({
                message:'Your coin is not enough'
            })
        }
        if(enoughcoin){
            const review =await Review.create({
                orderId:orderId,
                userId:userId,
                consultantId:consltantId,
                rating,
                comment,
                rewardAmount,
                userName:user.name
            });
            console.log(`usercoin:${user.coin}`);
            user.coin-=rewardAmount;
            console.log(`usercoin:${user.coin}`);
            console.log(`usercoin:${consultant.coin}`);
            consultant.coin+=rewardAmount;
            console.log(`usercoin:${consultant.coin}`);
            consultant.commentCount++;
            consultant.rating=(rating+(consultant.rating*(consultant.commentCount-1)))/consultant.commentCount;
            await consultant.save();
            await user.save();
            return res.status(200).send({
                message:'Review and reward submitted successfully.'
            });
        }
    }catch(error){
        console.error(error);
        return res.status(500).send({
            error:'An error occurred while processing your request.'
        });
    }
};