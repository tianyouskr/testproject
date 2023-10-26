module.exports=(sequelize,Sequelize)=>{
    const Order=sequelize.define("order",{
        title:{
            type:Sequelize.STRING,
            allowNull:false
        },
        description:{
            type:Sequelize.TEXT,
            allowNull:false
        },
        price:{
            type:Sequelize.INTEGER,
            allowNull:false
        },
        is_urgent:{
            type:Sequelize.BOOLEAN,
            defaultValue:false
        },
        created_at:{
            type:Sequelize.DATE,
            defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at:{
            type:Sequelize.DATE,
            defaultValue:Sequelize.NOW
        },
        expired_at:{
            type:Sequelize.DATE,
            defaultValue:Sequelize.literal('DATE_ADD(NOW(),INTERVAL 1 DAY)')   // 建表的时候不能加上这句，可能由于mysql版本不兼容，无法建表，但是当存在表之后，加上也可以正常显示
        },
        status:{
            type:Sequelize.ENUM('pending','expired','completed'),
            defaultValue:'pending'
        },
        is_response:{
            type:Sequelize.BOOLEAN,
            defaultValue:false
        },
        Consultant_reply:{
            type:Sequelize.TEXT,
            defaultValue:'The order is waiting for a reply'
        },
        User_id:{
            type:Sequelize.INTEGER,
            defaultValue:'0'
        },
        Consultant_id:{
            type:Sequelize.INTEGER,
            defaultValue:'0'
        }
    });
    return Order;
};

