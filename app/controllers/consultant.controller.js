'use strict';
const { TokenExpiredError } = require("jsonwebtoken");
const db=require("../models");
const jwtUtil=require("/Users/qingdu/nodejsserver/jwtUtil");
const { use } = require("../routes/user.routes");
const reviewModel = require("../models/review.model");
const Consultant=db.consultants;
const Review=db.reviews;

exports.createConsultant=(req,res)=>{
    if(!req.body.phoneNumber||!req.body.passWord){
        res.status(400).send({
            message:"phone number and passWord are required!"
        });
        return ;
    }
    const consultant={
        phoneNumber:req.body.phoneNumber,
        passWord:req.body.passWord,
        name:req.body.name,
        coin:req.body.coin,
        workingCondition:req.body.workingCondition,
        serviceStatus:req.body.serviceStatus,
        totalOrders:req.body.totalOrders,
        rating:req.body.rating,
        commentCount:req.body.commentCount,
        price:req.body.price,
        introduction:req.body.introduction
    };
    Consultant.findOne({where:{phoneNumber:req.body.phoneNumber}})
        .then(existngConsultant=>{
            if(existngConsultant){
                res.status(400).send({
                    message:"This phone number is already registered."
                });
            }else{
                Consultant.create(consultant)
                    .then(data=>{
                        res.send(data);
                    })
                    .catch(err=>{
                        res.status(500).send({
                            message:err.message||"Some error occurred while creating the Consultant"
                        });
                    });
            }
        })
        .catch(err=>{
            res.status(500).send({
                message:err.message||"Some error occurred while creating the Consultant"
            });
        });
};
exports.update=(req,res)=>{
    const id=req.params.id;
    Consultant.update(req.body,{
        where:{id:id}
    })
        .then(num=>{
            if(num==1){
                res.send({
                    message:"Consultant was updated successfully."
                });
            }else{
                res.send({
                    message:`Cannot update consultant with id=${id}`
                });
            }
        })
        .catch(err=>{
            res.status(500).send({
                message:"Error updating Consultant with id="+id
            });
        });
};

exports.getConsultantList=(req,res)=>{
    Consultant.findAll({attributes:['name','workingCondition','serviceStatus','rating','price','introduction']})
        .then(consultants=>{
            res.send(consultants);
        })
        .catch(error=>{
            console.error(error);
            res.status(500).send({
                message:"Error occurred while retrieving consultant list."
            });
        });
};
/*
exports.get_ConsultantById=(req,res)=>{
    const{id}=req.params;
    Consultant.findByPk(id,{attributes:['name','price','introduction']})
        .then(consultant=>{
            if(!consultant){
                res.status(404).send({
                    message:"Consultant not found."
                });
            }
            res.send(consultant);
        })
        .catch(error=>{
            console.error(error);
            res.status(500).send({
                message:"Error occurred while retrieving consultant details."
            });
        });
};*/
exports.getConsultantById=async(req,res)=>{
    try{
        const{id}=req.params;

        const consultant=await Consultant.findByPk(id,{
            attributes:['name','price','introduction','rating','commentCount','completedOrders','totalOrders']
        })
        if(!consultant){
            return res.status(404).send({
                message:'Consultant not found'
            });
        }
        const reviews=await Review.findAll({
            where:{consultantId:id},
            attributes:['comment','rating','username','rewardAmount']
        })
        const comments=reviews.map(review=>{
            return{
                comment:review.comment,
                rating:review.rating,
                userName:review.userName,
                rewardAmount:review.rewardAmount
            };
        });
        res.send({
            name:consultant.name,
            price:consultant.price,
            introduction:consultant.introduction,
            rating:consultant.rating,
            commentCount:consultant.commentCount,
            totalOrders:consultant.totalOrders,
            completedOrders:consultant.completedOrders,
            comments:comments
        });
    }catch(error){
        console.error(error);
        res.status(500).send({
            message:'Error occured while retriving consultant details'
        });
    }
};
exports.login=(req,res)=>{
    const phoneNumber=req.body.phoneNumber;
    const passWord=req.body.passWord;

    Consultant.findOne({where:{phoneNumber}})
        .then(consultant=>{
            if(!consultant){
                return res.status(404).send({
                    message:'Consultant not found'
                });
            }

            if(consultant.passWord!==passWord){
                return res.status(401).send({
                    message:'Invalid passWord'
                });
            }

            const token =jwtUtil.signToken({
                id:consultant.id,
                phoneNumber:consultant.phoneNumber
            });

            res.setHeader('Authorization',token);
            res.send({
                message:'Login success',
                token:token,
                consultantId:consultant.id
            });
        })
        .catch(err=>{
            console.error(err);
            res.status(500).send({
                message:err.message||'Internal Server Error'
            });
        });
};


exports.getConsultant=(req,res)=>{
    const consultantid=req.params.id;

    Consultant.findOne({where:{id:consultantid}})
        .then(consultant=>{
            if(!consultant){
                return res.status(404).send({
                    message:'Consultant not found.'
                });
            }
            res.send(consultant);
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

    token=token.substr(7)
    jwtUtil.verifyToken(token)
        .then(decoded=>{
            Consultant.findByPk(decoded.id)
                .then(consultant=>{
                    if(!consultant){
                        return res.status(404).send({
                            message:'CONSULTANT NOT FOUND'
                        });
                    }
                    req.consultant=consultant;
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

exports.deleteConsultants=async(req,res)=>{
    const consultantId=req.params.id;
    try{
        const consultant=Consultant.findByPk(consultantId);
        if(!consultant){
            return res.status(404).send({
                message:'Consultant not found'
            });
        }
        await consultant.destroy();
        res.status(200).send({
            message:'Consultant deleted successfully'
        });
    }catch(error){
        console.error(error);
        res.status(500).send({
            error:'Server error'
        });
    }
};















/*exports.update_workingCondition=(req,res)=>{
    const id =req.params.id;
    const {orderStatus}=req.body;
    Consultant.findByPk(id)
        .then((consultant)=>{
            if(!consultant){
                res.status(404).send({
                    message:"Consultant not found.",
                });
            }else{
                consultant.workingCondition=orderStatus;
                consultant
                    .save()
                    .then(()=>{
                        res.send({
                            message:"Order status updated successfully.",
                        });
                    })
                    .catch((err)=>{
                        res.status(500).send({
                            message:err.message||"Some error occurred with updating order status.",
                        });
                    });
            }
        })
        .catch((err)=>{
            res.status(500).send({
                message:err.message||"Some error occurred with updating order status.",
            });
        });
};

exports.update_ServiceStatus = (req, res) => {
    const id = req.params.id;
    const { serviceStatus } = req.body;
  
    Consultant.findByPk(id)
      .then((consultant) => {
        if (!consultant) {
          res.status(404).send({
            message: "Consultant not found.",
          });
        } else {
          consultant.serviceStatus = serviceStatus;
          consultant
            .save()
            .then(() => {
              res.send({
                message: "Service status updated successfully.",
              });
            })
            .catch((err) => {
              res.status(500).send({
                message:
                  err.message ||
                  "Some error occurred while updating service status.",
              });
            });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while updating service status.",
        });
      });
  };*/