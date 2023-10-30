const favoriteTables=require("../controllers/favoriteTable.controller");
const { route } = require("./user.routes");

var router=require("express").Router();

router.post("/api/favoriteTable/:id",favoriteTables.createFavoriteTable);
router.get("/api/favoriteTable/:id",favoriteTables.getFavoriteTableList);
module.exports=router;