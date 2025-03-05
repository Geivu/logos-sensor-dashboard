// Global variables for data tracking
let energyWasteHistory = Array(24).fill(0);
let totalDailyWaste = 0;
let lastOccupancyTime = new Date();
let isOccupied = false;
let lightsOn = false;
let hvacRunning = false;
let currentTemp = 0;
let targetTemp = 0;

// Constants
const LIGHT_THRESHOLD = 500; // Lux threshold for lights on/off
const ENERGY_COST_PER_KWH = 0.15; // Cost in dollars per kWh
const HVAC_ENERGY_RATE = 1.5; // kWh per hour when running
const LIGHTS_ENERGY_RATE = 0.5; // kWh per hour when on

// Initialize the dashboard
function initDashboard() {
    updateTime();
    setInterval(updateTime, 1000);
    
    // Initial data generation
    updateTemperature();
    updateLightSensitivity();
    updateOccupancy();
    updateEnergyWaste();
    
    // Set up regular updates with faster intervals
    setInterval(updateTemperature, 2000);
    setInterval(updateLightSensitivity, 3000);
    setInterval(updateOccupancy, 4000);
    setInterval(updateEnergyWaste, 1500);
    
    // Initialize chart
    initEnergyChart();
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
    let currentWaste = 0;
    
    // If room is vacant but systems are running, calculate waste
    if (!isOccupied) {
        // Add HVAC waste if running
        if (hvacRunning) {
            currentWaste += Math.random() * 0.8 + 0.4; // 0.4-1.2 kWh waste from HVAC
        }
        
        // Add lighting waste if on
        if (lightsOn) {
            currentWaste += Math.random() * 0.3 + 0.2; // 0.2-0.5 kWh waste from lights
        }
    } else {
        // Even when occupied, there can be some inefficiency
        currentWaste = Math.random() * 0.2; // 0-0.2 kWh minor waste
    }
    
    // Accumulate daily waste (simplified simulation)
    if (!totalDailyWaste) {
        // Initialize with some previous waste
        totalDailyWaste = Math.random() * 10 + 5; // 5-15 kWh
    }
    
    // Add current waste to daily total
    totalDailyWaste += currentWaste;
    
    // Calculate cost (using $0.15 per kWh as average electricity cost)
    const costPerKwh = 0.15;
    const wasteCost = totalDailyWaste * costPerKwh;
    
    // Update display with one decimal place
    document.getElementById('current-waste').textContent = currentWaste.toFixed(1);
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
    updateEnergyChart(currentWaste);
}

// Initialize energy chart
function initEnergyChart() {
    const ctx = document.getElementById('energy-chart').getContext('2d');
    
    // Create initial empty data
    const initialData = Array(12).fill(0);
    
    window.energyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(12).fill(''),
            datasets: [{
                label: 'Energy Waste (kWh)',
                data: initialData,
                borderColor: '#3d7eaa',
                backgroundColor: 'rgba(61, 126, 170, 0.1)',
                borderWidth: 1,
                tension: 0.4,
                fill: true
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
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false,
                    min: 0,
                    max: 2 // Set max to accommodate typical waste values
                }
            },
            animation: {
                duration: 0
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        }
    });
}

// Update energy chart with new data
function updateEnergyChart(newValue) {
    // Add new value and remove oldest
    window.energyChart.data.datasets[0].data.push(newValue);
    window.energyChart.data.datasets[0].data.shift();
    
    // Adjust y-axis scale if needed
    const maxValue = Math.max(...window.energyChart.data.datasets[0].data) * 1.2;
    window.energyChart.options.scales.y.max = Math.max(maxValue, 1);
    
    // Update chart
    window.energyChart.update();
}

// Add a window resize handler to adjust the chart
window.addEventListener('resize', function() {
    // Destroy and recreate chart on resize
    if (window.energyChart) {
        window.energyChart.destroy();
        initEnergyChart();
    }
});

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initDashboard); 