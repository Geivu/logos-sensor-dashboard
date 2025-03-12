// Global variables for data tracking
let energyWasteHistory = Array(24).fill(0);
let totalDailyWaste = 0;
let lastOccupancyTime = new Date();
let isOccupied = false;
let lightsOn = false;
let hvacRunning = false;
let currentTemp = 0;
let targetTemp = 0;

// Theme management
let isDarkTheme = true;

// Constants
const LIGHT_THRESHOLD = 500; // Lux threshold for lights on/off
const ENERGY_COST_PER_KWH = 0.15; // Cost in dollars per kWh
const HVAC_ENERGY_RATE = 1.5; // kWh per hour when running
const LIGHTS_ENERGY_RATE = 0.5; // kWh per hour when on

// Initialize the dashboard
function initDashboard() {
    // Initialize theme
    initTheme();
    
    updateTime();
    setInterval(updateTime, 1000);
    
    // Initial data generation
    updateTemperature();
    updateLightSensitivity();
    updateOccupancy();
    updateEnergyWaste();
    
    // Remove all auto-refresh intervals
    // setInterval(updateTemperature, 2000);
    // setInterval(updateLightSensitivity, 3000);
    // setInterval(updateOccupancy, 4000);
    // setInterval(updateEnergyWaste, 3000);
    
    // Initialize chart
    initEnergyChart();
    
    // Add manual update button
    addManualUpdateButton();
}

// Theme initialization and toggle
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Set initial theme
    document.body.classList.toggle('light-theme', !isDarkTheme);
    updateThemeIcon(themeIcon);
    
    // Add click handler
    themeToggle.addEventListener('click', () => {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('light-theme', !isDarkTheme);
        updateThemeIcon(themeIcon);
        
        // Send theme change to server
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            window.ws.send(JSON.stringify({
                type: 'theme',
                isDark: isDarkTheme
            }));
        }
        
        // Update chart colors if needed
        if (window.energyChart) {
            updateChartTheme();
        }
    });
}

function updateThemeIcon(icon) {
    icon.className = isDarkTheme ? 'fas fa-moon' : 'fas fa-sun';
}

function updateChartTheme() {
    if (!window.energyChart) return;
    
    const ctx = window.energyChart.ctx;
    const isLight = !isDarkTheme;
    
    // Update chart colors based on theme
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, isLight ? 'rgba(52, 152, 219, 0.3)' : 'rgba(61, 126, 170, 0.3)');
    gradient.addColorStop(1, isLight ? 'rgba(52, 152, 219, 0.05)' : 'rgba(61, 126, 170, 0.05)');
    
    window.energyChart.data.datasets[0].backgroundColor = gradient;
    window.energyChart.data.datasets[0].borderColor = isLight ? '#3498db' : '#3d7eaa';
    window.energyChart.data.datasets[0].pointBackgroundColor = isLight ? '#3498db' : '#3d7eaa';
    window.energyChart.data.datasets[0].pointBorderColor = isLight ? '#ffffff' : '#ffffff';
    window.energyChart.data.datasets[0].pointHoverBackgroundColor = isLight ? '#ffffff' : '#ffffff';
    window.energyChart.data.datasets[0].pointHoverBorderColor = isLight ? '#3498db' : '#3d7eaa';
    
    window.energyChart.update();
}

// Update current time display
function updateTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString();
}

// Update temperature and AC status
function updateTemperature() {
    // Generate random current temperature between 18-30°C
    currentTemp = parseFloat((Math.random() * 12 + 18).toFixed(1));
    
    // Target temperature stays more stable (21-25°C)
    if (!targetTemp) {
        targetTemp = parseFloat((Math.random() * 4 + 21).toFixed(1));
    } else {
        // Occasionally change target temp slightly
        if (Math.random() > 0.8) {
            targetTemp = parseFloat((targetTemp + (Math.random() * 0.6 - 0.3)).toFixed(1));
            targetTemp = Math.min(Math.max(targetTemp, 21), 25);
        }
    }
    
    // Update display
    document.getElementById('current-temp').textContent = currentTemp;
    document.getElementById('target-temp').textContent = targetTemp;
    
    // Update status indicators
    const tempStatus = document.getElementById('temp-status');
    const hvacIcon = document.getElementById('hvac-icon');
    const hvacLabel = document.getElementById('hvac-label');
    
    // Reset classes
    tempStatus.className = 'status-indicator';
    hvacIcon.className = 'hvac-icon';
    hvacIcon.innerHTML = '';
    
    // AC status logic: OFF if temperature >= 21°C, ON otherwise
    if (currentTemp >= 21) {
        // AC is OFF
        tempStatus.textContent = 'OFF';
        tempStatus.classList.add('status-off');
        hvacIcon.style.backgroundColor = 'var(--dark-neutral)';
        hvacIcon.innerHTML = '<i class="fas fa-power-off"></i>';
        hvacLabel.textContent = 'Standby';
        hvacRunning = false;
    } else {
        // AC is ON
        tempStatus.textContent = 'ON';
        tempStatus.classList.add('status-on');
        hvacIcon.style.backgroundColor = 'var(--dark-accent)';
        hvacIcon.innerHTML = '<i class="fas fa-snowflake"></i>';
        hvacLabel.textContent = 'Running';
        hvacRunning = true;
    }
}

// Generate random light sensitivity data and update display
function updateLightSensitivity() {
    // Generate random light level (0-1000 Lux)
    const lightLevel = Math.floor(Math.random() * 1000);
    
    // Update display
    document.getElementById('light-value').textContent = lightLevel;
    document.getElementById('light-meter-fill').style.width = `${lightLevel / 10}%`;
    
    // Update status indicators
    const lightStatus = document.getElementById('light-status');
    const lightIcon = document.getElementById('light-icon');
    
    // Reset classes
    lightStatus.className = 'status-indicator';
    lightIcon.className = 'light-icon';
    
    // Set new status based on light level
    if (lightLevel > LIGHT_THRESHOLD) {
        lightStatus.textContent = 'On';
        lightStatus.classList.add('status-on');
        lightIcon.style.backgroundColor = 'var(--warning-color)';
        lightIcon.innerHTML = '<i class="fas fa-lightbulb"></i>';
        lightsOn = true;
    } else {
        lightStatus.textContent = 'Off';
        lightStatus.classList.add('status-off');
        lightIcon.style.backgroundColor = 'var(--neutral-color)';
        lightIcon.innerHTML = '<i class="far fa-lightbulb"></i>';
        lightsOn = false;
    }
}

// Generate random occupancy data and update display
function updateOccupancy() {
    // 70% chance of occupancy changing
    if (Math.random() > 0.7) {
        isOccupied = !isOccupied;
        if (isOccupied) {
            lastOccupancyTime = new Date();
        }
    }
    
    // Update display
    const occupancyStatus = document.getElementById('occupancy-status');
    const occupancyIcon = document.getElementById('occupancy-icon');
    const occupancyLabel = document.getElementById('occupancy-label');
    const lastDetection = document.getElementById('last-detection');
    
    // Reset classes
    occupancyStatus.className = 'status-indicator';
    occupancyIcon.className = 'occupancy-icon';
    
    // Set new status based on occupancy
    if (isOccupied) {
        occupancyStatus.textContent = 'Occupied';
        occupancyStatus.classList.add('status-occupied');
        occupancyIcon.style.backgroundColor = 'var(--success-color)';
        occupancyIcon.innerHTML = '<i class="fas fa-user"></i>';
        occupancyLabel.textContent = 'Room Occupied';
        lastDetection.textContent = 'Now';
    } else {
        occupancyStatus.textContent = 'Vacant';
        occupancyStatus.classList.add('status-vacant');
        occupancyIcon.style.backgroundColor = 'var(--neutral-color)';
        occupancyIcon.innerHTML = '<i class="fas fa-user-slash"></i>';
        occupancyLabel.textContent = 'Room Vacant';
        
        // Calculate time since last detection
        const timeDiff = Math.floor((new Date() - lastOccupancyTime) / 60000);
        lastDetection.textContent = timeDiff === 0 ? 'Just now' : `${timeDiff} min ago`;
    }
}

// Update the energy waste calculation and display
function updateEnergyWaste() {
    // Calculate energy waste based on conditions
    let wasteIncrement = 0;
    
    // If room is vacant but systems are running, calculate waste
    if (!isOccupied) {
        // Add HVAC waste if running
        if (hvacRunning) {
            wasteIncrement += Math.random() * 0.8 + 0.4; // 0.4-1.2 kWh waste from HVAC
        }
        
        // Add lighting waste if on
        if (lightsOn) {
            wasteIncrement += Math.random() * 0.3 + 0.2; // 0.2-0.5 kWh waste from lights
        }
    } else {
        // Even when occupied, there can be some inefficiency
        wasteIncrement = Math.random() * 0.2; // 0-0.2 kWh minor waste
    }
    
    // Ensure we always have a positive increment (never decrease)
    wasteIncrement = Math.max(0.05, wasteIncrement);
    
    // Get current waste value
    const currentWasteElement = document.getElementById('current-waste');
    const currentWaste = parseFloat(currentWasteElement.textContent) || 0;
    
    // Always add to the current waste (never decrease)
    const newWaste = currentWaste + wasteIncrement;
    
    // Accumulate daily waste (simplified simulation)
    if (!totalDailyWaste) {
        // Initialize with some previous waste
        totalDailyWaste = Math.random() * 10 + 5; // 5-15 kWh
    }
    
    // Add current waste to daily total
    totalDailyWaste += wasteIncrement;
    
    // Calculate cost (using $0.15 per kWh as average electricity cost)
    const costPerKwh = 0.15;
    const wasteCost = totalDailyWaste * costPerKwh;
    
    // Update display with one decimal place
    currentWasteElement.textContent = newWaste.toFixed(1);
    document.getElementById('daily-waste').textContent = totalDailyWaste.toFixed(1);
    document.getElementById('waste-cost').textContent = wasteCost.toFixed(2);
    
    // Update status indicator
    const energyStatus = document.getElementById('energy-status');
    energyStatus.className = 'status-indicator';
    
    if (totalDailyWaste < 8) {
        energyStatus.textContent = 'Efficient';
        energyStatus.classList.add('good');
    } else if (totalDailyWaste < 15) {
        energyStatus.textContent = 'Moderate';
        energyStatus.classList.add('warning');
    } else {
        energyStatus.textContent = 'High Waste';
        energyStatus.classList.add('high');
    }
    
    // Update chart data
    updateEnergyChart(newWaste);
}

// Initialize energy chart
function initEnergyChart() {
    const ctx = document.getElementById('energy-chart').getContext('2d');
    
    // Create initial empty data
    const initialData = Array(4).fill(0); // Reduced points for better fit
    
    // Create gradient for the chart
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, 'rgba(61, 126, 170, 0.3)');
    gradient.addColorStop(1, 'rgba(61, 126, 170, 0.05)');
    
    window.energyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(4).fill('').map((_, i) => `${i + 1}h`),
            datasets: [{
                label: 'Energy Waste (kWh)',
                data: initialData,
                borderColor: '#3d7eaa',
                backgroundColor: gradient,
                borderWidth: 1.5,
                tension: 0.4,
                fill: true,
                pointRadius: 2,
                pointHoverRadius: 3,
                pointBackgroundColor: '#3d7eaa',
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3d7eaa',
                pointHoverBorderWidth: 1,
                cubicInterpolationMode: 'monotone'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 3,
                    displayColors: false,
                    cornerRadius: 2,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toFixed(1)} kWh`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#aaaaaa',
                        font: {
                            size: 7,
                            family: "'Segoe UI', sans-serif"
                        },
                        maxRotation: 0,
                        padding: 2
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.03)',
                        drawBorder: false,
                        tickLength: 0
                    },
                    ticks: {
                        color: '#aaaaaa',
                        font: {
                            size: 7,
                            family: "'Segoe UI', sans-serif"
                        },
                        maxTicksLimit: 2,
                        padding: 2,
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    }
                }
            },
            animation: {
                duration: 600,
                easing: 'easeOutQuart'
            },
            layout: {
                padding: {
                    left: 1,
                    right: 1,
                    top: 2,
                    bottom: 1
                }
            },
            elements: {
                line: {
                    borderCapStyle: 'round',
                    borderJoinStyle: 'round'
                },
                point: {
                    hitRadius: 4
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
}

// Track animation state
let isAnimating = false;
let pendingValue = null;

// Update energy chart with new data
function updateEnergyChart(newValue) {
    if (!window.energyChart) return;
    
    // If already animating, store the pending value
    if (isAnimating) {
        pendingValue = newValue;
        return;
    }
    
    const chart = window.energyChart;
    const currentData = chart.data.datasets[0].data;
    
    // Start animation
    isAnimating = true;
    
    // Add new value and remove oldest
    // Ensure the new value is greater than the last value in the array
    const lastValue = currentData[currentData.length - 1] || 0;
    const valueToAdd = Math.max(newValue, lastValue + 0.1); // Ensure it's always increasing
    
    currentData.push(valueToAdd);
    currentData.shift();
    
    // Update with animation
    chart.update({
        duration: 750,
        easing: 'easeOutQuart',
        onComplete: () => {
            isAnimating = false;
            
            // If there's a pending value, update with it
            if (pendingValue !== null) {
                const valueToUpdate = pendingValue;
                pendingValue = null;
                updateEnergyChart(valueToUpdate);
            }
        }
    });
}

// Add a window resize handler to adjust the chart
window.addEventListener('resize', function() {
    // Destroy and recreate chart on resize
    if (window.energyChart) {
        window.energyChart.destroy();
        initEnergyChart();
    }
});

// Add a manual update button
function addManualUpdateButton() {
    const headerControls = document.querySelector('.header-controls');
    if (!headerControls) return;
    
    const updateButton = document.createElement('button');
    updateButton.className = 'update-button';
    updateButton.innerHTML = '<i class="fas fa-sync"></i> Update Data';
    updateButton.addEventListener('click', function() {
        updateTemperature();
        updateLightSensitivity();
        updateOccupancy();
        updateEnergyWaste();
    });
    
    headerControls.appendChild(updateButton);
    
    // Add CSS for the button
    const style = document.createElement('style');
    style.textContent = `
    .update-button {
        background: none;
        border: none;
        color: var(--text-color, #fff);
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
    }
    
    .update-button:hover {
        background-color: var(--hover-color, rgba(255,255,255,0.1));
    }
    `;
    document.head.appendChild(style);
}

// Find the chart update function and modify it to ensure energy waste only increases
function updateChartData() {
    // Get current data
    const currentData = window.energyChart.data.datasets[0].data;
    
    // Create new data by adding small increments to existing values
    const newData = currentData.map(value => {
        // Add a small random increment (0.1 to 0.3)
        const increment = Math.random() * 0.2 + 0.1;
        return value + increment;
    });
    
    // Update chart with new data
    window.energyChart.data.datasets[0].data = newData;
    window.energyChart.update();
    
    // Update total energy waste display
    const totalWaste = newData.reduce((sum, value) => sum + value, 0).toFixed(1);
    document.getElementById('total-energy-waste').textContent = totalWaste;
    
    // Update status based on total
    updateEnergyStatus(totalWaste);
}

// Replace any random data generation with accumulating data
// Look for functions like this and modify them:
function generateRandomData() {
    // Instead of random data, get current data and increment it
    const currentData = window.energyChart.data.datasets[0].data;
    if (!currentData || currentData.length === 0) {
        // Initial data if none exists
        return [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
    }
    
    return currentData.map(value => {
        const increment = Math.random() * 0.2 + 0.1;
        return value + increment;
    });
}

// If there's a reset function, make sure it properly resets the chart
function resetChart() {
    // Reset to small initial values
    window.energyChart.data.datasets[0].data = [0.1, 0.2, 0.1, 0.3, 0.1, 0.2, 0.1];
    window.energyChart.update();
    
    // Update total display
    const totalWaste = window.energyChart.data.datasets[0].data.reduce((sum, value) => sum + value, 0).toFixed(1);
    document.getElementById('total-energy-waste').textContent = totalWaste;
    
    // Update status
    updateEnergyStatus(totalWaste);
}

// Make sure any existing reset button calls this function
document.querySelector('.reset-button')?.addEventListener('click', resetChart); 