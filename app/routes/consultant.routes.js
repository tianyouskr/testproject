
const consultants=require("../controllers/consultant.controller.js");
const { users } = require("../models/index.js");
const jwtUtil=require("/Users/qingdu/nodejsserver/jwtUtil")
var router=require("express").Router();


router.post("/api/consultants",consultants.createConsultant);
router.post("/api/consultants/login",consultants.login);
router.put("/api/consultants/:id",consultants.update);
router.get("/api/consultants/:id",consultants.verifyToken,consultants.getConsultant);
router.get('/api/consultants',consultants.getConsultantList);
router.get('/api/consultants/getConsultantById/:id',consultants.getConsultantById);
router.delete("/api/consultants/:id",consultants.deleteConsultants);
/*router.put("/api/consultants/:id/order-status",consultants.update_OrderStatus);
router.put("/api/consultants/:id/service-status",consultants.update_ServiceStatus);*/

module.exports=router

