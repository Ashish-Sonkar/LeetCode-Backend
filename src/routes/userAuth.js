const express=require("express")
const authRouter=express.Router()
const {register,adminRegister,login,logout,deleteProfile}=require("../controllers/userAuthent.js")
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



authRouter.delete("/deleteProfile",userMiddleware,deleteProfile)

authRouter.get("/check",userMiddleware,(req,res)=>{
    const reply={
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    })
})

module.exports=authRouter