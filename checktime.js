const db=require("/Users/qingdu/nodejsserver/app/models/index");
const Order=db.orders;
const User=db.users;
const Consultant=db.consultants;
const Op=db.Sequelize.Op;

async function startOrderStatusCheck(){
    try{
        const orders=await Order.findAll({where:{status:'pending'}});

        for(const order of orders){
            const  created_Time=new Date(order.createdAt);
            const  currentTime=new Date();
            const  timeDifference=currentTime-created_Time;
            const  minutesDifference=Math.floor(timeDifference/(1000*60));
            if(minutesDifference>=1440){
                order.status='expired';
                order.coin+=order.price;
                await order.save();

            }
        }
    }catch(error){
        console.error(error);
    }
}
async function checkUrgentOrders(){
    try{
        const orders=await Order.findAll({where:{isUrgent:true}});

        for(const order of orders){
            const createdTime=new Date(order.createdAt);
            const expiresAt=new Date(createdTime.getTime()+60*60*1000);
          //const expiresAt=new Date(createdTime.getTime()+60*1000);//测试用，先搞成1分钟就过期
            const currentTime=new Date();
            if(currentTime>=expiresAt){
                order.isUrgent=false;
                order.updatedAt=new Date();
                await order.save();
                const user=await User.findByPk(order.userId);
                if(user){
                    user.coin+=0.5*order.price;
                    await user.save();
                }
            }
        }
    }catch(error){
        console.error(error);
    }
}
module.exports={
    checkUrgentOrders,
    startOrderStatusCheck
}