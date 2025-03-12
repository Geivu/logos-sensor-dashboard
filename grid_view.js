document.addEventListener('DOMContentLoaded', function() {
    // Basic functionality
    const addClassBtn = document.querySelector('.add-class-btn');
    
    // Handle remove class button clicks
    document.querySelectorAll('.remove-class-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const className = this.getAttribute('data-class');
            if (confirm(`Are you sure you want to remove Class ${className}?`)) {
                document.querySelector(`.class-card[data-class="${className}"]`).remove();
            }
        });
    });
    
    // Add Class Button Functionality
    addClassBtn.addEventListener('click', () => {
        const className = prompt("Enter class name (e.g., 3A):");
        if (className && /^[1-9][A-Z]$/.test(className)) {
            if (document.querySelector(`.class-card[data-class="${className}"]`)) {
                alert('This class already exists!');
                return;
            }
            
            // Create new class card
            const newCard = document.createElement('div');
            newCard.className = 'class-card';
            newCard.setAttribute('data-class', className);
            newCard.innerHTML = `
                <div class="class-header">
                    <h2>Class ${className}</h2>
                    <button class="remove-class-btn" data-class="${className}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="sensor-grid">
                    <!-- Energy - Now bigger -->
                    <div class="sensor-item energy-waste-item">
                        <div class="sensor-icon">
                            <i class="fas fa-bolt fa-2x"></i>
                        </div>
                        <div class="sensor-data">
                            <span class="sensor-label">Energy Waste</span>
                            <span class="sensor-value large-value"><span id="current-waste-${className}">0.0</span> kWh</span>
                            <span class="status-badge good" id="energy-status-${className}">Good</span>
                        </div>
                    </div>
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
                </div>
            `;
            
            // Add the new card
            const addClassCard = document.querySelector('.add-class-card');
            addClassCard.parentNode.insertBefore(newCard, addClassCard);
            
            // Add event listener to the new remove button
            newCard.querySelector('.remove-class-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm(`Are you sure you want to remove Class ${className}?`)) {
                    newCard.remove();
                }
            });
            
            // Add click event to navigate to single class view
            addClassCardClickHandler(newCard);
        } else if (className) {
            alert('Please enter a valid class name (e.g., 3A)');
        }
    });

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        themeToggle.querySelector('i').classList.toggle('fa-moon');
        themeToggle.querySelector('i').classList.toggle('fa-sun');
    });

    // Update current time
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('current-time').textContent = timeString;
    }
    
    // Call updateTime immediately and then every second
    updateTime();
    setInterval(updateTime, 1000);

    // Class data storage with realistic baseline values
    const classData = {
        '1A': { 
            temp: 21.5, 
            light: 350, 
            occupied: true, 
            waste: 0.4, 
            targetTemp: 22.0 
        },
        '1B': { 
            temp: 22.0, 
            light: 420, 
            occupied: true, 
            waste: 0.5, 
            targetTemp: 22.5 
        },
        '2A': { 
            temp: 22.5, 
            light: 380, 
            occupied: false, 
            waste: 0.35, 
            targetTemp: 22.0 
        },
        '2B': { 
            temp: 21.8, 
            light: 450, 
            occupied: true, 
            waste: 0.45, 
            targetTemp: 22.0 
        },
        '3A': { 
            temp: 22.2, 
            light: 400, 
            occupied: false, 
            waste: 0.38, 
            targetTemp: 22.0 
        }
    };

    // Outside temperature (global)
    let outsideTemp = 28.5; // Starting outside temperature (hot day)

    // Function to update the display for a specific class
    function updateDisplay(className) {
        if (!classData[className]) {
            // Initialize data for new classes with realistic baseline values
            classData[className] = {
                temp: 21.0 + (Math.random() * 2),  // 21-23°C
                light: 300 + (Math.random() * 200), // 300-500 lux
                occupied: Math.random() > 0.3,      // 70% chance of being occupied
                waste: 0.3 + (Math.random() * 0.2), // 0.3-0.5 kWh baseline
                targetTemp: 22.0
            };
        }
        
        const data = classData[className];
        
        // Update temperature
        const tempElement = document.getElementById(`current-temp-${className}`);
        const tempStatus = document.getElementById(`temp-status-${className}`);
        
        if (tempElement) tempElement.textContent = data.temp.toFixed(1);
        
        // Determine AC status
        let acStatus = 'Off';
        let acWasting = false;
        
        if (data.temp < outsideTemp - 1) {
            acStatus = 'On';
            
            // Check if AC is wasting energy
            if (data.temp < data.targetTemp - 0.5) {
                // Room is cooler than target (overcooling)
                acWasting = true;
            }
            
            // If room is vacant and AC is on, it's always wasting energy
            if (!data.occupied) {
                acWasting = true;
            }
        }
        
        // Update AC status
        if (tempStatus) {
            tempStatus.textContent = acStatus;
            tempStatus.className = `status-badge ${acStatus.toLowerCase()}`;
            
            if (acWasting) {
                tempStatus.className += ' wasting';
                
                // If AC is wasting energy, increase energy waste
                if (acStatus === 'On' && !data.occupied) {
                    // Increment waste more if room is vacant
                    data.waste += 0.05;
                }
            }
        }
        
        // Update light
        const lightElement = document.getElementById(`light-value-${className}`);
        const lightStatus = document.getElementById(`light-status-${className}`);
        
        if (lightElement) lightElement.textContent = Math.round(data.light);
        
        const lightState = data.light > 500 ? 'On' : 'Off';
        if (lightStatus) {
            lightStatus.textContent = lightState;
            lightStatus.className = `status-badge ${lightState.toLowerCase()}`;
            
            // If lights are on but room is vacant, it's wasting energy
            if (lightState === 'On' && !data.occupied) {
                lightStatus.className += ' wasting';
                
                // Increment waste if lights are on in vacant room
                data.waste += 0.02;
            }
        }
        
        // Update occupancy
        const occupancyLabel = document.getElementById(`occupancy-label-${className}`);
        const occupancyStatus = document.getElementById(`occupancy-status-${className}`);
        
        if (occupancyLabel) occupancyLabel.textContent = data.occupied ? 'Active' : 'No Activity';
        if (occupancyStatus) {
            const status = data.occupied ? 'Occupied' : 'Vacant';
            occupancyStatus.textContent = status;
            occupancyStatus.className = `status-badge ${status.toLowerCase()}`;
        }
        
        // Update energy waste
        const wasteElement = document.getElementById(`current-waste-${className}`);
        const energyStatus = document.getElementById(`energy-status-${className}`);
        
        if (wasteElement) wasteElement.textContent = data.waste.toFixed(1);
        
        // Update energy status
        if (energyStatus) {
            if (data.waste > 10) {
                energyStatus.textContent = 'High';
                energyStatus.className = 'status-badge high';
            } else if (data.waste > 5) {
                energyStatus.textContent = 'Warning';
                energyStatus.className = 'status-badge warning';
            } else {
                energyStatus.textContent = 'Good';
                energyStatus.className = 'status-badge good';
            }
        }
    }

    // Function to update all classes
    function updateAllDisplays() {
        document.querySelectorAll('.class-card').forEach(card => {
            const className = card.getAttribute('data-class');
            if (className) updateDisplay(className);
        });
    }

    // Function to simulate data changes
    function simulateData() {
        // Update outside temperature (slight random fluctuation)
        outsideTemp += (Math.random() * 0.4 - 0.2); // -0.2 to +0.2 degree change
        outsideTemp = Math.max(10, Math.min(40, outsideTemp)); // Keep between 10-40°C
        
        // Update each class's data
        Object.keys(classData).forEach(className => {
            const data = classData[className];
            
            // Randomly toggle occupancy (10% chance)
            if (Math.random() < 0.1) {
                data.occupied = !data.occupied;
            }
            
            // Temperature changes
            // If AC is on (room temp < outside temp), temperature slowly rises toward target
            if (data.temp < outsideTemp - 1) {
                // AC is on, temperature moves toward target
                if (data.temp < data.targetTemp) {
                    data.temp += Math.random() * 0.2; // Warming up to target
                } else {
                    data.temp -= Math.random() * 0.1; // Cooling slightly if above target
                }
            } else {
                // AC is off, temperature moves toward outside temperature
                if (data.temp < outsideTemp) {
                    data.temp += Math.random() * 0.3; // Warming up toward outside temp
                } else {
                    data.temp -= Math.random() * 0.1; // Cooling slightly if above outside
                }
            }
            
            // Light level changes
            if (data.occupied) {
                // If occupied, lights tend to be brighter
                if (data.light < 500) {
                    data.light += Math.random() * 50;
                } else if (Math.random() < 0.3) {
                    data.light -= Math.random() * 30; // Occasional small decrease
                }
            } else {
                // If vacant, lights tend to decrease
                if (data.light > 100) {
                    data.light -= Math.random() * 50;
                }
                // Ensure minimum ambient light level
                data.light = Math.max(50, data.light);
            }
            
            // Energy waste simulation with realistic fluctuations
            // Determine if energy waste should increase or decrease
            const shouldIncrease = Math.random() < 0.6; // 60% chance of increase
            
            if (shouldIncrease) {
                // Smaller increase: 0 to 0.1 kWh
                const increase = Math.random() * 0.1;
                data.waste += increase;
            } else {
                // Smaller decrease: 0 to 0.08 kWh
                const decrease = Math.random() * 0.08;
                // Ensure we don't go below the minimum baseline (0.3 kWh)
                data.waste = Math.max(0.3, data.waste - decrease);
            }
            
            // If room is vacant, higher chance of energy waste decreasing
            if (!data.occupied && Math.random() < 0.6) {
                // More moderate decrease when room is vacant
                const decrease = 0.05 + (Math.random() * 0.1);
                // Even vacant rooms have baseline energy usage (HVAC, standby equipment, etc.)
                data.waste = Math.max(0.3, data.waste - decrease);
            }
        });
        
        // Update displays
        updateAllDisplays();
    }

    // Initial update
    updateAllDisplays();
    
    // Simulate data changes every 5 seconds
    setInterval(simulateData, 5000);
    
    // Function to add click handler to class cards
    function addClassCardClickHandler(card) {
        card.addEventListener('click', function(e) {
            // Don't navigate if the click was on the remove button
            if (e.target.closest('.remove-class-btn')) {
                return;
            }
            
            const className = this.getAttribute('data-class');
            if (className) {
                window.location.href = `index.html?class=${className}`;
            }
        });
    }
    
    // Add click event to all existing class cards to navigate to single class view
    document.querySelectorAll('.class-card').forEach(card => {
        // Skip the add class card
        if (!card.classList.contains('add-class-card')) {
            addClassCardClickHandler(card);
        }
    });
    
    // Add reset button
    const headerControls = document.querySelector('.header-controls');
    const resetButton = document.createElement('button');
    resetButton.className = 'reset-button';
    resetButton.innerHTML = '<i class="fas fa-redo"></i> Reset Energy';
    resetButton.addEventListener('click', resetEnergyWaste);
    headerControls.appendChild(resetButton);
    
    // Function to reset energy waste
    function resetEnergyWaste() {
        Object.keys(classData).forEach(className => {
            // Reset to a realistic baseline value (0.3-0.5 kWh)
            classData[className].waste = 0.3 + (Math.random() * 0.2);
        });
        updateAllDisplays();
    }
    
    // Add keyboard controls for grid view
    document.addEventListener('keydown', function(event) {
        const key = event.key.toLowerCase();
        
        // Reset energy waste with 'r' key
        if (key === 'r') {
            resetEnergyWaste();
        }
    });
}); 