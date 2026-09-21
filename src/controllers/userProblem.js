const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility.js")
const Problem = require("../models/problem.js")
const User = require("../models/user.js")
const Submission = require("../models/submission.js")

const createProblem = async (req, res) => {
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator } = req.body

    try {

        for (const { language, completeCode } of referenceSolution) {

            //source_code
            //language_id
            //stdin
            //expectedOutput

            const languageId = getLanguageById(language)

            //creating batch submission
            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output

            }))

            const submitResult = await submitBatch(submissions)


            const resultToken = submitResult.map((value) => value.token)

            const testResult = await submitToken(resultToken)


            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send("Error Occured")
                }
            }

        }

        //we can store it in our DB

        await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        })

        res.status(201).send("Problem Saved Successfully")

    } catch (err) {
        res.status(400).send("Error:" + err.message)
    }
}

const updateProblem = async (req, res) => {
    const { id } = req.params;
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator } = req.body

    try {

        if (!id) {
            return res.status(400).send("Missing ID Field")
        }

        const dsaProblem = await Problem.findById(id)

        if (!dsaProblem) {
            return res.status(404).send("ID is not present in Server")
        }

        for (const { language, completeCode } of referenceSolution) {

            //source_code
            //language_id
            //stdin
            //expectedOutput

            const languageId = getLanguageById(language)

            //creating batch submission
            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output

            }))

            const submitResult = await submitBatch(submissions)


            const resultToken = submitResult.map((value) => value.token)

            const testResult = await submitToken(resultToken)


            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send("Error Occured")
                }
            }

        }

        const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true })

        res.status(200).send("Update Successfully")

    }
    catch (err) {
        res.status(500).send("Error:" + err.message)
    }

}

const deleteProblem = async (req, res) => {

    const { id } = req.params
    try {

        if (!id) {
            return res.status(400).send("ID is Missing")
        }

        const deletedProblem = await Problem.findByIdAndDelete(id)

        if (!deletedProblem) {
            return res.status(404).send("Problem is Missing")
        }

        res.status(200).send("Successfully Deleted")

    }
    catch (err) {
        res.status(500).send("Error:" + err.message)
    }

}

const getProblemById = async (req, res) => {

    const { id } = req.params

    try {

        if (!id) {
            return res.status(400).send("ID is Missing")
        }

        const getProblem=await Problem.findById(id).select('_id title description difficulty tags visibleTestCases referenceSolution')

        if(!getProblem){
            return res.status(404).send("Problem is Missing")
        }

        res.status(200).send(getProblem)

    }
    catch (err) {
        res.status(500).send("Error:" + err.message)
    }


}

const getAllProblem=async (req,res)=>{
    try{

        const getAllProblems=await Problem.find({}).select('_id title difficulty tags')

        if(getAllProblems.length==0){
            return res.status(404).send("Problem is Missing")
        }

        res.status(200).send(getAllProblems)

    }
    catch(err){
        res.status(500).send("Error:"+err.message)
    }
}

const solvedAllProblemByUser=async (req,res)=>{

    try{

        const userId=req.result._id
        const user=await User.findById(userId).populate({
            path:"problemSolved",
            select:"_id title difficulty tags"
        })
        res.status(200).send(user.problemSolved)

    }
    catch(err){
        res.status(500).send("Server Problem")
    }

}

const submittedProblem=async (req,res)=>{

    try{

        const userId=req.result._id
        const problemId=req.params.problemId

        const ans=await Submission.find({userId,problemId})
        
        if(ans.length==0){
            res.status(200).send("No Submission is present")
        }

        res.status(200).send(ans)

    }catch(err){
        res.status(500).send("Internal Server Error")
    }

}

module.exports = { createProblem, updateProblem, deleteProblem, getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem }