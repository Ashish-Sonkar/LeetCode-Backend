const mongoose=require("mongoose")
const {Schema}=mongoose

const submissionSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    problemId:{
        type:Schema.Types.ObjectId,
        ref:"Problem",
        required:true
    },
    code:{
        type:String,
        required:true
    },
    language:{
        type:String,
        required:true,
        enum:['javascript','c++','java']
    },
    status:{
        type:String,
        enum:['pending','accepted','wrong','error'],
        default:'pending'
    },
    runtime:{
        type:Number, //milliseconds
        default:0
    },
    memory:{
        type:Number, //KB
        default:0
    },
    errorMessage:{
        type:String,
        dafault:''
    },
    testCasesPassed:{
        type:Number,
        dafault:0
    },
    testCasesTotal:{
        type:Number,
        default:0
    }
},{
    timestamps:true
})

const Submission=mongoose.model('submission',submissionSchema)

module.exports=Submission