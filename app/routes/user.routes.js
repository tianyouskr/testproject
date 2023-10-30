
const users=require("../controllers/user.controller.js");
const jwtUtil=require("/Users/qingdu/nodejsserver/jwtUtil")

var router=require("express").Router();

router.post("/api/users",users.createUser);
router.put("/api/users/:id",users.update);
router.get("/api/users/:id",users.verifyToken,users.getUser);
router.post("/api/users/login",users.login);
router.delete("/api/users/:id",users.delete_Users);
module.exports = router
