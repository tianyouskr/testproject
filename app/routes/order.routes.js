const { or } = require("sequelize");
const orders=require("../controllers/order.controller.js");
var router =require("express").Router();

router.post("/api/orders",orders.create_Order);
router.put("/api/orders/:id",orders.accept_Order);
router.get("/api/orders/getOrderDetails/:id",orders.getOrderDetails);
router.get("/api/orders/getOrderList",orders.getOrderList);
router.delete("/api/orders/:id",orders.delete_Orders);
module.exports=router

