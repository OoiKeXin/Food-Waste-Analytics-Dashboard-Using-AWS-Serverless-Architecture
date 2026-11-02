import { latLongToVector3 } from './markers.js';
import { API_BASE_URL } from './config.js';
import * as THREE from 'three';

export let connectionCurves = [];
export let glowSpheres = [];

export function getGreatCirclePoints(p1, p2, segments = 70) {
    const points = [];
    const v1 = p1.clone().normalize();
    const v2 = p2.clone().normalize();
    const angle = v1.angleTo(v2);
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const theta = angle * t;
        const v = v1.clone().multiplyScalar(Math.sin(angle - theta))
            .add(v2.clone().multiplyScalar(Math.sin(theta)))
            .divideScalar(Math.sin(angle));
        const pos = v.normalize().multiplyScalar(1.235);
        points.push(pos);
    }
    return points;
}

export function createCurveLine(p1, p2) {
    const points = getGreatCirclePoints(p1, p2, 70);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.65 });
    return new THREE.Line(geometry, material);
}

export function updateConnectionCurves(scene, selectedCountries) {
    if (!scene) return;
    
    connectionCurves.forEach(curve => scene.remove(curve));
    glowSpheres.forEach(sphere => scene.remove(sphere));
    connectionCurves = [];
    glowSpheres = [];
    
    const data = window.foodWasteData;
    if (!data) return;
    
    if (selectedCountries.length >= 2) {
        const positions = [];
        selectedCountries.forEach(cname => {
            const c = data.find(d => d.country === cname);
            if (c) positions.push(latLongToVector3(c.lat, c.lon, 1.22));
        });
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const curveLine = createCurveLine(positions[i], positions[j]);
                scene.add(curveLine);
                connectionCurves.push(curveLine);
                
                const glowMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 0.4 });
                const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), glowMat);
                sphere1.position.copy(positions[i]);
                const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), glowMat);
                sphere2.position.copy(positions[j]);
                scene.add(sphere1);
                scene.add(sphere2);
                glowSpheres.push(sphere1, sphere2);
            }
        }
    }
}

const analysisCache = new Map();

async function getAnalysis(c) {
    if (analysisCache.has(c.country)) {
        return analysisCache.get(c.country);
    }

    const result = await analyzeCountryDynamically(c);
    analysisCache.set(c.country, result);

    return result;
}

const API_URL = "/api";

export async function analyzeCountryDynamically(country) {
    const GLOBAL_AVG = window.GLOBAL_AVG || 120;

    const householdPct = ((country.household / country.combined) * 100).toFixed(0);
    const retailPct = ((country.retail / country.combined) * 100).toFixed(0);
    const foodPct = ((country.foodService / country.combined) * 100).toFixed(0);
    const difference = country.combined - GLOBAL_AVG;
    const comparison = difference > 0 ? 'above' : difference < 0 ? 'below' : 'equal to';

    const payload = {
        country: country.country,
        combined: country.combined,
        householdPct,
        retailPct,
        foodPct,
        vsGlobal: difference,
        comparison
    };

    try {
        console.log('[AI] Sending country:', country.country);
        console.log('[AI] Payload:', payload);

        const res = await fetch(`${API_BASE_URL}/analyse-country`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const rawResponse = await res.text();

        console.log(`[AI] ${country.country} status:`, res.status);
        console.log(`[AI] ${country.country} raw response:`, rawResponse);

        if (!res.ok) {
            throw new Error(
                `${country.country} request failed: HTTP ${res.status}`
            );
        }

        const cleanText = rawResponse
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

        const responseData = JSON.parse(cleanText);

        console.log(`[AI] ${country.country} parsed response:`, responseData);

        return {
            reason: responseData.reason,
            solution: responseData.solution,
            householdPct,
            retailPct,
            foodPct
        };

    } catch (err) {
        console.error(err);

        return {
            reason: "AI analysis failed.",
            solution: "Retry or check API connection.",
            householdPct,
            retailPct,
            foodPct
        };
    }
}

export async function renderDynamicAnalysis(apiData, charts) {
    const countriesData = apiData.countries;
    const GLOBAL_AVG = apiData.globalAvg || 120;

    if (!countriesData || !countriesData.length) {
        console.error('[Analysis] No data available');
        return;
    }

    // =====================
    // BAR CHART
    // =====================
    const datasets = countriesData.map((d, idx) => ({
        label: d.country,
        data: [d.combined, d.household, d.retail, d.foodService],
        backgroundColor: `hsl(${260 + idx * 40}, 75%, 60%)`,
        borderRadius: 8
    }));

    if (charts.barChart) charts.barChart.destroy();
    charts.barChart = new Chart(charts.ctxBar, {
        type: 'bar',
        data: {
            labels: [
                'Total Waste',
                'Household Waste',
                'Retail Waste',
                'Food-Service Waste'
            ],
            datasets
        },
        options: {
            responsive: true,
            plugins: {
            title: {
                display: true,
                text: 'Food Waste by Sector (kg/person/year)'
            }
        }
        },
        
    });

    // =====================
    // RADAR CHART
    // =====================
    const radarDatasets = countriesData.map((d, idx) => ({
        label: d.country,
        data: [d.combined, d.household, d.retail, d.foodService],
        borderColor: `hsl(${260 + idx * 40}, 75%, 60%)`,
        backgroundColor: `hsla(${260 + idx * 40}, 75%, 60%, 0.2)`
    }));

    if (charts.radarChart) charts.radarChart.destroy();
    charts.radarChart = new Chart(charts.ctxRadar, {
        type: 'radar',
        data: {
            labels: [
                'Total Waste',
                'Household Waste',
                'Retail Waste',
                'Food-Service Waste'
            ],
            datasets: radarDatasets
        },
        options: {
            responsive: true,
            plugins: {
            title: {
                display: true,
                text: 'Food Waste by Sector (kg/person/year)'
            }
        }
        },
        
    });

    // =====================
    // LINE CHART
    // =====================
    if (charts.lineChart) charts.lineChart.destroy();
    charts.lineChart = new Chart(charts.ctxLine, {
        type: 'line',
        data: {
            labels: countriesData.map(d => d.country),
            datasets: [
                {
                    label: 'Total Waste (kg/person/year)',
                    data: countriesData.map(d => d.combined),
                    borderColor: '#c084fc',
                    backgroundColor: 'rgba(192,132,252,0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Global Average (kg/person/year)',
                    data: Array(countriesData.length).fill(GLOBAL_AVG),
                    borderColor: '#f97316',
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#e2e8f0' } }
            }
        }
    });

    // =====================
    // TABLE
    // =====================
    document.getElementById('tableBody').innerHTML = countriesData.map(d => `
        <tr>
            <td>
                <img src="${d.flagUrl}" style="width:24px;height:18px;border-radius:3px;margin-right:8px;">
                ${d.country}
            </td>
            <td><strong>${d.combined}</strong></td>
            <td>${d.household}</td>
            <td>${d.retail}</td>
            <td>${d.foodService}</td>
            <td>${(d.combined - GLOBAL_AVG).toFixed(0)}</td>
        </tr>
    `).join('');

    // =====================
    // STATS
    // =====================
    const maxCountry = countriesData.reduce((a, b) => a.combined > b.combined ? a : b);
    const minCountry = countriesData.reduce((a, b) => a.combined < b.combined ? a : b);
    const avgVal = (countriesData.reduce((s, d) => s + d.combined, 0) / countriesData.length).toFixed(1);

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card"><span>🏆</span><h4>Highest Waste</h4><p>${maxCountry.country}<br><strong>${maxCountry.combined} kg</strong></p></div>
        <div class="stat-card"><span>⭐</span><h4>Lowest Waste</h4><p>${minCountry.country}<br><strong>${minCountry.combined} kg</strong></p></div>
        <div class="stat-card"><span>📊</span><h4>Average Waste</h4><p>${avgVal} kg/person</p></div>
    `;
    
    // Root cause analysis
    let rootHtml = '<div style="display:flex;flex-direction:column;gap:16px;">';
    for (const c of countriesData) {
        const analysis = await getAnalysis(c);

        rootHtml += `
            <div style="background:rgba(0,0,0,0.3);border-radius:20px;padding:16px;border-left:4px solid #c084fc;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                    <img src="${c.flagUrl}" style="width:32px;height:24px;">
                    <span style="font-weight:700;">${c.country}</span>
                    <span>🏠${analysis.householdPct}% 🏬${analysis.retailPct}% 🍽️${analysis.foodPct}%</span>
                </div>
                <div>${analysis.reason}</div>
            </div>
        `;
    }
    rootHtml += '</div>';
    document.getElementById('rootCauseAnalysis').innerHTML = rootHtml;
    
    // Solutions
    let solHtml = '<div style="display:flex;flex-direction:column;gap:16px;">';
    for (const c of countriesData) {
        const analysis = await getAnalysis(c);

        solHtml += `
            <div style="background:rgba(0,0,0,0.3);border-radius:20px;padding:16px;border-left:4px solid #fbbf24;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <img src="${c.flagUrl}" style="width:32px;height:24px;">
                    <span style="font-weight:700;">${c.country}</span>
                </div>
                <div style="margin-top:8px;">${analysis.solution}</div>
            </div>
        `;
    }
    solHtml += '</div>';
    document.getElementById('solutionAnalysis').innerHTML = solHtml;
    
    // Comprehensive insights
    const insightResponse = await fetch(
    `${API_BASE_URL}/comprehensive-insights`,
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            countries: countriesData,
            globalAvg: GLOBAL_AVG
        })
    }
);

const rawResponse = await insightResponse.text();

console.log('[Comprehensive] HTTP status:', insightResponse.status);
console.log('[Comprehensive] Raw response:', rawResponse);

if (!insightResponse.ok) {
    throw new Error(
        `Comprehensive insight request failed: HTTP ${insightResponse.status}`
    );
}

const cleanText = rawResponse
    .replace(/^\uFEFF/, '')
    .replace(/^\s*```json\s*/i, '')
    .replace(/^\s*```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

console.log('[Comprehensive] Clean text:', cleanText);

const responseData = JSON.parse(cleanText);

console.log('[Comprehensive] Parsed response:', responseData);

document.getElementById('aiInsightText').innerHTML = `
    <p><strong>📊 AI Data-Driven Insights</strong></p>
    <p><strong>Key Pattern 1:</strong> ${responseData.keyPatterns[0]}</p>
    <p><strong>Key Pattern 2:</strong> ${responseData.keyPatterns[1]}</p>
    <p><strong>Priority Country: </strong></p>
    <p><strong>Country:</strong> ${responseData.priorityAreas[0].country}</p>
    <p><strong>Sector:</strong> ${responseData.priorityAreas[0].sector}</p>
    <p><strong>Reason:</strong> ${responseData.priorityAreas[0].reason}</p>
    <p><strong>Recommendation:</strong> ${responseData.recommendation}</p>
`;
}