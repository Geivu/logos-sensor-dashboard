// Class switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const classButtons = document.querySelectorAll('.class-btn:not(.add-class)');
    const classStatuses = document.querySelectorAll('.class-status');
    const classSelector = document.querySelector('.class-selector');
    const classSelectorWrapper = document.querySelector('.class-selector-wrapper');
    const statusList = document.querySelector('.status-list');
    const addClassBtn = document.getElementById('add-class-btn');

    // Function to handle remove button clicks
    function handleRemoveButtonClick() {
        const className = this.getAttribute('data-class');
        if (confirm(`Are you sure you want to remove Class ${className}?`)) {
            // Remove the class button from navigation
            const classBtn = document.querySelector(`.class-btn[data-class="${className}"]`);
            if (classBtn) {
                classBtn.remove();
            }

            // Remove the class status section
            const statusSection = document.querySelector(`.class-status[data-class="${className}"]`);
            if (statusSection) {
                statusSection.remove();
            }

            // Remove the chart from memory
            if (classCharts[className]) {
                classCharts[className].destroy();
                delete classCharts[className];
            }

            // If this was the active class, show the first remaining class
            if (statusSection.style.display === 'block') {
                const firstRemainingBtn = document.querySelector('.class-btn:not(.add-class)');
                if (firstRemainingBtn) {
                    firstRemainingBtn.click();
                }
            }
        }
    }

    // Add event listeners for all remove buttons (both original and new)
    document.querySelectorAll('.remove-class-btn').forEach(btn => {
        btn.addEventListener('click', handleRemoveButtonClick);
    });

    // Mouse wheel horizontal scrolling for class selector
    classSelectorWrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        classSelectorWrapper.scrollLeft += e.deltaY;
    });

    // Touch and mouse drag scrolling for class selector
    let isDown = false;
    let startX;
    let scrollLeft;
    let isDragging = false;

    // Mouse events
    classSelectorWrapper.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - classSelectorWrapper.offsetLeft;
        scrollLeft = classSelectorWrapper.scrollLeft;
    });

    classSelectorWrapper.addEventListener('mouseleave', () => {
        isDown = false;
    });

    classSelectorWrapper.addEventListener('mouseup', () => {
        isDown = false;
    });

    classSelectorWrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        isDragging = true;
        const x = e.pageX - classSelectorWrapper.offsetLeft;
        const walk = (x - startX);
        classSelectorWrapper.scrollLeft = scrollLeft - walk;
    });

    // Touch events
    classSelectorWrapper.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - classSelectorWrapper.offsetLeft;
        scrollLeft = classSelectorWrapper.scrollLeft;
    }, { passive: false });

    classSelectorWrapper.addEventListener('touchend', () => {
        isDown = false;
    });

    classSelectorWrapper.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        isDragging = true;
        const x = e.touches[0].pageX - classSelectorWrapper.offsetLeft;
        const walk = (x - startX);
        classSelectorWrapper.scrollLeft = scrollLeft - walk;
    }, { passive: false });

    // Handle class button clicks
    function handleClassButtonClick(e) {
        if (isDragging) {
            e.preventDefault();
            isDragging = false;
            return;
        }
        
        // Remove active class from ALL buttons, including newly added ones
        document.querySelectorAll('.class-btn:not(.add-class)').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Show corresponding status
        const classId = this.getAttribute('data-class');
        document.querySelectorAll('.class-status').forEach(status => {
            status.style.display = status.getAttribute('data-class') === classId ? 'block' : 'none';
        });
    }

    // Add click handlers to initial buttons
    classButtons.forEach(button => {
        button.addEventListener('click', handleClassButtonClick);
        button.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent double-tap zoom
            button.click();
        }, { passive: false });
    });

    // Add Class Button Functionality
    addClassBtn.addEventListener('click', () => {
        // Create modal for class input
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Add New Class</h2>
                <div class="input-group">
                    <label for="className">Class Name:</label>
                    <input type="text" id="className" placeholder="e.g., 3A" pattern="[1-9][A-Z]" maxlength="2">
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn cancel">Cancel</button>
                    <button class="modal-btn confirm">Add</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add modal styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: var(--dark-card-bg);
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                border: 1px solid var(--dark-border);
                width: 90%;
                max-width: 320px;
            }
            .modal h2 {
                margin: 0 0 20px 0;
                color: var(--dark-text);
                font-size: 1.2rem;
            }
            .input-group {
                margin-bottom: 20px;
            }
            .input-group label {
                display: block;
                margin-bottom: 8px;
                color: var(--dark-text);
            }
            .input-group input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid var(--dark-border);
                border-radius: 6px;
                background: var(--dark-bg);
                color: var(--dark-text);
                font-size: 1rem;
            }
            .modal-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            .modal-btn {
                padding: 8px 16px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s;
            }
            .modal-btn.cancel {
                background: var(--dark-neutral);
                color: white;
            }
            .modal-btn.confirm {
                background: var(--dark-success);
                color: white;
            }
            .modal-btn:hover {
                opacity: 0.9;
            }
        `;
        document.head.appendChild(style);

        // Handle modal buttons
        const cancelBtn = modal.querySelector('.cancel');
        const confirmBtn = modal.querySelector('.confirm');
        const input = modal.querySelector('#className');

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        confirmBtn.addEventListener('click', () => {
            const className = input.value.toUpperCase();
            if (!/^[1-9][A-Z]$/.test(className)) {
                alert('Please enter a valid class name (e.g., 3A)');
                return;
            }

            // Check if class already exists
            if (document.querySelector(`[data-class="${className}"]`)) {
                alert('This class already exists!');
                return;
            }

            // Create new class button
            const newClassBtn = document.createElement('button');
            newClassBtn.className = 'class-btn';
            newClassBtn.setAttribute('data-class', className);
            newClassBtn.textContent = `Class ${className}`;

            // Add click event to new button using the same handler
            newClassBtn.addEventListener('click', handleClassButtonClick);
            newClassBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                newClassBtn.click();
            }, { passive: false });

            // Insert new button before the add button
            addClassBtn.parentNode.insertBefore(newClassBtn, addClassBtn);

            // Create new class status section
            const newStatusSection = createClassStatusSection(className);
            statusList.appendChild(newStatusSection);

            // Initialize chart for new class
            initializeChartForClass(className);

            // Trigger click on new button to show it
            newClassBtn.click();

            // Close modal
            document.body.removeChild(modal);
        });

        // Focus input
        input.focus();
    });

    // Function to create new class status section
    function createClassStatusSection(className) {
        const section = document.createElement('div');
        section.className = 'class-status';
        section.setAttribute('data-class', className);
        section.innerHTML = `
            <!-- Air Conditioner Status -->
            <div class="status-card">
                <div class="status-header">
                    <div class="status-icon">
                        <i class="fas fa-snowflake"></i>
                    </div>
                    <div class="status-title">
                        <h2>Air Conditioner</h2>
                        <span class="status-badge" id="temp-status-${className}">Off</span>
                    </div>
                </div>
                <div class="status-details">
                    <div class="detail-row">
                        <span class="detail-label">Current Temperature</span>
                        <span class="detail-value" id="current-temp-${className}">--</span>°C
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Target Temperature</span>
                        <span class="detail-value" id="target-temp-${className}">--</span>°C
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value" id="hvac-label-${className}">Standby</span>
                    </div>
                </div>
            </div>

            <!-- Light Status -->
            <div class="status-card">
                <div class="status-header">
                    <div class="status-icon">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <div class="status-title">
                        <h2>Light</h2>
                        <span class="status-badge" id="light-status-${className}">Off</span>
                    </div>
                </div>
                <div class="status-details">
                    <div class="detail-row">
                        <span class="detail-label">Light Level</span>
                        <span class="detail-value" id="light-value-${className}">--</span> Lux
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value" id="light-status-text-${className}">Off</span>
                    </div>
                    <div class="light-meter">
                        <div class="meter-bar">
                            <div class="meter-fill" id="light-meter-fill-${className}"></div>
                        </div>
                        <div class="meter-labels">
                            <span>Dark</span>
                            <span>Bright</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Occupancy Status -->
            <div class="status-card">
                <div class="status-header">
                    <div class="status-icon">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="status-title">
                        <h2>Presence</h2>
                        <span class="status-badge" id="occupancy-status-${className}">Unknown</span>
                    </div>
                </div>
                <div class="status-details">
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value" id="occupancy-label-${className}">Checking...</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Last Detection</span>
                        <span class="detail-value" id="last-detection-${className}">--</span>
                    </div>
                </div>
            </div>

            <!-- Energy Status -->
            <div class="status-card">
                <div class="status-header">
                    <div class="status-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div class="status-title">
                        <h2>Energy</h2>
                        <span class="status-badge" id="energy-status-${className}">Calculating</span>
                    </div>
                </div>
                <div class="status-details">
                    <div class="detail-row">
                        <span class="detail-label">Current Waste</span>
                        <span class="detail-value"><span id="current-waste-${className}">--</span> kWh</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Daily Waste</span>
                        <span class="detail-value"><span id="daily-waste-${className}">--</span> kWh</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Cost</span>
                        <span class="detail-value">$<span id="waste-cost-${className}">--</span></span>
                    </div>
                    <div class="chart-container">
                        <canvas id="energy-chart-${className}"></canvas>
                    </div>
                </div>
            </div>

            <!-- Remove Class Button -->
            <div class="remove-class-container">
                <button class="remove-class-btn" data-class="${className}">
                    <i class="fas fa-trash"></i> Remove Class ${className}
                </button>
            </div>
        `;

        // Add click handler for remove button
        const removeBtn = section.querySelector('.remove-class-btn');
        removeBtn.addEventListener('click', handleRemoveButtonClick);

        return section;
    }

    // Function to initialize chart for new class
    function initializeChartForClass(className) {
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
    }

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
    // Get all current class IDs from the buttons
    const classes = Array.from(document.querySelectorAll('.class-btn:not(.add-class)'))
        .map(btn => btn.getAttribute('data-class'));
    
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