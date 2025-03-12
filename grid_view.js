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
        document.getElementById('current-time').textContent = new Date().toLocaleTimeString();
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Generate random values
    function generateRandomValue(min, max) {
        return (Math.random() * (max - min) + min).toFixed(1);
    }

    // CRITICAL FUNCTION: Update all sensor values
    function updateAllSensors() {
        // Get all class cards
        const classCards = document.querySelectorAll('.class-card[data-class]');
        
        // Update each card
        classCards.forEach(card => {
            const className = card.getAttribute('data-class');
            
            // Temperature - always increasing or stable
            const tempElement = document.getElementById(`current-temp-${className}`);
            const oldTemp = parseFloat(tempElement.textContent) || 20.0;
            // Small random increase (0 to 0.3°C)
            const tempIncrement = Math.random() * 0.3;
            const newTemp = oldTemp + tempIncrement;
            
            // Highlight changing value
            tempElement.classList.add('value-changing');
            
            // Gradually update temperature
            smoothlyUpdateValue(tempElement, oldTemp, newTemp, '°C');
            
            // Update temperature status
            const tempStatus = newTemp < 21 ? 'On' : 'Off';
            const tempStatusEl = document.getElementById(`temp-status-${className}`);
            tempStatusEl.textContent = tempStatus;
            tempStatusEl.className = `status-badge ${tempStatus.toLowerCase()}`;
            
            // Light - always increasing or stable
            const lightElement = document.getElementById(`light-value-${className}`);
            const oldLight = parseFloat(lightElement.textContent) || 100;
            // Small random increase (0 to 50 lux)
            const lightIncrement = Math.random() * 50;
            const newLight = oldLight + lightIncrement;
            
            // Highlight changing value
            lightElement.classList.add('value-changing');
            
            // Gradually update light
            smoothlyUpdateValue(lightElement, oldLight, newLight, ' Lux', true);
            
            // Update light status
            const lightStatus = newLight > 500 ? 'On' : 'Off';
            const lightStatusEl = document.getElementById(`light-status-${className}`);
            lightStatusEl.textContent = lightStatus;
            lightStatusEl.className = `status-badge ${lightStatus.toLowerCase()}`;
            
            // Presence - smoother transition (this can toggle)
            const isOccupied = Math.random() > 0.3;
            const occupancyStatus = isOccupied ? 'Occupied' : 'Vacant';
            const occupancyLabel = isOccupied ? 'Active' : 'No Activity';
            
            setTimeout(() => {
                document.getElementById(`occupancy-label-${className}`).textContent = occupancyLabel;
                const occStatusEl = document.getElementById(`occupancy-status-${className}`);
                occStatusEl.textContent = occupancyStatus;
                occStatusEl.className = `status-badge ${occupancyStatus.toLowerCase()}`;
            }, Math.random() * 500); // Random delay for more natural updates
            
            // Energy - accumulating waste over time
            const wasteElement = document.getElementById(`current-waste-${className}`);
            const currentWaste = parseFloat(wasteElement.textContent) || 0;
            
            // Generate a small increment (0.05 to 0.3 kWh)
            const wasteIncrement = parseFloat(generateRandomValue(0.05, 0.3));
            const newWaste = currentWaste + wasteIncrement;
            
            // Highlight changing value
            wasteElement.classList.add('value-changing');
            
            // Gradually update waste (accumulating)
            smoothlyUpdateValue(wasteElement, currentWaste, newWaste, '');
            
            // Update energy status with delay
            setTimeout(() => {
                const energyStatusEl = document.getElementById(`energy-status-${className}`);
                
                // Adjust thresholds based on accumulated waste
                if (newWaste > 10) {
                    energyStatusEl.textContent = 'High';
                    energyStatusEl.className = 'status-badge high';
                } else if (newWaste > 5) {
                    energyStatusEl.textContent = 'Warning';
                    energyStatusEl.className = 'status-badge warning';
                } else {
                    energyStatusEl.textContent = 'Good';
                    energyStatusEl.className = 'status-badge good';
                }
            }, 300); // Slight delay for status update
        });
    }

    // Helper function to smoothly update numeric values
    function smoothlyUpdateValue(element, oldValue, newValue, unit, isInteger = false) {
        // If first time (oldValue is NaN or --)
        if (isNaN(oldValue) || element.textContent === '--') {
            element.textContent = isInteger ? Math.round(newValue) : newValue;
            setTimeout(() => element.classList.remove('value-changing'), 500);
            return;
        }
        
        const steps = 5; // Number of steps for the transition
        const stepDuration = 100; // Duration of each step in ms
        const valueChange = (newValue - oldValue) / steps;
        
        let currentStep = 0;
        
        const updateStep = () => {
            currentStep++;
            const currentValue = oldValue + (valueChange * currentStep);
            
            if (isInteger) {
                element.textContent = Math.round(currentValue);
            } else {
                element.textContent = currentValue.toFixed(1);
            }
            
            if (currentStep < steps) {
                setTimeout(updateStep, stepDuration);
            } else {
                // Final value and remove highlight
                element.textContent = isInteger ? Math.round(newValue) : newValue.toFixed(1);
                setTimeout(() => element.classList.remove('value-changing'), 200);
            }
        };
        
        // Start the transition
        updateStep();
    }

    // Run updates with a slightly longer interval for smoother experience
    updateAllSensors();
    setInterval(updateAllSensors, 5000); // Update every 5 seconds instead of 2

    // Add a reset function for daily energy waste
    function resetEnergyWaste() {
        document.querySelectorAll('.class-card[data-class]').forEach(card => {
            const className = card.getAttribute('data-class');
            const wasteElement = document.getElementById(`current-waste-${className}`);
            
            // Animate the reset
            wasteElement.classList.add('value-changing');
            
            // Store the final value before reset (for reporting)
            const finalValue = parseFloat(wasteElement.textContent) || 0;
            console.log(`Class ${className} daily energy waste: ${finalValue.toFixed(1)} kWh`);
            
            // Reset to a small starting value (not zero)
            smoothlyUpdateValue(wasteElement, finalValue, 0.1, '');
            
            // Reset status
            setTimeout(() => {
                const energyStatusEl = document.getElementById(`energy-status-${className}`);
                energyStatusEl.textContent = 'Good';
                energyStatusEl.className = 'status-badge good';
            }, 300);
        });
    }

    // Add a reset button to the header
    const headerControls = document.querySelector('.header-controls');
    const resetButton = document.createElement('button');
    resetButton.className = 'reset-button';
    resetButton.innerHTML = '<i class="fas fa-redo"></i> Reset Energy';
    resetButton.addEventListener('click', resetEnergyWaste);
    headerControls.appendChild(resetButton);

    // Optional: Auto-reset at midnight
    function checkForReset() {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            resetEnergyWaste();
        }
    }
    setInterval(checkForReset, 60000); // Check every minute
}); 