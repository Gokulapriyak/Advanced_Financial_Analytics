// Sample financial data
const financialData = {
    prices: [100, 102, 101, 104, 106, 108, 107, 110, 112, 115], // example price data
    dates: ['2025-03-01', '2025-03-02', '2025-03-03', '2025-03-04', '2025-03-05', '2025-03-06', '2025-03-07', '2025-03-08', '2025-03-09', '2025-03-10']
};

// Moving Average Calculation
function movingAverage(data, period = 3) {
    let movingAvg = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            movingAvg.push(null);
        } else {
            let sum = 0;
            for (let j = i - period + 1; j <= i; j++) {
                sum += data[j];
            }
            movingAvg.push(sum / period);
        }
    }
    return movingAvg;
}

// Volatility Calculation (Standard deviation of returns)
function volatility(data) {
    let returns = [];
    for (let i = 1; i < data.length; i++) {
        returns.push((data[i] - data[i - 1]) / data[i - 1]);
    }

    let meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    let squaredDifferences = returns.map(r => Math.pow(r - meanReturn, 2));
    let variance = squaredDifferences.reduce((a, b) => a + b, 0) / squaredDifferences.length;
    return Math.sqrt(variance);
}

// RSI Calculation
function rsi(data, period = 14) {
    let gains = [];
    let losses = [];

    for (let i = 1; i < data.length; i++) {
        let change = data[i] - data[i - 1];
        if (change >= 0) {
            gains.push(change);
            losses.push(0);
        } else {
            losses.push(Math.abs(change));
            gains.push(0);
        }
    }

    const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    let rs = avgGain / avgLoss;
    let rsiValues = [100 - (100 / (1 + rs))];

    for (let i = period; i < data.length; i++) {
        let gain = gains[i] || 0;
        let loss = losses[i] || 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        rs = avgGain / avgLoss;
        rsiValues.push(100 - (100 / (1 + rs)));
    }

    return rsiValues;
}

// Update Dashboard Function
function updateDashboard() {
    const selectedMetrics = Array.from(document.getElementById('metrics').selectedOptions).map(option => option.value);
    const chartContainer = document.getElementById('chart-container');
    const analyticsOutput = document.getElementById('analytics-output');
    chartContainer.innerHTML = '';  // Clear previous chart

    // Update the analytics output
    analyticsOutput.innerHTML = '';

    // Create chart data
    const chartData = {
        labels: financialData.dates,
        datasets: [
            {
                label: 'Price Data',
                data: financialData.prices,
                borderColor: 'blue',
                fill: false
            }
        ]
    };

    // Add moving average to chart
    if (selectedMetrics.includes('movingAverage')) {
        const movingAvgData = movingAverage(financialData.prices);
        chartData.datasets.push({
            label: 'Moving Average',
            data: movingAvgData,
            borderColor: 'green',
            fill: false
        });
        const movingAvgValue = movingAvgData[movingAvgData.length - 1];
        analyticsOutput.innerHTML += `<div class="metric">Moving Average: <span>${movingAvgValue}</span></div>`;
    }

    // Add volatility to output
    if (selectedMetrics.includes('volatility')) {
        const vol = volatility(financialData.prices);
        analyticsOutput.innerHTML += `<div class="metric">Volatility: <span>${vol.toFixed(4)}</span></div>`;
    }

    // Add RSI to chart and output
    if (selectedMetrics.includes('rsi')) {
        const rsiData = rsi(financialData.prices);
        chartData.datasets.push({
            label: 'RSI',
            data: rsiData,
            borderColor: 'red',
            fill: false
        });
        const rsiValue = rsiData[rsiData.length - 1];
        analyticsOutput.innerHTML += `<div class="metric">RSI: <span>${rsiValue.toFixed(2)}</span></div>`;
    }

    // Render the chart
    const ctx = document.createElement('canvas');
    chartContainer.appendChild(ctx);
    new Chart(ctx, {
        type: 'line',
        data: chartData
    });
}

// Event Listener for the update button
document.getElementById('updateBtn').addEventListener('click', updateDashboard);

// Initialize the dashboard with default metrics
updateDashboard();
