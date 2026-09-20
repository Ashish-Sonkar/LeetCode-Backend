const express = require("express")
const app = express()
require("dotenv").config()
const main = require("./config/db.js")
const cookieParser=require("cookie-parser")
const authRouter=require("./routes/userAuth.js")
const redisClient = require("./config/redis.js")
const problemRouter=require("./routes/problemCreator.js")
const submitRouter=require("./routes/submit.js")



app.use(express.json())
app.use(cookieParser())

app.use("/user",authRouter)
app.use("/problem",problemRouter)
app.use("/submission",submitRouter)

const InitializeConnection=async()=>{
    
    try{

        await Promise.all([redisClient.connect(),main()])
        console.log("Redis Connected")
        console.log("Database Connected")

        app.listen(process.env.PORT, () => {
            console.log(`Server is running at port number ${process.env.PORT}`)
        })

    }
    catch(err){
        console.log("Error:"+err.message)
    }

}

InitializeConnection()



// main()
//     .then(async () => {
//         console.log("Database connected")
//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running at port number ${process.env.PORT}`)
//         })
//     })
//     .catch((err)=>console.log("Error:"+err.message))
