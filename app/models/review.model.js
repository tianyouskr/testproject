module.exports=(sequelize,Sequelize)=>{
    const Review =sequelize.define("review",{
        rating:{
            type:Sequelize.INTEGER,
            allowNull:false
        },
        comment:{
            type:Sequelize.TEXT,
            allowNull:false
        },
        rewardAmount:{
            type:Sequelize.INTEGER,
            defaultValue:0
        },
        userId:{
            type:Sequelize.INTEGER,
            defaultValue:'0'
        },
        consultantId:{
            type:Sequelize.INTEGER,
            defaultValue:'0'
        },
        orderId:{
            type:Sequelize.INTEGER,
            defaultValue:'0'
        },
        userName:{
            type:Sequelize.STRING,
        }
    });

    return Review;
};