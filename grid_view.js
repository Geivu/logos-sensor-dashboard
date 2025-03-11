document.addEventListener('DOMContentLoaded', function() {
    const addClassBtn = document.querySelector('.add-class-btn');
    const gridView = document.querySelector('.grid-view');
    
    // Initialize charts for each class
    const classCharts = {};

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

    // Initialize charts for existing classes
    document.querySelectorAll('.class-card[data-class]').forEach(card => {
        const className = card.getAttribute('data-class');
        if (className) {
            initializeChartForClass(className);
        }
    });

    // Handle remove class button clicks
    function setupRemoveButton(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const className = this.getAttribute('data-class');
            if (confirm(`Are you sure you want to remove Class ${className}?`)) {
                const card = document.querySelector(`.class-card[data-class="${className}"]`);
                if (card) {
                    card.remove();
                }
                if (classCharts[className]) {
                    classCharts[className].destroy();
                    delete classCharts[className];
                }
            }
        });
    }

    // Add event listeners to all existing remove buttons
    document.querySelectorAll('.remove-class-btn').forEach(setupRemoveButton);

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
            if (document.querySelector('.modal-styles')) {
                document.querySelector('.modal-styles').remove();
            }
        });

        confirmBtn.addEventListener('click', () => {
            const className = input.value.toUpperCase();
            if (!/^[1-9][A-Z]$/.test(className)) {
                alert('Please enter a valid class name (e.g., 3A)');
                return;
            }

            // Check if class already exists
            if (document.querySelector(`.class-card[data-class="${className}"]`)) {
                alert('This class already exists!');
                return;
            }

            // Create new class card
            const newCard = createClassCard(className);
            const addClassCard = document.querySelector('.add-class-card');
            gridView.insertBefore(newCard, addClassCard);

            // Initialize chart for new class
            initializeChartForClass(className);

            // Close modal
            document.body.removeChild(modal);
            if (document.querySelector('.modal-styles')) {
                document.querySelector('.modal-styles').remove();
            }
        });

        // Focus input
        input.focus();
    });

    function createClassCard(className) {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.setAttribute('data-class', className);
        card.innerHTML = `
            <div class="class-header">
                <h2>Class ${className}</h2>
                <button class="remove-class-btn" data-class="${className}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="sensor-grid">
                <!-- Temperature -->
                <div class="sensor-item">
                    <div class="sensor-icon">
                        <i class="fas fa-snowflake"></i>
                    </div>
                    <div class="sensor-data">
                        <span class="sensor-label">Temperature</span>
                        <span class="sensor-value" id="current-temp-${className}">--</span>°C
                        <span class="status-badge" id="temp-status-${className}">Off</span>
                    </div>
                </div>
                <!-- Light -->
                <div class="sensor-item">
                    <div class="sensor-icon">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <div class="sensor-data">
                        <span class="sensor-label">Light Level</span>
                        <span class="sensor-value" id="light-value-${className}">--</span> Lux
                        <span class="status-badge" id="light-status-${className}">Off</span>
                    </div>
                </div>
                <!-- Presence -->
                <div class="sensor-item">
                    <div class="sensor-icon">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="sensor-data">
                        <span class="sensor-label">Presence</span>
                        <span class="sensor-value" id="occupancy-label-${className}">Checking...</span>
                        <span class="status-badge" id="occupancy-status-${className}">Unknown</span>
                    </div>
                </div>
                <!-- Energy -->
                <div class="sensor-item">
                    <div class="sensor-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div class="sensor-data">
                        <span class="sensor-label">Energy Waste</span>
                        <span class="sensor-value"><span id="current-waste-${className}">--</span> kWh</span>
                        <span class="status-badge" id="energy-status-${className}">Calculating</span>
                    </div>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="energy-chart-${className}"></canvas>
            </div>
        `;

        // Add remove button handler
        const removeBtn = card.querySelector('.remove-class-btn');
        setupRemoveButton(removeBtn);

        return card;
    }

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        themeIcon.classList.toggle('fa-moon');
        themeIcon.classList.toggle('fa-sun');
    });

    // Update current time
    function updateTime() {
        const currentTime = document.getElementById('current-time');
        currentTime.textContent = new Date().toLocaleTimeString();
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Simulate sensor data updates
    function generateRandomValue(min, max) {
        return (Math.random() * (max - min) + min).toFixed(1);
    }

    function updateSensorValues() {
        document.querySelectorAll('.class-card[data-class]').forEach(card => {
            const className = card.getAttribute('data-class');
            if (!className) return;

            // Temperature values (18-28°C range)
            const currentTemp = generateRandomValue(18, 28);
            const targetTemp = 21;
            const tempStatus = currentTemp < 21 ? 'On' : 'Off';
            
            document.getElementById(`current-temp-${className}`).textContent = currentTemp;
            document.getElementById(`temp-status-${className}`).textContent = tempStatus;
            document.getElementById(`temp-status-${className}`).className = `status-badge ${tempStatus.toLowerCase()}`;

            // Light values (0-1000 lux range)
            const lightValue = generateRandomValue(0, 1000);
            const lightStatus = lightValue > 500 ? 'On' : 'Off';
            
            document.getElementById(`light-value-${className}`).textContent = lightValue;
            document.getElementById(`light-status-${className}`).textContent = lightStatus;
            document.getElementById(`light-status-${className}`).className = `status-badge ${lightStatus.toLowerCase()}`;

            // Occupancy status (randomly occupied or vacant)
            const isOccupied = Math.random() > 0.3;
            const occupancyStatus = isOccupied ? 'Occupied' : 'Vacant';
            
            document.getElementById(`occupancy-status-${className}`).textContent = occupancyStatus;
            document.getElementById(`occupancy-status-${className}`).className = `status-badge ${occupancyStatus.toLowerCase()}`;
            document.getElementById(`occupancy-label-${className}`).textContent = isOccupied ? 'Active' : 'No Activity';

            // Energy values
            const currentWaste = generateRandomValue(0.1, 2.5);
            
            document.getElementById(`current-waste-${className}`).textContent = currentWaste;

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

            // Update chart
            if (classCharts[className]) {
                const chart = classCharts[className];
                const currentData = chart.data.datasets[0].data;
                currentData.push(parseFloat(currentWaste));
                currentData.shift();
                chart.update('none');
            }
        });
    }

    // Update values every 5 seconds
    setInterval(updateSensorValues, 5000);

    // Initial update
    updateSensorValues();
}); 