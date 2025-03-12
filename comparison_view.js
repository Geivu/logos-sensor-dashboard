// Theme handling
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

// Clock update
function updateClock() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Sample data structure for rooms
const rooms = ['1A', '1B', '1C', '2A', '2B'];
let roomData = {};

// Color palette for each class
const colorPalette = [
    'rgba(76, 175, 80, 0.8)',    // Green
    'rgba(33, 150, 243, 0.8)',   // Blue
    'rgba(255, 193, 7, 0.8)',    // Amber
    'rgba(156, 39, 176, 0.8)',   // Purple
    'rgba(244, 67, 54, 0.8)'     // Red
];

// Initialize room data with history for line graph
rooms.forEach(room => {
    // Start with a realistic baseline energy waste (0.3-0.6 kWh)
    const baselineWaste = 0.3 + (Math.random() * 0.3);
    
    roomData[room] = {
        energyWaste: baselineWaste,
        temperature: 22 + (Math.random() * 2 - 1), // 21-23°C
        lightLevel: 300 + (Math.random() * 200), // 300-500 lux
        occupancy: Math.random() > 0.3, // 70% chance of being occupied initially
        status: 'Unknown',
        history: Array(10).fill(0).map(() => baselineWaste * (0.9 + Math.random() * 0.2)) // Slight variations of baseline
    };
});

// Time labels for x-axis (last 10 time points)
const timeLabels = Array(10).fill(0).map((_, i) => `T-${9-i}`);
timeLabels[9] = 'Now'; // Last point is current time

// Chart initialization - TRUE LINE GRAPH with time on x-axis
const ctx = document.getElementById('comparison-chart').getContext('2d');
const comparisonChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: timeLabels,
        datasets: rooms.map((room, index) => ({
            label: `Room ${room}`,
            data: roomData[room].history,
            backgroundColor: colorPalette[index].replace('0.8', '0.2'),
            borderColor: colorPalette[index],
            borderWidth: 3,
            tension: 0.3,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6
        }))
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        scales: {
            y: {
                beginAtZero: false, // Don't start at zero since we'll always have some baseline usage
                title: {
                    display: true,
                    text: 'Energy Waste (kWh)'
                },
                // Dynamic max value will be set in updateUI
                suggestedMin: 0.2, // Minimum scale to show baseline energy usage
                suggestedMax: 3.5
            },
            x: {
                title: {
                    display: true,
                    text: 'Time'
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'Energy Waste Over Time'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `Room ${rooms[context.datasetIndex]}: ${context.parsed.y.toFixed(2)} kWh`;
                    }
                }
            },
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    usePointStyle: false
                }
            }
        }
    }
});

// Function to update room data
function updateRoomData(room, data) {
    // Update current values
    roomData[room] = { 
        ...roomData[room], 
        ...data,
        history: roomData[room].history // Preserve history
    };
    
    // Update history by shifting values and adding new one
    roomData[room].history.shift(); // Remove oldest value
    roomData[room].history.push(roomData[room].energyWaste); // Add newest value
    
    updateUI();
}

// Function to find the maximum value across all room histories
function findMaxEnergyWaste() {
    let maxValue = 0;
    
    rooms.forEach(room => {
        const roomMax = Math.max(...roomData[room].history);
        if (roomMax > maxValue) {
            maxValue = roomMax;
        }
    });
    
    // Add 20% padding to the max value to ensure lines don't touch the top
    return Math.max(maxValue * 1.2, 1.0); // Ensure minimum scale of 1.0 kWh
}

// Function to update the UI
function updateUI() {
    // Update chart with new history data
    rooms.forEach((room, index) => {
        comparisonChart.data.datasets[index].data = [...roomData[room].history];
    });
    
    // Dynamically adjust the y-axis max value based on the highest energy waste
    const maxEnergyWaste = findMaxEnergyWaste();
    comparisonChart.options.scales.y.max = maxEnergyWaste;
    
    comparisonChart.update();

    // Update quick stats
    const sortedRooms = [...rooms].sort((a, b) => roomData[a].energyWaste - roomData[b].energyWaste);
    const mostEfficient = sortedRooms[0];
    const mostWasteful = sortedRooms[sortedRooms.length - 1];
    
    document.getElementById('most-efficient-room').textContent = `Room ${mostEfficient}`;
    document.getElementById('most-efficient-value').textContent = `${roomData[mostEfficient].energyWaste.toFixed(2)} kWh`;
    
    document.getElementById('most-wasteful-room').textContent = `Room ${mostWasteful}`;
    document.getElementById('most-wasteful-value').textContent = `${roomData[mostWasteful].energyWaste.toFixed(2)} kWh`;
    
    const totalWaste = rooms.reduce((sum, room) => sum + roomData[room].energyWaste, 0);
    document.getElementById('total-waste-value').textContent = `${totalWaste.toFixed(2)} kWh`;

    // Update table
    const tableBody = document.getElementById('room-details-body');
    tableBody.innerHTML = '';
    
    rooms.forEach((room, index) => {
        const data = roomData[room];
        const row = document.createElement('tr');
        
        // Add color indicator matching the chart
        row.innerHTML = `
            <td>
                <span class="color-indicator" style="background-color: ${colorPalette[index]}"></span>
                Room ${room}
            </td>
            <td>${data.energyWaste.toFixed(2)} kWh</td>
            <td>${data.temperature.toFixed(1)}°C</td>
            <td>${data.lightLevel} Lux</td>
            <td>${data.occupancy ? 'Occupied' : 'Empty'}</td>
            <td><span class="status-badge ${getStatusClass(data.energyWaste)}">${data.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// Helper function to determine status class
function getStatusClass(energyWaste) {
    if (energyWaste < 1) return 'status-good';
    if (energyWaste < 2) return 'status-warning';
    return 'status-danger';
}

// Simulate real-time updates (for demonstration)
function simulateData() {
    rooms.forEach(room => {
        // Get the last value
        const lastValue = roomData[room].energyWaste || 0;
        
        // Determine if energy waste should increase or decrease
        // 60% chance of increase, 40% chance of decrease
        const shouldIncrease = Math.random() < 0.6;
        
        let newValue;
        
        if (shouldIncrease) {
            // Smaller increase: 0 to 0.1 kWh
            const increase = Math.random() * 0.1;
            newValue = lastValue + increase;
        } else {
            // Smaller decrease: 0 to 0.08 kWh
            const decrease = Math.random() * 0.08;
            // Ensure we don't go below the minimum baseline (0.3 kWh)
            newValue = Math.max(0.3, lastValue - decrease);
        }
        
        // Simulate occupancy affecting energy waste
        const isOccupied = Math.random() > 0.3; // 70% chance of being occupied
        
        // If room is vacant, higher chance of energy waste decreasing
        if (!isOccupied && Math.random() < 0.6) {
            // More moderate decrease when room is vacant
            const decrease = 0.05 + (Math.random() * 0.1);
            // Even vacant rooms have baseline energy usage (HVAC, standby equipment, etc.)
            newValue = Math.max(0.3, lastValue - decrease);
        }
        
        // Temperature fluctuations - more subtle
        const baseTemp = isOccupied ? 22 : 24; // Vacant rooms tend to be warmer
        const tempVariation = Math.random() * 1.5 - 0.75; // -0.75 to +0.75 degrees
        const newTemp = baseTemp + tempVariation;
        
        // Light levels - more subtle changes
        const baseLightLevel = isOccupied ? 500 : 100; // Lights dimmer when vacant
        const lightVariation = Math.random() * 100 - 25; // -25 to +75 lux
        const newLight = Math.max(0, Math.round(baseLightLevel + lightVariation));
        
        updateRoomData(room, {
            energyWaste: newValue,
            temperature: newTemp,
            lightLevel: newLight,
            occupancy: isOccupied,
            status: getStatus(newValue)
        });
    });
}

// Helper function to determine status text
function getStatus(energyWaste) {
    if (energyWaste < 1) return 'Efficient';
    if (energyWaste < 2) return 'Moderate';
    return 'Wasteful';
}

// Initial simulation - run multiple times to populate history
for (let i = 0; i < 10; i++) {
    simulateData();
}

// Update data every 5 seconds (for demonstration)
setInterval(simulateData, 5000);

// Add reset function for comparison_view.js
function resetEnergyWaste() {
    // Reset the chart data with realistic baseline values
    rooms.forEach((room) => {
        const baselineWaste = 0.3 + (Math.random() * 0.2);
        roomData[room].energyWaste = baselineWaste;
        roomData[room].history = Array(10).fill(0).map(() => baselineWaste * (0.9 + Math.random() * 0.2));
    });
    updateUI();
    
    // Also handle any comparison cards if they exist
    document.querySelectorAll('.comparison-card').forEach(card => {
        const className = card.getAttribute('data-class');
        if (!className) return;
        
        const wasteElement = card.querySelector('.energy-value');
        if (!wasteElement) return;
        
        const finalValue = parseFloat(wasteElement.textContent) || 0;
        console.log(`Class ${className} comparison energy waste: ${finalValue.toFixed(1)} kWh`);
        
        // Reset to a realistic baseline value
        const baselineWaste = 0.3 + (Math.random() * 0.2);
        if (typeof animateValue === 'function') {
            animateValue(wasteElement, finalValue, baselineWaste, 800);
        } else {
            wasteElement.textContent = baselineWaste.toFixed(2);
        }
    });
}

// Add reset button to comparison_view.html
const headerControls = document.querySelector('.header-controls');
const resetButton = document.createElement('button');
resetButton.className = 'reset-button';
resetButton.innerHTML = '<i class="fas fa-redo"></i> Reset Energy';
resetButton.addEventListener('click', resetEnergyWaste);
headerControls.appendChild(resetButton);

// Add CSS for color indicators in the table
const style = document.createElement('style');
style.textContent = `
    .color-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
    }
`;
document.head.appendChild(style); 