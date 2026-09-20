const express=require("express")
const userMiddleware = require("../middleware/userMiddleware")
const submitRouter=express.Router()
const submitCode=require("../controllers/userSubmission.js")

submitRouter.post("/submitCode/:id",userMiddleware,submitCode)

module.exports=submitRouter