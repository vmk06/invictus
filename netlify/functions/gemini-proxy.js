// netlify/functions/gemini-proxy.js

const fetch = require('node-fetch'); // Node.js built-in fetch or install node-fetch if older Node.js

exports.handler = async function(event, context) {
    // Ensure the request method is POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const payload = JSON.parse(event.body); // Parse the request body from your frontend

        // Retrieve the API key from Netlify Environment Variables
        // This is crucial for security: your API key is NOT in your public code
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error: API key not set.' })
            };
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Gemini API responded with status ${response.status}: ${errorText}` })
            };
        }

        const result = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow requests from any origin (your GitHub Pages site)
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Proxy function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};
