const reviews=require("../controllers/review.controller.js");
var router =require("express").Router();

router.post("/api/reviews/:id",reviews.create_Review);

module.exports=router;