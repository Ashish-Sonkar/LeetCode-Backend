const Problem = require("../models/problem.js")
const Submission = require("../models/submission.js")
const {getLanguageById,submitBatch,submitToken}=require("../utils/problemUtility.js")

const submitCode = async (req, res) => {

    try {

        const userId = req.result._id
        const problemId = req.params.id

        const { code, language } = req.body

        if (!userId || !problemId || !code || !language) {
            return res.status(400).send("Some field missing")
        }

        //fetch the problem from database
        const problem = await Problem.findById(problemId)

        //store submission details in database before the judge0
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal: problem.hiddenTestCases.length
        })

        //submit the code of user in judge0

        const languageId = getLanguageById(language)

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }))

        const submitResult = await submitBatch(submissions)

        const resultToken = submitResult.map((value) => value.token)

        const testResult = await submitToken(resultToken)

        //updated submissionResult
        let testCasesPassed=0;
        let runtime=0;
        let memory=0;
        let status="accepted";
        let errorMessage=null

        for(const test of testResult){
            if(test.status_id==3){
                testCasesPassed++;
                runtime=runtime+parseFloat(test.time)
                memory=Math.max(memory,test.memory)
            }else{
                if(test.status_id==4){
                    status="error"
                    errorMessage=test.stderr
                }else{
                    status="wrong"
                    errorMessage=test.stderr
                }
            }
        }

        //store the updated submissionResult in database

        submittedResult.status=status
        submittedResult.testCasesPassed=testCasesPassed
        submittedResult.errorMessage=errorMessage
        submittedResult.runtime=runtime
        submittedResult.memory=memory

        await submittedResult.save()

        res.status(201).send(submittedResult)

    }
    catch (err) {
        res.status(500).send("Internal Server Error:" + err.message)
    }

}

module.exports = submitCode