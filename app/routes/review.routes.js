const reviews=require("../controllers/review.controller.js");
var router =require("express").Router();

router.post("/api/reviews/:id",reviews.createReview);

module.exports=router;