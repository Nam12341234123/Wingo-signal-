/* ========================================
   WINGO PREDICT AI TOOL - Script
   ======================================== */

// ---- State ----
let predictionHistory = [];
let isProcessing = false;

// ---- Initialize Particles ----
function initParticles() {
    const container = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        particle.style.width = (Math.random() * 3 + 1) + 'px';
        particle.style.height = particle.style.width;

        const colors = [
            'rgba(0, 240, 255, 0.6)',
            'rgba(139, 92, 246, 0.5)',
            'rgba(255, 0, 110, 0.4)',
            'rgba(0, 255, 136, 0.5)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.boxShadow = '0 0 6px ' + particle.style.background;
        container.appendChild(particle);
    }
}

// ---- AI Prediction Engine ----
function generatePrediction(periodId) {
    // Simulated AI analysis based on period number patterns
    let hash = 0;
    for (let i = 0; i < periodId.length; i++) {
        const char = periodId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    // Add time-based entropy
    const now = Date.now();
    const seed = Math.abs(hash + now) % 1000;

    const isBig = seed >= 500;
    const result = isBig ? 'BIG' : 'SMALL';

    // Generate confidence (75-98%)
    const confidence = Math.floor(75 + (seed % 24));

    // Generate pattern analysis
    const patterns = ['Streak', 'Zigzag', 'Cluster', 'Wave', 'Reverse', 'Momentum'];
    const trends = ['Bullish', 'Bearish', 'Neutral', 'Volatile', 'Stable'];
    const signals = ['Strong', 'Medium', 'Ultra', 'Peak', 'Rising'];

    const patternIdx = Math.abs(hash) % patterns.length;
    const trendIdx = Math.abs(hash + 1) % trends.length;
    const signalIdx = Math.abs(hash + 2) % signals.length;
    const accuracy = Math.floor(80 + (seed % 18));

    return {
        result: result,
        confidence: confidence,
        pattern: patterns[patternIdx],
        trend: trends[trendIdx],
        accuracy: accuracy + '%',
        signal: signals[signalIdx],
        periodId: periodId,
        timestamp: new Date().toLocaleTimeString()
    };
}

// ---- Start Prediction ----
function startPrediction() {
    if (isProcessing) return;

    const input = document.getElementById('periodInput');
    const periodId = input.value.trim();

    if (!periodId) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
        return;
    }

    isProcessing = true;

    const btn = document.getElementById('predictBtn');
    btn.classList.add('loading');
    btn.querySelector('.btn-text').textContent = 'ANALYZING...';

    // Show analysis section
    const analysisSection = document.getElementById('analysisSection');
    analysisSection.style.display = 'block';

    // Reset analysis UI
    const resultDisplay = document.getElementById('resultDisplay');
    resultDisplay.style.display = 'none';

    const badge = document.getElementById('analysisBadge');
    badge.textContent = 'Processing';
    badge.className = 'analysis-badge processing';

    const analysisAnim = document.getElementById('analysisAnim');
    analysisAnim.style.display = 'block';

    // Reset steps
    const steps = document.querySelectorAll('.step');
    steps.forEach(s => {
        s.className = 'step';
    });

    // Reset progress
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = '0%';

    // Scroll to analysis
    analysisSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Run analysis animation sequence
    runAnalysisSequence(periodId);
}

// ---- Analysis Animation Sequence ----
function runAnalysisSequence(periodId) {
    const steps = [
        { id: 'step1', progress: 25, delay: 600 },
        { id: 'step2', progress: 50, delay: 800 },
        { id: 'step3', progress: 75, delay: 1000 },
        { id: 'step4', progress: 100, delay: 700 }
    ];

    let currentStep = 0;

    function nextStep() {
        if (currentStep > 0) {
            document.getElementById(steps[currentStep - 1].id).className = 'step done';
        }

        if (currentStep < steps.length) {
            const step = steps[currentStep];
            document.getElementById(step.id).className = 'step active';
            document.getElementById('progressBar').style.width = step.progress + '%';
            currentStep++;
            setTimeout(nextStep, step.delay);
        } else {
            // Analysis complete
            document.getElementById(steps[steps.length - 1].id).className = 'step done';
            showResult(periodId);
        }
    }

    setTimeout(nextStep, 400);
}

// ---- Show Result ----
function showResult(periodId) {
    const prediction = generatePrediction(periodId);

    // Hide animation, show result
    document.getElementById('analysisAnim').style.display = 'none';

    const badge = document.getElementById('analysisBadge');
    badge.textContent = 'Complete';
    badge.className = 'analysis-badge complete';

    const resultDisplay = document.getElementById('resultDisplay');
    resultDisplay.style.display = 'block';

    // Set result period
    document.getElementById('resultPeriod').textContent = 'Period: ' + prediction.periodId;

    // Set result card
    const resultCard = document.getElementById('resultCard');
    const isBig = prediction.result === 'BIG';
    resultCard.className = 'result-card ' + (isBig ? 'big' : 'small');

    document.getElementById('resultValue').textContent = prediction.result;

    // Confidence bar
    setTimeout(() => {
        document.getElementById('confidenceFill').style.width = prediction.confidence + '%';
    }, 100);
    document.getElementById('confidencePct').textContent = prediction.confidence + '%';

    // Pattern info
    document.getElementById('patternType').textContent = prediction.pattern;
    document.getElementById('trendValue').textContent = prediction.trend;
    document.getElementById('accuracyValue').textContent = prediction.accuracy;
    document.getElementById('signalValue').textContent = prediction.signal;

    // Add to history
    addToHistory(prediction);

    // Reset button
    const btn = document.getElementById('predictBtn');
    btn.classList.remove('loading');
    btn.querySelector('.btn-text').textContent = 'PREDICT NOW';

    isProcessing = false;

    // Scroll to result
    resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---- Add to History ----
function addToHistory(prediction) {
    predictionHistory.unshift(prediction);

    // Keep max 50 items
    if (predictionHistory.length > 50) {
        predictionHistory.pop();
    }

    renderHistory();
}

// ---- Render History ----
function renderHistory() {
    const historyList = document.getElementById('historyList');
    const emptyState = document.getElementById('emptyState');

    if (predictionHistory.length === 0) {
        historyList.innerHTML = '';
        historyList.appendChild(createEmptyState());
        return;
    }

    historyList.innerHTML = '';

    predictionHistory.forEach((pred, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.style.animationDelay = (index * 0.05) + 's';

        const isBig = pred.result === 'BIG';
        const colorClass = isBig ? 'big' : 'small';

        item.innerHTML = `
            <div class="history-result-badge ${colorClass}">
                ${pred.result === 'BIG' ? 'B' : 'S'}
            </div>
            <div class="history-info">
                <div class="history-period">#${pred.periodId}</div>
                <div class="history-meta">${pred.pattern} Pattern &bull; ${pred.timestamp}</div>
            </div>
            <div class="history-confidence ${colorClass}">
                ${pred.confidence}%
            </div>
        `;

        historyList.appendChild(item);
    });
}

// ---- Create Empty State ----
function createEmptyState() {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.id = 'emptyState';
    empty.innerHTML = `
        <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="2" y="3" width="20" height="18" rx="2"/>
                <path d="M8 7h8"/>
                <path d="M8 11h8"/>
                <path d="M8 15h4"/>
            </svg>
        </div>
        <p>No predictions yet</p>
        <span>Enter a period number and click Predict</span>
    `;
    return empty;
}

// ---- Clear History ----
function clearHistory() {
    if (predictionHistory.length === 0) return;

    // Animate out
    const items = document.querySelectorAll('.history-item');
    items.forEach((item, index) => {
        item.style.transition = 'all 0.3s ease';
        item.style.transitionDelay = (index * 0.03) + 's';
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
    });

    setTimeout(() => {
        predictionHistory = [];
        renderHistory();
    }, items.length * 30 + 300);
}

// ---- Enter Key Handler ----
document.addEventListener('DOMContentLoaded', function() {
    initParticles();

    document.getElementById('periodInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startPrediction();
        }
    });
});
