const express=require("express")
const problemRouter=express.Router()
const adminMiddleware=require("../middleware/adminMiddleware.js")
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem}=require("../controllers/userProblem.js")
const userMiddleware=require("../middleware/userMiddleware.js")


//create but need of admin access
problemRouter.post("/create",adminMiddleware,createProblem)
//update but need of admin access
problemRouter.put("/update/:id",adminMiddleware,updateProblem)
//delete but need of admin access
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem)


//fetch
problemRouter.get("/getProblemById/:id",userMiddleware,getProblemById)
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem)
problemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblemByUser)
problemRouter.get("/submittedProblem/:id",userMiddleware,submittedProblem)

module.exports=problemRouter