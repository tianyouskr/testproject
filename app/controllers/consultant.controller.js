const { TokenExpiredError } = require("jsonwebtoken");
const db=require("../models");
const jwtUtil=require("/Users/qingdu/nodejsserver/jwtUtil");
const Consultant=db.consultants;

exports.create=(req,res)=>{
    if(!req.body.phone_number||!req.body.password){
        res.status(400).send({
            message:"phone number and password are required!"
        });
        return ;
    }
    const consultant={
        phone_number:req.body.phone_number,
        password:req.body.password,
        name:req.body.name,
        coin:req.body.coin,
        working_condition:req.body.working_condition,
        service_status:req.body.service_status,
        total_orders:req.body.total_orders,
        rating:req.body.rating,
        comment_count:req.body.comment_count,
        price:req.body.price,
        introduction:req.body.introduction
    };
    Consultant.findOne({where:{phone_number:req.body.phone_number}})
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

exports.get_ConsultantList=(req,res)=>{
    Consultant.findAll({attributes:['name','working_condition','service_status','rating','price','introduction']})
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
};
exports.login=(req,res)=>{
    const phone_number=req.body.phone_number;
    const password=req.body.password;

    Consultant.findOne({where:{phone_number}})
        .then(consultant=>{
            if(!consultant){
                return res.status(404).send({
                    message:'Consultant not found'
                });
            }

            if(consultant.password!==password){
                return res.status(401).send({
                    message:'Invalid password'
                });
            }

            const token =jwtUtil.signToken({
                id:consultant.id,
                phone_number:consultant.phone_number
            });

            res.setHeader('Authorization',token);
            res.send({
                message:'Login success',
                token:token,
                consultant_id:consultant.id
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

exports.delete_Consultants=async(req,res)=>{
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















/*exports.update_working_condition=(req,res)=>{
    const id =req.params.id;
    const {orderStatus}=req.body;
    Consultant.findByPk(id)
        .then((consultant)=>{
            if(!consultant){
                res.status(404).send({
                    message:"Consultant not found.",
                });
            }else{
                consultant.working_condition=orderStatus;
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
          consultant.service_status = serviceStatus;
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