
const axios = require('axios');

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63
    };

    return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            base64_encoded: 'false'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error("Judge0 Batch Submit Error:", error.response?.data || error.message);
        
        return null; 
    }
};


const waiting = (timer) => {
    return new Promise((resolve) => setTimeout(resolve, timer));
};

const submitToken = async (resultToken) => {
    if (!resultToken || resultToken.length === 0) return [];

    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: resultToken.join(","),
            base64_encoded: 'false',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    while (true) {
        try {
            const response = await axios.request(options);
            const result = response.data;

            
            if (result && result.submissions) {
                const isResultObtained = result.submissions.every((r) => r.status_id > 2);

                if (isResultObtained) {
                    return result.submissions;
                }
            }
        } catch (error) {
            console.error("Judge0 Polling Error:", error.response?.data || error.message);
        }

        
        await waiting(1000);
    }
};

module.exports = { getLanguageById, submitBatch, submitToken };