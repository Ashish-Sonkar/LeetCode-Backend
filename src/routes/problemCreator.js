const express=require("express")
const problemRouter=express.Router()


//create but need of admin access
problemRouter.post("/create",problemCreate)
//update but need of admin access
problemRouter.patch("/:id",problemUpdate)
//delete but need of admin access
problemRouter.delete("/:id",problemDelete)

//fetch
problemRouter.get("/:id",problemFetch)
problemRouter.get("/",getAllProblem)
problemRouter.get("/user",solvedProblem)