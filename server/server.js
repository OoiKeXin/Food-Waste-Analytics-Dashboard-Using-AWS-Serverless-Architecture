import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const port = 3001;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

app.post('/api/analyze-country', async (req, res) => {
    try {
        const countryData = req.body;

        const response = await openai.responses.create({
            model: 'gpt-4o-mini',
            input: `
                Analyze this food-waste data:

                ${JSON.stringify(countryData)}

                Use the supplied comparison exactly. If comparison is "above", the country is
                above the global average. If it is "below", the country is below the global
                average. Do not recalculate or contradict this comparison.

                Return only valid JSON:
                {
                "reason": "short explanation",
                "solution": "short practical solution"
                }
                `,
            text: {
                format: { type: 'json_object' }
            }
        });

        const result = JSON.parse(response.output_text);

        res.json(result);
    } catch (error) {
        console.error('[OpenAI] Request failed:', error);
        res.status(500).json({
            reason: 'AI analysis is unavailable.',
            solution: 'Try again later.',
            error: process.env.NODE_ENV === 'production' ? undefined : error.message
        });
    }
});

app.post('/api/comprehensive-insight', async (req, res) => {
    try {
        const { countries, globalAvg } = req.body;

        const response = await openai.responses.create({
            model: 'gpt-4o-mini',
            input: `
                Analyze this food-waste dataset:

                ${JSON.stringify({ countries, globalAvg })}

                Return only valid JSON:
                {
                "insight": "A concise overall analysis",
                "priority": "Which country or issue needs the most attention",
                "benchmark": "Which country performs relatively better",
                "recommendation": "A practical recommendation"
                }
                `,
            text: {
                format: { type: 'json_object' }
            }
        });

        res.json(JSON.parse(response.output_text));
    } catch (error) {
        console.error('[OpenAI] Comprehensive insight failed:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
