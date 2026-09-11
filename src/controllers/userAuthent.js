const redisClient = require("../config/redis.js")
const User=require("../models/user.js")
const validate=require('../utils/validators.js')
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

//Register feature
const register=async (req,res)=>{
    try{

        //validate the data
        validate(req.body)

        const {firstName,emailId,password}=req.body

        req.body.password=await bcrypt.hash(password,10)
        req.body.role="user"

        const user=await User.create(req.body)
        
        //token created
        const token=jwt.sign({_id:user._id,emailId:emailId,role:"user"},process.env.JWT_KEY,{expiresIn:"2 days"})
        res.cookie("token",token,{maxAge:2 * 24 * 60 * 60 * 1000})

        res.status(201).send("User Registered Successfully")

    }
    catch(err){
        res.status(400).send("Error:"+err.message)
    }
    
}

//AdminRegister
const adminRegister=async (req,res)=>{
    try{

        //validate the data
        validate(req.body)

        const {firstName,emailId,password}=req.body

        req.body.password=await bcrypt.hash(password,10)
        

        const user=await User.create(req.body)
        
        //token created
        const token=jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn:"2 days"})
        res.cookie("token",token,{maxAge:2 * 24 * 60 * 60 * 1000})

        res.status(201).send("Admin Registered Successfully")

    }
    catch(err){
        res.status(400).send("Error:"+err.message)
    }
}

//Login feature
const login=async (req,res)=>{
    try{

        const {emailId,password}=req.body

        if(!emailId){
            throw new Error("Invalid Credentials")
        }
        if(!password){
            throw new Error("Invalid Credentials")
        }

        const user=await User.findOne({emailId})
        if(!user){
            throw new Error("Invalid Credentials")
        }

        //password compare
        const isValidPassword=await bcrypt.compare(password,user.password)
        
        if(!isValidPassword){
            throw new Error("Invalid Credentials")
        }

        //token
        const token=jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn:"2 days"})
        res.cookie("token",token,{maxAge:2 * 24 * 60 * 60 * 1000})

        res.status(200).send("Login Successfully")

    }catch(err){
        res.status(401).send("Error"+err.message)
    }
}

//Logout feature
const logout=async (req,res)=>{
    try{

        const {token}=req.cookies

        const payload=jwt.decode(token)

        await redisClient.set(`token:${token}`,"Blocked")
        //expire from redis
        await redisClient.expireAt(`token:${token}`,payload.exp)

        // res.cookie("token",null,{expires:new Date(Date.now()}))
        res.clearCookie("token");

        res.send("Logged Out Successfully")


    }
    catch(err){
        res.status(503).send("Error:"+err.message)
    }
}

//GetProfile
const getProfile=async (req,res)=>{

}


module.exports={register,adminRegister,login,logout,getProfile}