const express=require("express")
const aiRouter=express.Router()
const userMiddleware=require("../middleware/userMiddleware.js")
const solveDoubt=require("../controllers/solveDoubt.js")

aiRouter.post("/chat",userMiddleware,solveDoubt)

module.exports=aiRouter