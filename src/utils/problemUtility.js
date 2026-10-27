
// const axios = require('axios');

// const getLanguageById = (lang) => {
//     const language = {
//         "c++": 54,
//         "java": 62,
//         "javascript": 63
//     };

//     return language[lang.toLowerCase()];
// };

// const submitBatch = async (submissions) => {
//     const options = {
//         method: 'POST',
//         url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//         params: {
//             base64_encoded: 'false'
//         },
//         headers: {
//             'x-rapidapi-key': process.env.RAPIDAPI_KEY,
//             'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//             'Content-Type': 'application/json'
//         },
//         data: {
//             submissions
//         }
//     };

//     try {
//         const response = await axios.request(options);
//         return response.data;
//     } catch (error) {
//         console.error("Judge0 Batch Submit Error:", error.response?.data || error.message);

//         return null; 
//     }
// };


// const waiting = (timer) => {
//     return new Promise((resolve) => setTimeout(resolve, timer));
// };

// const submitToken = async (resultToken) => {
//     if (!resultToken || resultToken.length === 0) return [];

//     const options = {
//         method: 'GET',
//         url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//         params: {
//             tokens: resultToken.join(","),
//             base64_encoded: 'false',
//             fields: '*'
//         },
//         headers: {
//             'x-rapidapi-key': process.env.RAPIDAPI_KEY,
//             'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//         }
//     };

//     while (true) {
//         try {
//             const response = await axios.request(options);
//             const result = response.data;


//             if (result && result.submissions) {
//                 const isResultObtained = result.submissions.every((r) => r.status_id > 2);

//                 if (isResultObtained) {
//                     return result.submissions;
//                 }
//             }
//         } catch (error) {
//             console.error("Judge0 Polling Error:", error.response?.data || error.message);
//         }


//         await waiting(1000);
//     }
// };

// module.exports = { getLanguageById, submitBatch, submitToken };



const axios = require('axios');

const getLanguageById = (lang) => {
    if (!lang || typeof lang !== 'string') return undefined;

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
            base64_encoded: 'true'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions: submissions.map((submission) => ({
                ...submission,
                source_code: Buffer.from(
                    submission.source_code ?? '', 'utf8'
                ).toString('base64'),
                stdin: Buffer.from(
                    submission.stdin ?? '', 'utf8'
                ).toString('base64'),
                expected_output: Buffer.from(
                    submission.expected_output ?? '', 'utf8'
                ).toString('base64')
            }))
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

const submitToken = async (tokens) => {
    if (!tokens || tokens.length === 0) return [];

    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: tokens.join(","),
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    let attempts = 0;
    const maxAttempts = 20; // 20 seconds timeout safeguard

    while (attempts < maxAttempts) {
        try {
            const response = await axios.request(options);
            const result = response.data;

            if (result && Array.isArray(result.submissions)) {
                const decodedSubmissions = result.submissions.map((test) => {
                    const decoded = { ...test };

                    for (const field of [
                        'stdin',
                        'expected_output',
                        'stdout',
                        'stderr',
                        'compile_output',
                        'message'
                    ]) {
                        if (typeof decoded[field] === 'string') {
                            decoded[field] = Buffer.from(
                                decoded[field],
                                'base64'
                            ).toString('utf8');
                        }
                    }

                    return decoded;
                });

                const isResultObtained = decodedSubmissions.every(
                    (r) => r.status_id > 2
                );

                if (isResultObtained) {
                    return decodedSubmissions;
                }
            }
        } catch (error) {
            const status = error.response?.status;
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message;

            console.error("Judge0 Polling Error:", message);

            if (status === 429) {
                throw new Error(
                    "Judge0 rate limit exceeded. Please try again later."
                );
            }
        }

        attempts++;
        await waiting(2000);
    }

    console.warn("Judge0 polling timed out.");
    return [];
};

module.exports = { getLanguageById, submitBatch, submitToken };