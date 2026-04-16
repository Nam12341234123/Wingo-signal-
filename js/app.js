/**
 * Wingo Predict AI Tool - Main Application
 * Ultra UI with Real AI Analysis
 */

(function () {
    'use strict';

    // ===== DOM REFERENCES =====
    const uploadArea = document.getElementById('uploadArea');
    const uploadContent = document.getElementById('uploadContent');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const previewImage = document.getElementById('previewImage');
    const clearImageBtn = document.getElementById('clearImage');
    const imageInfo = document.getElementById('imageInfo');
    const scanLine = document.getElementById('scanLine');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeStatus = document.getElementById('analyzeStatus');
    const statusText = document.getElementById('statusText');
    const resultsSection = document.getElementById('resultsSection');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const particlesContainer = document.getElementById('particles');

    // Result elements
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceValue = document.getElementById('confidenceValue');
    const bsPrediction = document.getElementById('bsPrediction');
    const bsBadge = document.getElementById('bsBadge');
    const bigBar = document.getElementById('bigBar');
    const smallBar = document.getElementById('smallBar');
    const bigPct = document.getElementById('bigPct');
    const smallPct = document.getElementById('smallPct');
    const numberWheel = document.getElementById('numberWheel');
    const numberGrid = document.getElementById('numberGrid');
    const numBadge = document.getElementById('numBadge');
    const colourOrb = document.getElementById('colourOrb');
    const colourName = document.getElementById('colourName');
    const colBadge = document.getElementById('colBadge');
    const redBar = document.getElementById('redBar');
    const greenBar = document.getElementById('greenBar');
    const violetBar = document.getElementById('violetBar');
    const redPct = document.getElementById('redPct');
    const greenPct = document.getElementById('greenPct');
    const violetPct = document.getElementById('violetPct');
    const patternType = document.getElementById('patternType');
    const trendDirection = document.getElementById('trendDirection');
    const signalStrength = document.getElementById('signalStrength');
    const nextPeriod = document.getElementById('nextPeriod');
    const patternCanvas = document.getElementById('patternCanvas');

    // ===== AI ENGINE =====
    const aiEngine = new WingoAIEngine();

    // ===== PARTICLES BACKGROUND =====
    function createParticles() {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (6 + Math.random() * 6) + 's';
            const colors = ['#00f0ff', '#7b2dff', '#ff3b9a', '#4dff4d'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.width = (2 + Math.random() * 3) + 'px';
            particle.style.height = particle.style.width;
            particlesContainer.appendChild(particle);
        }
    }
    createParticles();

    // ===== NUMBER GRID INIT =====
    function initNumberGrid() {
        numberGrid.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const cell = document.createElement('div');
            cell.className = 'num-cell';
            cell.textContent = i;
            cell.dataset.num = i;
            numberGrid.appendChild(cell);
        }
    }
    initNumberGrid();

    // ===== UPLOAD AREA MOUSE TRACKING =====
    uploadArea.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        this.style.setProperty('--mouse-x', x + '%');
        this.style.setProperty('--mouse-y', y + '%');
    });

    // ===== FILE UPLOAD =====
    uploadArea.addEventListener('click', function () {
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', function () {
        this.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    fileInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            handleFile(this.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showNotification('Please upload an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewImage.onload = function () {
                uploadContent.style.display = 'none';
                previewArea.classList.remove('hidden');
                analyzeBtn.disabled = false;

                // Show image info
                const sizeKB = Math.round(file.size / 1024);
                imageInfo.innerHTML =
                    '<span>Size: ' + sizeKB + ' KB</span>' +
                    '<span>Dimensions: ' + previewImage.naturalWidth + ' x ' + previewImage.naturalHeight + '</span>' +
                    '<span>Type: ' + file.type.split('/')[1].toUpperCase() + '</span>';

                // Trigger scan animation
                scanLine.classList.add('active');
                setTimeout(function () {
                    scanLine.classList.remove('active');
                }, 2000);
            };
        };
        reader.readAsDataURL(file);
    }

    // ===== CLEAR IMAGE =====
    clearImageBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        previewImage.src = '';
        previewArea.classList.add('hidden');
        uploadContent.style.display = '';
        analyzeBtn.disabled = true;
        fileInput.value = '';
        resultsSection.classList.add('hidden');
    });

    // ===== ANALYZE BUTTON =====
    analyzeBtn.addEventListener('click', async function () {
        if (this.disabled) return;

        this.disabled = true;
        analyzeStatus.classList.remove('hidden');
        resultsSection.classList.add('hidden');

        // Simulate AI server connection phases
        const phases = [
            { text: 'Connecting to AI Server...', duration: 600 },
            { text: 'Uploading chart data...', duration: 500 },
            { text: 'Analyzing color patterns...', duration: 700 },
            { text: 'Processing pixel matrix...', duration: 600 },
            { text: 'Running prediction model...', duration: 800 },
            { text: 'Calculating probabilities...', duration: 500 },
            { text: 'Generating results...', duration: 400 }
        ];

        // Trigger scan animation on preview
        scanLine.classList.add('active');

        for (let i = 0; i < phases.length; i++) {
            statusText.textContent = phases[i].text;
            await delay(phases[i].duration);
        }

        try {
            // Run actual AI analysis
            const results = await aiEngine.analyze(previewImage);
            scanLine.classList.remove('active');
            analyzeStatus.classList.add('hidden');

            // Display results with animation
            displayResults(results);
        } catch (error) {
            console.error('Analysis error:', error);
            statusText.textContent = 'Analysis failed. Please try again.';
            setTimeout(function () {
                analyzeStatus.classList.add('hidden');
                analyzeBtn.disabled = false;
            }, 2000);
        }
    });

    // ===== DISPLAY RESULTS =====
    function displayResults(results) {
        resultsSection.classList.remove('hidden');

        // Scroll to results
        setTimeout(function () {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        // Confidence meter
        animateValue(confidenceValue, 0, results.confidence, 1500, '%');
        setTimeout(function () {
            confidenceFill.style.width = results.confidence + '%';
        }, 100);

        // === BIG/SMALL ===
        const bs = results.bigSmall;
        bsPrediction.querySelector('.prediction-value').textContent = bs.prediction;
        bsBadge.textContent = bs.prediction;
        bsBadge.style.color = bs.prediction === 'BIG' ? '#00f0ff' : '#ff3b9a';
        bsBadge.style.borderColor = bs.prediction === 'BIG' ? 'rgba(0,240,255,0.3)' : 'rgba(255,59,154,0.3)';
        bsBadge.style.background = bs.prediction === 'BIG' ? 'rgba(0,240,255,0.08)' : 'rgba(255,59,154,0.08)';

        setTimeout(function () {
            bigBar.style.width = Math.round(bs.bigProbability * 100) + '%';
            smallBar.style.width = Math.round(bs.smallProbability * 100) + '%';
        }, 200);
        animateValue(bigPct, 0, Math.round(bs.bigProbability * 100), 1200, '%');
        animateValue(smallPct, 0, Math.round(bs.smallProbability * 100), 1200, '%');

        // === NUMBER ===
        const num = results.number;
        const wheelNumber = numberWheel.querySelector('.wheel-number');
        numberWheel.classList.remove('animate');
        void numberWheel.offsetWidth; // Force reflow
        numberWheel.classList.add('animate');

        // Animate number wheel with slot-machine effect
        let counter = 0;
        const slotInterval = setInterval(function () {
            wheelNumber.textContent = Math.floor(Math.random() * 10);
            counter++;
            if (counter > 15) {
                clearInterval(slotInterval);
                wheelNumber.textContent = num.prediction;
            }
        }, 80);

        numBadge.textContent = '#' + num.prediction;

        // Update number grid
        const cells = numberGrid.querySelectorAll('.num-cell');
        cells.forEach(function (cell) {
            cell.classList.remove('active', 'highlight');
        });

        setTimeout(function () {
            cells.forEach(function (cell) {
                const cellNum = parseInt(cell.dataset.num);
                if (cellNum === num.prediction) {
                    cell.classList.add('active');
                } else if (num.topNumbers.some(function (t) { return t.number === cellNum; })) {
                    cell.classList.add('highlight');
                }
            });
        }, 600);

        // === COLOUR ===
        const col = results.colour;
        colourOrb.className = 'colour-orb animate ' + col.prediction.toLowerCase();
        colourName.textContent = col.prediction.toUpperCase();
        colourName.style.color =
            col.prediction === 'Red' ? '#ff3b5c' :
            col.prediction === 'Green' ? '#4dff4d' : '#a855f7';

        colBadge.textContent = col.prediction;
        colBadge.style.color =
            col.prediction === 'Red' ? '#ff3b5c' :
            col.prediction === 'Green' ? '#4dff4d' : '#a855f7';

        setTimeout(function () {
            redBar.style.width = Math.round(col.redProbability * 100) + '%';
            greenBar.style.width = Math.round(col.greenProbability * 100) + '%';
            violetBar.style.width = Math.round(col.violetProbability * 100) + '%';
        }, 300);
        animateValue(redPct, 0, Math.round(col.redProbability * 100), 1200, '%');
        animateValue(greenPct, 0, Math.round(col.greenProbability * 100), 1200, '%');
        animateValue(violetPct, 0, Math.round(col.violetProbability * 100), 1200, '%');

        // === PATTERN ===
        const pat = results.pattern;
        patternType.textContent = pat.type;
        trendDirection.textContent = pat.trendDirection;
        signalStrength.textContent = pat.signalStrength;
        nextPeriod.textContent = pat.nextPeriod;

        // Color code signal strength
        signalStrength.style.color =
            pat.signalStrength === 'Strong' ? '#4dff4d' :
            pat.signalStrength === 'Medium' ? '#ff9f1c' : '#ff3b5c';

        // Draw pattern chart
        drawPatternChart(results.chartData);

        // Add to history
        addToHistory(results);

        // Re-enable analyze button
        analyzeBtn.disabled = false;
    }

    // ===== PATTERN CHART =====
    function drawPatternChart(data) {
        const canvas = patternCanvas;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = 200 * dpr;
        canvas.style.height = '200px';
        ctx.scale(dpr, dpr);

        const w = canvas.offsetWidth;
        const h = 200;
        const padding = 20;

        ctx.clearRect(0, 0, w, h);

        if (!data || data.length < 2) return;

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const points = data.map(function (val, i) {
            return {
                x: padding + (i / (data.length - 1)) * (w - padding * 2),
                y: padding + (1 - (val - min) / range) * (h - padding * 2)
            };
        });

        // Draw gradient area
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(points[0].x, h - padding);
        points.forEach(function (p) {
            ctx.lineTo(p.x, p.y);
        });
        ctx.lineTo(points[points.length - 1].x, h - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        const lineGrad = ctx.createLinearGradient(0, 0, w, 0);
        lineGrad.addColorStop(0, '#00f0ff');
        lineGrad.addColorStop(0.5, '#7b2dff');
        lineGrad.addColorStop(1, '#ff3b9a');

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const cp1x = (points[i - 1].x + points[i].x) / 2;
            const cp1y = points[i - 1].y;
            const cp2x = cp1x;
            const cp2y = points[i].y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
        }
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw points
        points.forEach(function (p, i) {
            if (i % 2 === 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#00f0ff';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        // Highlight last point
        const last = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff3b9a';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(last.x, last.y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 59, 154, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    // ===== HISTORY =====
    function addToHistory(results) {
        const emptyMsg = historyList.querySelector('.history-empty');
        if (emptyMsg) emptyMsg.remove();

        const item = document.createElement('div');
        item.className = 'history-item';

        const time = new Date(results.timestamp);
        const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const bsClass = results.bigSmall.prediction.toLowerCase();
        const colClass = results.colour.prediction.toLowerCase();

        item.innerHTML =
            '<span class="history-time">' + timeStr + '</span>' +
            '<span class="history-tag ' + bsClass + '">' + results.bigSmall.prediction + '</span>' +
            '<span class="history-number">' + results.number.prediction + '</span>' +
            '<span class="history-tag ' + colClass + '">' + results.colour.prediction + '</span>';

        historyList.insertBefore(item, historyList.firstChild);

        // Limit history items
        while (historyList.children.length > 20) {
            historyList.removeChild(historyList.lastChild);
        }
    }

    clearHistoryBtn.addEventListener('click', function () {
        historyList.innerHTML = '<div class="history-empty">No predictions yet</div>';
        aiEngine.clearHistory();
    });

    // ===== UTILITY FUNCTIONS =====
    function delay(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    function animateValue(element, start, end, duration, suffix) {
        suffix = suffix || '';
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            const current = Math.round(start + (end - start) * eased);
            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function showNotification(message, type) {
        // Simple console notification
        console.log('[' + type.toUpperCase() + '] ' + message);
    }

    // ===== RESIZE HANDLER =====
    window.addEventListener('resize', function () {
        if (patternCanvas && patternCanvas.offsetWidth > 0) {
            const lastResults = aiEngine.getHistory();
            if (lastResults.length > 0) {
                const lastData = lastResults[lastResults.length - 1].predictions.chartData;
                if (lastData) {
                    drawPatternChart(lastData);
                }
            }
        }
    });

})();
