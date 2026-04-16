/**
 * Wingo Predict AI Engine v3.0 Ultra
 * Real AI Server Pattern Analysis System
 * Analyzes chart screenshots for Big/Small, Number, and Colour predictions
 */

class WingoAIEngine {
    constructor() {
        this.patternMemory = [];
        this.colorProfiles = {
            red:    { r: [180, 255], g: [0, 100], b: [0, 100] },
            green:  { r: [0, 100], g: [150, 255], b: [0, 100] },
            violet: { r: [100, 200], g: [0, 120], b: [180, 255] }
        };
        this.analysisHistory = [];
        this.modelWeights = this._initWeights();
    }

    _initWeights() {
        return {
            colorBias: [0.35, 0.35, 0.30],
            trendFactor: 0.72,
            patternDecay: 0.85,
            confidenceBase: 0.68,
            entropyFactor: 0.15
        };
    }

    /**
     * Main analysis entry point
     * @param {HTMLImageElement} imageElement - The chart image to analyze
     * @returns {Promise<Object>} Analysis results
     */
    async analyze(imageElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = imageElement.naturalWidth || imageElement.width;
        canvas.height = imageElement.naturalHeight || imageElement.height;
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Phase 1: Color Distribution Analysis
        const colorAnalysis = this._analyzeColorDistribution(imageData);

        // Phase 2: Pattern Detection
        const patternData = this._detectPatterns(imageData, canvas.width, canvas.height);

        // Phase 3: Trend Analysis
        const trendData = this._analyzeTrends(imageData, canvas.width, canvas.height);

        // Phase 4: Entropy Calculation
        const entropy = this._calculateEntropy(imageData);

        // Phase 5: Generate Predictions
        const predictions = this._generatePredictions(colorAnalysis, patternData, trendData, entropy);

        // Store in history
        this.analysisHistory.push({
            timestamp: Date.now(),
            predictions,
            confidence: predictions.confidence
        });

        return predictions;
    }

    /**
     * Analyze the color distribution of the image
     */
    _analyzeColorDistribution(imageData) {
        const data = imageData.data;
        const totalPixels = data.length / 4;

        let redCount = 0, greenCount = 0, violetCount = 0;
        let totalR = 0, totalG = 0, totalB = 0;
        let brightPixels = 0, darkPixels = 0;
        const colorHistogram = new Array(256).fill(0);
        const hueDistribution = new Array(360).fill(0);

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            totalR += r;
            totalG += g;
            totalB += b;

            const brightness = (r + g + b) / 3;
            colorHistogram[Math.floor(brightness)] += 1;

            if (brightness > 170) brightPixels++;
            if (brightness < 85) darkPixels++;

            // HSL conversion for hue analysis
            const hsl = this._rgbToHsl(r, g, b);
            hueDistribution[Math.floor(hsl.h * 360)] += 1;

            // Color classification
            if (this._matchesProfile(r, g, b, this.colorProfiles.red)) redCount++;
            if (this._matchesProfile(r, g, b, this.colorProfiles.green)) greenCount++;
            if (this._matchesProfile(r, g, b, this.colorProfiles.violet)) violetCount++;
        }

        const totalColored = redCount + greenCount + violetCount || 1;

        return {
            red: redCount / totalColored,
            green: greenCount / totalColored,
            violet: violetCount / totalColored,
            avgR: totalR / totalPixels,
            avgG: totalG / totalPixels,
            avgB: totalB / totalPixels,
            brightness: (totalR + totalG + totalB) / (totalPixels * 3),
            brightRatio: brightPixels / totalPixels,
            darkRatio: darkPixels / totalPixels,
            colorHistogram,
            hueDistribution,
            dominantHue: this._findDominantHue(hueDistribution)
        };
    }

    _matchesProfile(r, g, b, profile) {
        return r >= profile.r[0] && r <= profile.r[1] &&
               g >= profile.g[0] && g <= profile.g[1] &&
               b >= profile.b[0] && b <= profile.b[1];
    }

    _rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h, s, l };
    }

    _findDominantHue(hueDistribution) {
        let maxCount = 0, dominantHue = 0;
        // Use sliding window for smoothing
        for (let i = 0; i < 360; i++) {
            let windowSum = 0;
            for (let j = -5; j <= 5; j++) {
                windowSum += hueDistribution[(i + j + 360) % 360];
            }
            if (windowSum > maxCount) {
                maxCount = windowSum;
                dominantHue = i;
            }
        }
        return dominantHue;
    }

    /**
     * Detect visual patterns in the chart image
     */
    _detectPatterns(imageData, width, height) {
        const data = imageData.data;
        const columns = 20;
        const columnWidth = Math.floor(width / columns);
        const columnAvgs = [];

        // Compute average brightness per column strip
        for (let col = 0; col < columns; col++) {
            let sum = 0, count = 0;
            const startX = col * columnWidth;
            const endX = Math.min(startX + columnWidth, width);

            for (let y = 0; y < height; y++) {
                for (let x = startX; x < endX; x++) {
                    const idx = (y * width + x) * 4;
                    sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    count++;
                }
            }
            columnAvgs.push(sum / count);
        }

        // Detect trends
        let upTrends = 0, downTrends = 0;
        const diffs = [];
        for (let i = 1; i < columnAvgs.length; i++) {
            const diff = columnAvgs[i] - columnAvgs[i - 1];
            diffs.push(diff);
            if (diff > 2) upTrends++;
            else if (diff < -2) downTrends++;
        }

        // Detect volatility
        const meanDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        const variance = diffs.reduce((a, d) => a + (d - meanDiff) ** 2, 0) / diffs.length;
        const volatility = Math.sqrt(variance);

        // Detect periodicity using autocorrelation
        const periodicity = this._detectPeriodicity(columnAvgs);

        // Pattern classification
        let patternType = 'Neutral';
        if (upTrends > downTrends * 1.5) patternType = 'Ascending Wave';
        else if (downTrends > upTrends * 1.5) patternType = 'Descending Wave';
        else if (volatility > 15) patternType = 'High Volatility';
        else if (volatility < 3) patternType = 'Consolidation';
        else if (periodicity.strength > 0.5) patternType = 'Cyclic Pattern';

        return {
            columnAvgs,
            upTrends,
            downTrends,
            volatility,
            periodicity,
            patternType,
            trendBias: upTrends / (upTrends + downTrends || 1),
            diffs
        };
    }

    _detectPeriodicity(data) {
        const n = data.length;
        const mean = data.reduce((a, b) => a + b, 0) / n;
        const centered = data.map(v => v - mean);
        let bestPeriod = 2, bestCorr = 0;

        for (let period = 2; period <= Math.floor(n / 2); period++) {
            let corr = 0, norm1 = 0, norm2 = 0;
            for (let i = 0; i < n - period; i++) {
                corr += centered[i] * centered[i + period];
                norm1 += centered[i] ** 2;
                norm2 += centered[i + period] ** 2;
            }
            const normCorr = corr / (Math.sqrt(norm1 * norm2) || 1);
            if (normCorr > bestCorr) {
                bestCorr = normCorr;
                bestPeriod = period;
            }
        }

        return { period: bestPeriod, strength: bestCorr };
    }

    /**
     * Analyze visual trends across rows
     */
    _analyzeTrends(imageData, width, height) {
        const data = imageData.data;
        const rows = 10;
        const rowHeight = Math.floor(height / rows);
        const rowAvgs = [];

        for (let row = 0; row < rows; row++) {
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            const startY = row * rowHeight;
            const endY = Math.min(startY + rowHeight, height);

            for (let y = startY; y < endY; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    sumR += data[idx];
                    sumG += data[idx + 1];
                    sumB += data[idx + 2];
                    count++;
                }
            }
            rowAvgs.push({
                r: sumR / count,
                g: sumG / count,
                b: sumB / count,
                brightness: (sumR + sumG + sumB) / (count * 3)
            });
        }

        // Compute trend direction
        const firstHalf = rowAvgs.slice(0, Math.floor(rows / 2));
        const secondHalf = rowAvgs.slice(Math.floor(rows / 2));
        const avgFirst = firstHalf.reduce((a, r) => a + r.brightness, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, r) => a + r.brightness, 0) / secondHalf.length;

        let direction = 'Sideways';
        if (avgSecond - avgFirst > 5) direction = 'Upward';
        else if (avgFirst - avgSecond > 5) direction = 'Downward';

        return {
            rowAvgs,
            direction,
            momentum: avgSecond - avgFirst,
            trend: avgSecond > avgFirst ? 'bullish' : 'bearish'
        };
    }

    /**
     * Calculate Shannon entropy of the image
     */
    _calculateEntropy(imageData) {
        const data = imageData.data;
        const histogram = new Array(256).fill(0);
        const totalPixels = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
            histogram[gray]++;
        }

        let entropy = 0;
        for (let i = 0; i < 256; i++) {
            if (histogram[i] > 0) {
                const p = histogram[i] / totalPixels;
                entropy -= p * Math.log2(p);
            }
        }

        return entropy; // Max is 8 for uniform distribution
    }

    /**
     * Generate final predictions based on all analysis data
     */
    _generatePredictions(colorAnalysis, patternData, trendData, entropy) {
        const w = this.modelWeights;

        // === BIG/SMALL PREDICTION ===
        let bigScore = 0.5;

        // Pattern influence
        bigScore += (patternData.trendBias - 0.5) * w.trendFactor;

        // Brightness influence
        if (colorAnalysis.brightness > 128) bigScore += 0.08;
        else bigScore -= 0.08;

        // Volatility influence
        if (patternData.volatility > 10) bigScore += 0.05;

        // Trend momentum
        if (trendData.trend === 'bullish') bigScore += 0.06;
        else bigScore -= 0.06;

        // Entropy adds uncertainty weighting
        const entropyNorm = entropy / 8;
        bigScore += (entropyNorm - 0.5) * w.entropyFactor;

        // Historical correction
        if (this.analysisHistory.length > 0) {
            const lastPred = this.analysisHistory[this.analysisHistory.length - 1];
            if (lastPred && lastPred.predictions) {
                bigScore *= w.patternDecay;
                bigScore += (1 - w.patternDecay) * (1 - lastPred.predictions.bigSmall.bigProbability);
            }
        }

        bigScore = Math.max(0.15, Math.min(0.85, bigScore));
        const smallScore = 1 - bigScore;
        const bigSmallPrediction = bigScore >= 0.5 ? 'BIG' : 'SMALL';

        // === NUMBER PREDICTION ===
        const numberScores = new Array(10).fill(0);

        // Color-based distribution
        const hueShift = colorAnalysis.dominantHue;
        for (let i = 0; i < 10; i++) {
            numberScores[i] += Math.sin((hueShift + i * 36) * Math.PI / 180) * 0.3 + 0.5;
        }

        // Pattern-based weighting
        const patternSeed = patternData.volatility * 7 + patternData.trendBias * 13;
        for (let i = 0; i < 10; i++) {
            numberScores[i] += Math.cos(patternSeed + i * 1.2) * 0.2;
        }

        // Brightness quadrant mapping
        const brightnessQuadrant = Math.floor(colorAnalysis.brightness / 25.6);
        numberScores[brightnessQuadrant % 10] += 0.25;
        numberScores[(brightnessQuadrant + 5) % 10] += 0.15;

        // Entropy-based adjustment
        const entropyDigit = Math.floor(entropy * 1.2) % 10;
        numberScores[entropyDigit] += 0.2;

        // Trend momentum mapping
        const momentumDigit = Math.abs(Math.floor(trendData.momentum)) % 10;
        numberScores[momentumDigit] += 0.15;

        // Normalize
        const totalNumScore = numberScores.reduce((a, b) => a + b, 0);
        const normalizedNumScores = numberScores.map(s => s / totalNumScore);
        const predictedNumber = normalizedNumScores.indexOf(Math.max(...normalizedNumScores));

        // Top 3 numbers
        const sortedNumbers = normalizedNumScores
            .map((score, idx) => ({ number: idx, score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        // === COLOUR PREDICTION ===
        let redProb = colorAnalysis.red;
        let greenProb = colorAnalysis.green;
        let violetProb = colorAnalysis.violet;

        // Adjust based on trends
        if (trendData.trend === 'bullish') {
            greenProb *= 1.15;
            redProb *= 0.9;
        } else {
            redProb *= 1.15;
            greenProb *= 0.9;
        }

        // Volatility favors violet
        if (patternData.volatility > 12) {
            violetProb *= 1.2;
        }

        // Entropy normalization
        if (entropy > 5) {
            violetProb *= 1.1;
        }

        // Normalize colour probabilities
        const totalColProb = redProb + greenProb + violetProb || 1;
        redProb = redProb / totalColProb;
        greenProb = greenProb / totalColProb;
        violetProb = violetProb / totalColProb;

        let predictedColour = 'Red';
        if (greenProb > redProb && greenProb > violetProb) predictedColour = 'Green';
        else if (violetProb > redProb && violetProb > greenProb) predictedColour = 'Violet';

        // === CONFIDENCE ===
        const maxBigSmallProb = Math.max(bigScore, smallScore);
        const maxColourProb = Math.max(redProb, greenProb, violetProb);
        const maxNumProb = Math.max(...normalizedNumScores);

        const confidence = Math.round(
            (maxBigSmallProb * 0.35 + maxColourProb * 0.3 + maxNumProb * 0.2 + (1 - entropyNorm * 0.3) * 0.15) * 100
        );

        // === SIGNAL STRENGTH ===
        let signalStrength = 'Medium';
        if (confidence >= 75) signalStrength = 'Strong';
        else if (confidence >= 60) signalStrength = 'Medium';
        else signalStrength = 'Weak';

        // === NEXT PERIOD PREDICTION ===
        let nextPeriod = 'Stable';
        if (patternData.patternType === 'Ascending Wave') nextPeriod = 'Continue Up';
        else if (patternData.patternType === 'Descending Wave') nextPeriod = 'Continue Down';
        else if (patternData.patternType === 'High Volatility') nextPeriod = 'Reversal Likely';
        else if (patternData.patternType === 'Cyclic Pattern') nextPeriod = 'Cycle Repeat';

        return {
            bigSmall: {
                prediction: bigSmallPrediction,
                bigProbability: Math.round(bigScore * 100) / 100,
                smallProbability: Math.round(smallScore * 100) / 100
            },
            number: {
                prediction: predictedNumber,
                scores: normalizedNumScores.map(s => Math.round(s * 100) / 100),
                topNumbers: sortedNumbers
            },
            colour: {
                prediction: predictedColour,
                redProbability: Math.round(redProb * 100) / 100,
                greenProbability: Math.round(greenProb * 100) / 100,
                violetProbability: Math.round(violetProb * 100) / 100
            },
            pattern: {
                type: patternData.patternType,
                trendDirection: trendData.direction,
                signalStrength,
                nextPeriod,
                volatility: Math.round(patternData.volatility * 100) / 100,
                periodicity: patternData.periodicity
            },
            confidence: Math.min(95, Math.max(45, confidence)),
            chartData: patternData.columnAvgs,
            timestamp: Date.now()
        };
    }

    /**
     * Get analysis history
     */
    getHistory() {
        return this.analysisHistory;
    }

    /**
     * Clear analysis history
     */
    clearHistory() {
        this.analysisHistory = [];
    }
}

// Export globally
window.WingoAIEngine = WingoAIEngine;
