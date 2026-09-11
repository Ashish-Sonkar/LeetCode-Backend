const express=require("express")
const authRouter=express.Router()
const {register,adminRegister,login,logout,getProfile}=require("../controllers/userAuthent.js")
const userMiddleware=require("../middleware/userMiddleware.js")
const adminMiddleware=require("../middleware/adminMiddleware.js")


//Register
authRouter.post("/register",register)

//AdminRegister
authRouter.post("/admin/register",adminMiddleware,adminRegister)

//Login
authRouter.post("/login",login)

//Logout
authRouter.post("/logout",userMiddleware,logout)

//GetProfile
authRouter.get("/getProfile",getProfile)

module.exports=authRouter