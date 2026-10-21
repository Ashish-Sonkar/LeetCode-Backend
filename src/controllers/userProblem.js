const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility.js")
const Problem = require("../models/problem.js")
const User = require("../models/user.js")
const Submission = require("../models/submission.js")
const SolutionVideo = require("../models/solutionVideo.js")

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
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator } = req.body;

    try {
        if (!id) {
            return res.status(400).send("Missing ID Field");
        }

        const dsaProblem = await Problem.findById(id);

        if (!dsaProblem) {
            return res.status(404).send("ID is not present in Server");
        }

        if (!referenceSolution || !Array.isArray(referenceSolution) || referenceSolution.length === 0) {
            return res.status(400).send("Reference solutions are required for validation.");
        }

        if (!visibleTestCases || !Array.isArray(visibleTestCases)) {
            return res.status(400).send("Visible test cases are required.");
        }

        // Judge0 validation loop
        for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            // Judge0 API call Rate limit
            const submitResult = await submitBatch(submissions);

            if (!submitResult || !Array.isArray(submitResult)) {
                return res.status(500).send("Error: Failed to communicate with code judge service (Rate limit or network issue).");
            }

            const resultToken = submitResult.map((value) => value.token);
            const testResult = await submitToken(resultToken);

            if (!testResult || !Array.isArray(testResult)) {
                return res.status(500).send("Error: Failed to fetch test results from judge.");
            }

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send(`Test case failed for language ${language}. Output did not match.`);
                }
            }
        }

        
        const updatedProblem = await Problem.findByIdAndUpdate(
            id, 
            { ...req.body }, 
            { runValidators: true, returnDocument: 'after' }
        );

        res.status(200).send("Update Successfully");

    }
    catch (err) {
        console.error("Update Problem Error:", err); 
        res.status(500).send("Error: " + err.message);
    }
};

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

        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases hiddenTestCases referenceSolution startCode')

        if (!getProblem) {
            return res.status(404).send("Problem is Missing")
        }

        const videos = await SolutionVideo.findOne({ problemId: id })

        if (videos) {

            const responseData = {
                ...getProblem.toObject(),
                secureUrl: videos.secureUrl,
                thumbnailUrl: videos.thumbnailUrl,
                duration: videos.duration
            }

            return res.status(200).send(responseData)
        }

        res.status(200).send(getProblem)

    }
    catch (err) {
        res.status(500).send("Error:" + err.message)
    }


}

const getAllProblem = async (req, res) => {
    try {

        const getAllProblems = await Problem.find({}).select('_id title difficulty tags')

        if (getAllProblems.length == 0) {
            return res.status(404).send("Problem is Missing")
        }

        res.status(200).send(getAllProblems)

    }
    catch (err) {
        res.status(500).send("Error:" + err.message)
    }
}

const solvedAllProblemByUser = async (req, res) => {

    try {

        const userId = req.result._id
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags"
        })
        res.status(200).send(user.problemSolved)

    }
    catch (err) {
        res.status(500).send("Server Problem")
    }

}

const submittedProblem = async (req, res) => {

    try {

        const userId = req.result._id
        const problemId = req.params.id

        const ans = await Submission.find({ userId, problemId })

        if (ans.length == 0) {
            return res.status(200).send([])
        }

        res.status(200).send(ans)

    } catch (err) {
        res.status(500).send("Internal Server Error")
    }

}

module.exports = { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblemByUser, submittedProblem }