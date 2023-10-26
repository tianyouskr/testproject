const db=require("../models");
const orderModel = require("../models/order.model");
const jwtUtil=require("/Users/qingdu/nodejsserver/jwtUtil")
const User=db.users;
const Op=db.Sequelize.Op;

exports.create=(req,res)=>{
    if(!req.body.phone_number||!req.body.password){
        res.status(400).send({
            message:"phone number and password are required!"
        });
        return ;
    }
    
    const user={
        phone_number:req.body.phone_number,
        password:req.body.password,
        name:req.body.name,
        birth:req.body.birth,
        gender:req.body.gender,
        bio:req.body.bio,
        about:req.body.about,
        coin:req.body.coin
    };
    User.findOne({ where: { phone_number: req.body.phone_number } })
    .then(existingUser => {
      if (existingUser) {
        res.status(400).send({
          message: "This phone number is already registered"
        });
      } else {
        // 创建用户
        User.create(user)
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message:
                err.message || "Some error occurred while creating the User."
            });
          });
      }
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while checking the phone number."
      });
    });
};
exports.update=(req,res)=>{
    const id=req.params.id;
  
    User.update(req.body,{
      where:{id:id}
    })
      .then(num=>{
        if(num==1){
          res.send({
            message:"User was updated successfully."
          });
        }else{
          res.send({
            message:`Cannot update user with id=${id}`
          });
        }
      })
      .catch(err=>{
        res.status(500).send({
          message:"Error updating User with id="+id
        });
      });
};

exports.login=(req,res)=>{
  const phone_number=req.body.phone_number;
  const password=req.body.password;

  User.findOne({where:{phone_number}})
    .then(user=>{
      if(!user){
        return res.status(404).send({
          message:'User not found'
        });
      }

      if(user.password!==password){
        return res.status(401).send({
          message:'Invalid password'
        });
      }

      const token =jwtUtil.signToken({
        id:user.id,
        phone_number:user.phone_number
      });

      res.setHeader('Authorization',token);
      res.send({
        message:'Login success',
        token:token,
        user_id:user.id
      });
    })
    .catch(err=>{
      console.error(err);
      res.status(500).send({
        message:err.message||'Internal Server Error'
      });
    });
};



exports.getUser=(req,res)=>{
  const userid= req.params.id;

  User.findOne({where:{id:userid}})
    .then(user=>{
      if(!user){
        return res.status(404).send({
          message:'User not found.'
        });
      }
      res.send(user);
    })
    .catch(err=>{
      console.error(err);
      res.status(500).send({
        message:'Internal server error.'
      });
    });
};

exports.verifyToken=(req,res,next)=>{
    let token=req.headers.authorization;

    if(!token){
      return res.status(403).send({
      message:"No token provided"
      });
    }
   // console.log(`token: ${token}`)
    token = token.substr(7)
    //console.log(`token11:${token}`)
    jwtUtil.verifyToken(token)
      .then(decoded=>{
        //console.log(`decoded: ${JSON.stringify(decoded)}`)
        User.findByPk(decoded.id)
          .then(user=>{
            if(!user){
              return res.status(404).send({
                message:'USER NOT FOUND'
              });
            }
            req.user=user;
            next();
          })
          .catch(err=>{
            return res.status(500).send({
              message:err.message||'Internal Server Error'
            });
          });
      })
      .catch(err=>{
        return res.status(401).send({
          message:'Unauthorized'
        });
      });
};

exports.delete_Users=async(req,res)=>{
    const userId=req.params.id;
    try{
        const user=await User.findByPk(userId);
        
        if(!user){
            return res.status(404).send({
              error:'User not found'
           });
        }
        await user.destroy();

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
