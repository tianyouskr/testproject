module.exports=(sequelize,Sequelize)=>{
    const Review =sequelize.define("review",{
        rating:{
            type:Sequelize.INTEGER,
            allowNull:false
        },
        Comment:{
            type:Sequelize.TEXT,
            allowNull:false
        },
        reward_amount:{
            type:Sequelize.INTEGER,
            defaultValue:0
        },
        User_id:{
            type:Sequelize.INTEGER,
            defaultValue:'0'
        },
        Consultant_id:{
            type:Sequelize.INTEGER,
            defaultValue:'0'
        },
        Order_id:{
            type:Sequelize.INTEGER,
            defaultValue:'0'
        }
    });

    return Review;
};