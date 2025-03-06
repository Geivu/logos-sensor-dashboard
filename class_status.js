// Class switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const classButtons = document.querySelectorAll('.class-btn');
    const classStatuses = document.querySelectorAll('.class-status');
    const classSelector = document.querySelector('.class-selector');
    const classSelectorWrapper = document.querySelector('.class-selector-wrapper');
    const statusList = document.querySelector('.status-list');

    // Mouse wheel horizontal scrolling for class selector
    classSelector.addEventListener('wheel', (e) => {
        e.preventDefault();
        classSelector.scrollLeft += e.deltaY;
    });

    // Touch and mouse drag scrolling for class selector
    let isDown = false;
    let startX;
    let scrollLeft;
    let isDragging = false;

    // Mouse events
    classSelectorWrapper.addEventListener('mousedown', (e) => {
        isDown = true;
        classSelectorWrapper.style.cursor = 'grabbing';
        startX = e.pageX - classSelectorWrapper.offsetLeft;
        scrollLeft = classSelectorWrapper.scrollLeft;
    });

    classSelectorWrapper.addEventListener('mouseleave', () => {
        isDown = false;
        classSelectorWrapper.style.cursor = 'grab';
    });

    classSelectorWrapper.addEventListener('mouseup', () => {
        isDown = false;
        classSelectorWrapper.style.cursor = 'grab';
    });

    classSelectorWrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        isDragging = true;
        const x = e.pageX - classSelectorWrapper.offsetLeft;
        const walk = (x - startX) * 2;
        classSelectorWrapper.scrollLeft = scrollLeft - walk;
    });

    // Touch events
    classSelectorWrapper.addEventListener('touchstart', (e) => {
        isDown = true;
        classSelectorWrapper.style.cursor = 'grabbing';
        startX = e.touches[0].pageX - classSelectorWrapper.offsetLeft;
        scrollLeft = classSelectorWrapper.scrollLeft;
    }, { passive: false });

    classSelectorWrapper.addEventListener('touchend', () => {
        isDown = false;
        classSelectorWrapper.style.cursor = 'grab';
    });

    classSelectorWrapper.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        isDragging = true;
        const x = e.touches[0].pageX - classSelectorWrapper.offsetLeft;
        const walk = (x - startX) * 2;
        classSelectorWrapper.scrollLeft = scrollLeft - walk;
    }, { passive: false });

    // Handle class button clicks
    classButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (isDragging) {
                e.preventDefault();
                isDragging = false;
                return;
            }
            
            // Remove active class from all buttons
            classButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding status
            const classId = button.getAttribute('data-class');
            classStatuses.forEach(status => {
                status.style.display = status.getAttribute('data-class') === classId ? 'block' : 'none';
            });
        });

        // Add touch-specific handling
        button.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent double-tap zoom
            button.click();
        }, { passive: false });
    });

    // Initialize charts for each class
    classStatuses.forEach(status => {
        const chartContainer = status.querySelector('.chart-container');
        if (chartContainer) {
            const chart = new Chart(chartContainer, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    datasets: [{
                        data: [65, 59, 80, 81, 56],
                        backgroundColor: 'rgba(74, 144, 226, 0.5)',
                        borderColor: 'rgba(74, 144, 226, 0.8)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            display: false
                        },
                        x: {
                            display: false
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    });

    // Show first class by default
    if (classButtons.length > 0) {
        classButtons[0].click();
    }
});

// Initialize charts for each class
const classCharts = {};

function initClassCharts() {
    const classes = ['1A', '1B', '1C', '2A', '2B'];
    
    classes.forEach(className => {
        const ctx = document.getElementById(`energy-chart-${className}`).getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        gradient.addColorStop(0, 'rgba(61, 126, 170, 0.3)');
        gradient.addColorStop(1, 'rgba(61, 126, 170, 0.05)');
        
        classCharts[className] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(4).fill('').map((_, i) => `${i + 1}h`),
                datasets: [{
                    label: 'Energy Waste (kWh)',
                    data: Array(4).fill(0),
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
                }
            }
        });
    });
}

// Update chart data for a specific class
function updateClassChart(className, newValue) {
    if (!classCharts[className]) return;
    
    const chart = classCharts[className];
    const currentData = chart.data.datasets[0].data;
    
    currentData.push(newValue);
    currentData.shift();
    
    chart.update({
        duration: 750,
        easing: 'easeOutQuart'
    });
}

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', initClassCharts);

// Export functions for use in main script
window.updateClassChart = updateClassChart;

// Simulate realistic sensor data
function generateRandomValue(min, max) {
    return (Math.random() * (max - min) + min).toFixed(1);
}

function updateSensorValues() {
    const classes = ['1A', '1B', '1C', '2A', '2B'];
    
    classes.forEach(className => {
        // Temperature values (18-28°C range)
        const currentTemp = generateRandomValue(18, 28);
        const targetTemp = 21;
        const tempStatus = currentTemp < 21 ? 'On' : 'Off';
        
        document.getElementById(`current-temp-${className}`).textContent = currentTemp;
        document.getElementById(`target-temp-${className}`).textContent = targetTemp;
        document.getElementById(`temp-status-${className}`).textContent = tempStatus;
        document.getElementById(`temp-status-${className}`).className = `status-badge ${tempStatus === 'On' ? 'status-on' : 'status-off'}`;
        document.getElementById(`hvac-label-${className}`).textContent = tempStatus === 'On' ? 'Cooling' : 'Standby';

        // Light values (0-1000 lux range)
        const lightValue = generateRandomValue(0, 1000);
        const lightStatus = lightValue > 500 ? 'On' : 'Off';
        const lightPercentage = (lightValue / 1000) * 100;
        
        document.getElementById(`light-value-${className}`).textContent = lightValue;
        document.getElementById(`light-status-${className}`).textContent = lightStatus;
        document.getElementById(`light-status-${className}`).className = `status-badge ${lightStatus.toLowerCase()}`;
        document.getElementById(`light-status-text-${className}`).textContent = lightStatus;
        document.getElementById(`light-meter-fill-${className}`).style.width = `${lightPercentage}%`;

        // Occupancy status (randomly occupied or vacant)
        const isOccupied = Math.random() > 0.3; // 70% chance of being occupied
        const occupancyStatus = isOccupied ? 'Occupied' : 'Vacant';
        const lastDetection = new Date().toLocaleTimeString();
        
        document.getElementById(`occupancy-status-${className}`).textContent = occupancyStatus;
        document.getElementById(`occupancy-status-${className}`).className = `status-badge ${occupancyStatus.toLowerCase()}`;
        document.getElementById(`occupancy-label-${className}`).textContent = isOccupied ? 'Active' : 'No Activity';
        document.getElementById(`last-detection-${className}`).textContent = lastDetection;

        // Energy values
        const currentWaste = generateRandomValue(0.1, 2.5);
        const dailyWaste = (parseFloat(currentWaste) * 8).toFixed(1); // Assuming 8 hours of operation
        const wasteCost = (parseFloat(dailyWaste) * 0.15).toFixed(2); // Assuming $0.15 per kWh
        
        document.getElementById(`current-waste-${className}`).textContent = currentWaste;
        document.getElementById(`daily-waste-${className}`).textContent = dailyWaste;
        document.getElementById(`waste-cost-${className}`).textContent = wasteCost;

        // Update energy status badge
        const energyStatus = document.getElementById(`energy-status-${className}`);
        if (currentWaste > 2) {
            energyStatus.textContent = 'High';
            energyStatus.className = 'status-badge high';
        } else if (currentWaste > 1) {
            energyStatus.textContent = 'Warning';
            energyStatus.className = 'status-badge warning';
        } else {
            energyStatus.textContent = 'Good';
            energyStatus.className = 'status-badge good';
        }

        // Update energy chart
        updateClassChart(className, parseFloat(currentWaste));
    });
}

// Update values every 5 seconds
setInterval(updateSensorValues, 5000);

// Initial update
updateSensorValues(); 