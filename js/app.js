/* ============================================
   WINGO SIGNAL PRO - AI Trading App
   Core Application Logic
   ============================================ */

(function () {
    'use strict';

    /* ------------------------------------------
       STATE
    ------------------------------------------ */
    const state = {
        selectedTime: 30,
        history: [],
        isProcessing: false,
        chartData: [],
        chartAnimFrame: null
    };

    /* ------------------------------------------
       DOM REFS
    ------------------------------------------ */
    const dom = {
        timeBtns: document.querySelectorAll('.time-btn'),
        currencySelect: document.getElementById('currencySelect'),
        predictBtn: document.getElementById('predictBtn'),
        confidenceFill: document.getElementById('confidenceFill'),
        confidenceValue: document.getElementById('confidenceValue'),
        signalResult: document.getElementById('signalResult'),
        signalDetails: document.getElementById('signalDetails'),
        detailPair: document.getElementById('detailPair'),
        detailTime: document.getElementById('detailTime'),
        detailDirection: document.getElementById('detailDirection'),
        detailStrength: document.getElementById('detailStrength'),
        historyList: document.getElementById('historyList'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        totalSignals: document.getElementById('totalSignals'),
        buyCount: document.getElementById('buyCount'),
        sellCount: document.getElementById('sellCount'),
        signalChart: document.getElementById('signalChart'),
        bgCanvas: document.getElementById('bgCanvas')
    };

    /* ------------------------------------------
       BACKGROUND ANIMATION (Particles + Waves)
    ------------------------------------------ */
    function initBackground() {
        const canvas = dom.bgCanvas;
        const ctx = canvas.getContext('2d');
        let particles = [];
        const PARTICLE_COUNT = 60;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    size: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.4 + 0.1,
                    hue: Math.random() > 0.5 ? 168 : 264
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(0, 245, 212,' + (0.06 * (1 - dist / 150)) + ')';
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            particles.forEach(function (p) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'hsla(' + p.hue + ', 80%, 60%, ' + p.opacity + ')';
                ctx.fill();
            });

            requestAnimationFrame(drawParticles);
        }

        resize();
        createParticles();
        drawParticles();
        window.addEventListener('resize', function () {
            resize();
            createParticles();
        });
    }

    /* ------------------------------------------
       LIVE CHART (Mini candlestick/line chart)
    ------------------------------------------ */
    function initChart() {
        var canvas = dom.signalChart;
        var parent = canvas.parentElement;
        var ctx = canvas.getContext('2d');

        function resize() {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }

        // Generate initial data
        var basePrice = 1.1000 + Math.random() * 0.05;
        var data = [];
        for (var i = 0; i < 80; i++) {
            basePrice += (Math.random() - 0.5) * 0.0008;
            data.push(basePrice);
        }
        state.chartData = data;

        function drawChart() {
            resize();
            var w = canvas.width;
            var h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            var d = state.chartData;
            var min = Math.min.apply(null, d);
            var max = Math.max.apply(null, d);
            var range = max - min || 0.001;
            var padding = 20;

            // Grid lines
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.08)';
            ctx.lineWidth = 1;
            for (var g = 0; g < 5; g++) {
                var gy = padding + ((h - 2 * padding) / 4) * g;
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(w, gy);
                ctx.stroke();
            }

            // Price labels
            ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
            ctx.font = '10px "Share Tech Mono"';
            ctx.textAlign = 'right';
            for (var pl = 0; pl < 5; pl++) {
                var priceVal = max - (range / 4) * pl;
                var pricey = padding + ((h - 2 * padding) / 4) * pl;
                ctx.fillText(priceVal.toFixed(4), w - 5, pricey - 3);
            }

            if (d.length < 2) return;

            // Draw gradient fill
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            var lastVal = d[d.length - 1];
            var firstVal = d[0];
            var isUp = lastVal >= firstVal;
            if (isUp) {
                grad.addColorStop(0, 'rgba(0, 245, 212, 0.15)');
                grad.addColorStop(1, 'rgba(0, 245, 212, 0)');
            } else {
                grad.addColorStop(0, 'rgba(247, 37, 133, 0.15)');
                grad.addColorStop(1, 'rgba(247, 37, 133, 0)');
            }

            ctx.beginPath();
            var stepX = (w - 10) / (d.length - 1);
            for (var i = 0; i < d.length; i++) {
                var x = 5 + i * stepX;
                var y = padding + (1 - (d[i] - min) / range) * (h - 2 * padding);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.lineTo(5 + (d.length - 1) * stepX, h);
            ctx.lineTo(5, h);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();

            // Draw line
            ctx.beginPath();
            for (var j = 0; j < d.length; j++) {
                var lx = 5 + j * stepX;
                var ly = padding + (1 - (d[j] - min) / range) * (h - 2 * padding);
                if (j === 0) ctx.moveTo(lx, ly);
                else ctx.lineTo(lx, ly);
            }
            ctx.strokeStyle = isUp ? '#00f5d4' : '#f72585';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw last point glow
            var lastX = 5 + (d.length - 1) * stepX;
            var lastY = padding + (1 - (d[d.length - 1] - min) / range) * (h - 2 * padding);
            ctx.beginPath();
            ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
            ctx.fillStyle = isUp ? '#00f5d4' : '#f72585';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
            ctx.fillStyle = isUp ? 'rgba(0,245,212,0.2)' : 'rgba(247,37,133,0.2)';
            ctx.fill();

            // Current price label
            ctx.fillStyle = isUp ? '#00f5d4' : '#f72585';
            ctx.font = 'bold 12px "Share Tech Mono"';
            ctx.textAlign = 'left';
            ctx.fillText(d[d.length - 1].toFixed(5), lastX + 12, lastY + 4);
        }

        function tick() {
            var last = state.chartData[state.chartData.length - 1];
            var newVal = last + (Math.random() - 0.5) * 0.0006;
            state.chartData.push(newVal);
            if (state.chartData.length > 80) state.chartData.shift();
            drawChart();
            state.chartAnimFrame = requestAnimationFrame(tick);
        }

        drawChart();
        tick();
        window.addEventListener('resize', drawChart);
    }

    /* ------------------------------------------
       AI SIGNAL GENERATION
    ------------------------------------------ */
    function generateSignal(currency, timeOption) {
        // Simulated AI analysis with weighted randomness
        var seed = 0;
        for (var i = 0; i < currency.length; i++) {
            seed += currency.charCodeAt(i);
        }
        seed += Date.now() % 10000;

        var random = function () {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        var direction = random() > 0.5 ? 'BUY' : 'SELL';
        var confidence = Math.floor(random() * 25 + 72); // 72-96%

        var strengths = ['Strong', 'Very Strong', 'Ultra'];
        var strengthIdx = confidence > 90 ? 2 : (confidence > 82 ? 1 : 0);

        return {
            direction: direction,
            confidence: confidence,
            strength: strengths[strengthIdx],
            currency: currency,
            time: timeOption,
            timestamp: new Date()
        };
    }

    /* ------------------------------------------
       PREDICT FLOW
    ------------------------------------------ */
    function handlePredict() {
        if (state.isProcessing) return;
        state.isProcessing = true;

        var btn = dom.predictBtn;
        btn.classList.add('loading');

        // Show analyzing state
        dom.signalResult.innerHTML =
            '<div class="signal-analyzing">' +
            '<div class="signal-orbit">' +
            '<div class="orbit-ring"></div>' +
            '<div class="orbit-ring delay-1"></div>' +
            '<div class="orbit-ring delay-2"></div>' +
            '</div>' +
            '<p style="color: var(--accent-cyan); margin-top: 16px; font-family: var(--font-mono); font-size: 0.85rem;">ANALYZING MARKET DATA...</p>' +
            '</div>';

        dom.signalDetails.style.display = 'none';

        // Reset confidence
        dom.confidenceFill.style.width = '0%';
        dom.confidenceValue.textContent = '--';

        var currency = dom.currencySelect.value;
        var timeLabel = state.selectedTime < 60 ? state.selectedTime + 's' : (state.selectedTime / 60) + 'm';

        // Simulate AI processing delay
        setTimeout(function () {
            var signal = generateSignal(currency, timeLabel);
            displaySignal(signal);
            addToHistory(signal);
            updateStats();
            btn.classList.remove('loading');
            state.isProcessing = false;
        }, 1500 + Math.random() * 1000);
    }

    function displaySignal(signal) {
        var isBuy = signal.direction === 'BUY';
        var dirClass = isBuy ? 'buy' : 'sell';
        var arrow = isBuy ? '\u2191' : '\u2193';

        dom.signalResult.innerHTML =
            '<div class="signal-display">' +
            '<div class="signal-direction ' + dirClass + '">' +
            '<span class="signal-arrow">' + arrow + '</span> ' +
            signal.direction +
            '</div>' +
            '<div class="signal-pair-info">' +
            signal.currency + ' \u2022 ' + signal.time + ' \u2022 ' + signal.strength +
            '</div>' +
            '</div>';

        // Show details
        dom.signalDetails.style.display = 'grid';
        dom.detailPair.textContent = signal.currency;
        dom.detailTime.textContent = signal.time;
        dom.detailDirection.textContent = signal.direction;
        dom.detailDirection.style.color = isBuy ? 'var(--buy-color)' : 'var(--sell-color)';
        dom.detailStrength.textContent = signal.strength;

        // Animate confidence bar
        setTimeout(function () {
            dom.confidenceFill.style.width = signal.confidence + '%';
            dom.confidenceValue.textContent = signal.confidence + '%';
        }, 200);
    }

    /* ------------------------------------------
       HISTORY MANAGEMENT
    ------------------------------------------ */
    function addToHistory(signal) {
        state.history.unshift(signal);
        if (state.history.length > 50) state.history.pop();
        renderHistory();
    }

    function renderHistory() {
        if (state.history.length === 0) {
            dom.historyList.innerHTML = '<div class="history-empty"><p>No predictions yet</p></div>';
            return;
        }

        var html = '';
        state.history.forEach(function (s, idx) {
            var dirClass = s.direction === 'BUY' ? 'buy' : 'sell';
            var timeStr = s.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            html +=
                '<div class="history-item" style="animation-delay: ' + (idx * 0.05) + 's">' +
                '<div class="history-signal-badge ' + dirClass + '">' + s.direction + '</div>' +
                '<div class="history-info">' +
                '<div class="history-pair">' + s.currency + '</div>' +
                '<div class="history-meta">' + timeStr + ' \u2022 ' + s.time + '</div>' +
                '</div>' +
                '<div class="history-confidence">' + s.confidence + '%</div>' +
                '</div>';
        });
        dom.historyList.innerHTML = html;
    }

    function clearHistory() {
        state.history = [];
        renderHistory();
        updateStats();
        dom.signalResult.innerHTML =
            '<div class="signal-waiting">' +
            '<div class="signal-orbit">' +
            '<div class="orbit-ring"></div>' +
            '<div class="orbit-ring delay-1"></div>' +
            '<div class="orbit-ring delay-2"></div>' +
            '</div>' +
            '<p>Select options & tap <strong>PREDICT NOW</strong></p>' +
            '</div>';
        dom.signalDetails.style.display = 'none';
        dom.confidenceFill.style.width = '0%';
        dom.confidenceValue.textContent = '--';
    }

    function updateStats() {
        var total = state.history.length;
        var buys = state.history.filter(function (s) { return s.direction === 'BUY'; }).length;
        var sells = total - buys;

        dom.totalSignals.textContent = total;
        dom.buyCount.textContent = buys;
        dom.sellCount.textContent = sells;
    }

    /* ------------------------------------------
       EVENT LISTENERS
    ------------------------------------------ */
    function initEvents() {
        // Time buttons
        dom.timeBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                dom.timeBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                state.selectedTime = parseInt(btn.dataset.time, 10);
            });
        });

        // Predict button
        dom.predictBtn.addEventListener('click', function (e) {
            // Ripple effect
            var rect = dom.predictBtn.getBoundingClientRect();
            var ripple = document.createElement('span');
            ripple.classList.add('predict-ripple');
            ripple.style.left = (e.clientX - rect.left) + 'px';
            ripple.style.top = (e.clientY - rect.top) + 'px';
            dom.predictBtn.appendChild(ripple);
            setTimeout(function () { ripple.remove(); }, 600);

            handlePredict();
        });

        // Clear history
        dom.clearHistoryBtn.addEventListener('click', clearHistory);
    }

    /* ------------------------------------------
       INIT
    ------------------------------------------ */
    function init() {
        initBackground();
        initChart();
        initEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
