const express=require("express")
const problemRouter=express.Router()
const adminMiddleware=require("../middleware/adminMiddleware.js")


//create but need of admin access
problemRouter.post("/create",adminMiddleware,createProblem)
//update but need of admin access
problemRouter.patch("/:id",updateProblem)
//delete but need of admin access
problemRouter.delete("/:id",deleteProblem)

//fetch
problemRouter.get("/:id",getProblemById)
problemRouter.get("/",getAllProblem)
problemRouter.get("/user",solvedProblem)