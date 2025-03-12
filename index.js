// Complete rewrite of index.js - remove all previous code
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
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
        console.log("Time updated:", timeString);
    }
    
    // Call updateTime immediately and then every second
    updateTime();
    setInterval(updateTime, 1000);

    // Outside temperature (global)
    let outsideTemp = 28.5; // Starting outside temperature (hot day)

    // Class data storage
    const classData = {
        '1A': { temp: 20.0, light: 100, occupied: false, waste: 0.1, targetTemp: 21.0 },
        '1B': { temp: 21.5, light: 150, occupied: true, waste: 0.2, targetTemp: 22.0 },
        '2A': { temp: 19.5, light: 200, occupied: false, waste: 0.3, targetTemp: 21.0 },
        '2B': { temp: 22.0, light: 250, occupied: true, waste: 0.4, targetTemp: 22.0 },
        '3A': { temp: 20.5, light: 300, occupied: false, waste: 0.5, targetTemp: 21.0 }
    };
    
    // Current class
    let currentClass = '1A';
    
    // Class selector functionality
    const classSelector = document.getElementById('class-selector');
    if (classSelector) {
        classSelector.addEventListener('change', function() {
            currentClass = this.value;
            updateClassTitle();
            updateDisplay();
            console.log("Class changed to:", currentClass);
        });
    } else {
        console.error("Class selector not found");
    }
    
    // Function to update class title
    function updateClassTitle() {
        const classNameElement = document.getElementById('class-name');
        const classCard = document.querySelector('.class-card');
        const pageTitle = document.querySelector('h1');
        
        if (classNameElement) classNameElement.textContent = currentClass;
        if (classCard) classCard.setAttribute('data-class', currentClass);
        if (pageTitle) pageTitle.textContent = `Class ${currentClass}`;
        
        console.log("Class title updated to:", currentClass);
    }
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Function to handle key presses
    function handleKeyPress(event) {
        const key = event.key.toLowerCase();
        console.log("Key pressed:", key);
        
        if (!classData[currentClass]) {
            console.error("Current class data not found:", currentClass);
            return;
        }
        
        const data = classData[currentClass];
        
        // Temperature controls
        if (key === 'w') {
            // Increase temperature
            data.temp += 0.5;
            console.log("Temperature increased to:", data.temp);
            updateDisplay();
        } else if (key === 's') {
            // Decrease temperature (but not below 18)
            data.temp = Math.max(18, data.temp - 0.5);
            console.log("Temperature decreased to:", data.temp);
            updateDisplay();
        }
        
        // Target temperature controls
        else if (key === 't') {
            // Increase target temperature
            data.targetTemp += 0.5;
            console.log("Target temperature increased to:", data.targetTemp);
            updateDisplay();
        } else if (key === 'g') {
            // Decrease target temperature (but not below 18)
            data.targetTemp = Math.max(18, data.targetTemp - 0.5);
            console.log("Target temperature decreased to:", data.targetTemp);
            updateDisplay();
        }
        
        // Outside temperature controls
        else if (key === 'p') {
            // Increase outside temperature
            outsideTemp += 0.5;
            console.log("Outside temperature increased to:", outsideTemp);
            updateDisplay();
        } else if (key === 'l') {
            // Decrease outside temperature
            outsideTemp = Math.max(0, outsideTemp - 0.5);
            console.log("Outside temperature decreased to:", outsideTemp);
            updateDisplay();
        }
        
        // Light controls
        else if (key === 'a') {
            // Decrease light (but not below 0)
            data.light = Math.max(0, data.light - 50);
            console.log("Light decreased to:", data.light);
            updateDisplay();
        } else if (key === 'd') {
            // Increase light
            data.light += 50;
            console.log("Light increased to:", data.light);
            updateDisplay();
        }
        
        // Occupancy toggle
        else if (key === 'o') {
            // Toggle occupancy
            data.occupied = !data.occupied;
            console.log("Occupancy toggled to:", data.occupied);
            updateDisplay();
        }
        
        // Energy waste controls
        else if (key === 'e') {
            // Increase energy waste
            data.waste += 0.5;
            console.log("Energy waste increased to:", data.waste);
            updateDisplay();
        } else if (key === 'q') {
            // Reset energy waste
            data.waste = 0.1;
            console.log("Energy waste reset to:", data.waste);
            updateDisplay();
        }
        
        // Change class
        else if (key === 'c') {
            // Cycle through classes
            const classes = Object.keys(classData);
            const currentIndex = classes.indexOf(currentClass);
            const nextIndex = (currentIndex + 1) % classes.length;
            currentClass = classes[nextIndex];
            console.log("Class cycled to:", currentClass);
            
            // Update selector and display
            if (classSelector) classSelector.value = currentClass;
            updateClassTitle();
            updateDisplay();
        }
    }
    
    // Function to update the display
    function updateDisplay() {
        console.log("Updating display for class:", currentClass);
        
        if (!classData[currentClass]) {
            console.error("Class data not found for:", currentClass);
            return;
        }
        
        const data = classData[currentClass];
        
        // Update outside temperature display
        const outsideTempEl = document.getElementById('outside-temp-value');
        if (outsideTempEl) {
            outsideTempEl.textContent = `${outsideTemp.toFixed(1)}°C`;
        }
        
        // Temperature
        const tempValueEl = document.getElementById('temp-value');
        const tempStatusEl = document.getElementById('temp-status');
        const targetTempEl = document.getElementById('target-temp-value');
        
        if (tempValueEl) tempValueEl.textContent = `${data.temp.toFixed(1)}°C`;
        if (targetTempEl) targetTempEl.textContent = `${data.targetTemp.toFixed(1)}°C`;
        
        // Determine AC status based on comparison with outside temperature and target temperature
        let acStatus = 'Off';
        let acWasting = false;
        
        // AC is on if:
        // 1. Room is cooler than outside by more than 1°C (AC cooling)
        // 2. Room temperature is below target temperature (overcooling)
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
        
        // Update AC status display
        if (tempStatusEl) {
            tempStatusEl.textContent = acStatus;
            tempStatusEl.className = `status-badge ${acStatus.toLowerCase()}`;
            
            // If AC is wasting energy, add a warning class
            if (acWasting) {
                tempStatusEl.className += ' wasting';
                
                // If AC is wasting energy, increase energy waste
                if (acStatus === 'On' && !data.occupied) {
                    // Increment waste more if room is vacant
                    data.waste += 0.05;
                }
            }
        }
        
        // Light
        const lightValueEl = document.getElementById('light-value');
        const lightStatusEl = document.getElementById('light-status');
        
        if (lightValueEl) lightValueEl.textContent = `${Math.round(data.light)} Lux`;
        
        const lightStatus = data.light > 500 ? 'On' : 'Off';
        if (lightStatusEl) {
            lightStatusEl.textContent = lightStatus;
            lightStatusEl.className = `status-badge ${lightStatus.toLowerCase()}`;
            
            // If lights are on but room is vacant, it's wasting energy
            if (lightStatus === 'On' && !data.occupied) {
                lightStatusEl.className += ' wasting';
                
                // Increment waste if lights are on in vacant room
                data.waste += 0.02;
            }
        }
        
        // Presence
        const presenceValueEl = document.getElementById('presence-value');
        const presenceStatusEl = document.getElementById('presence-status');
        
        const occupancyStatus = data.occupied ? 'Occupied' : 'Vacant';
        const occupancyLabel = data.occupied ? 'Active' : 'No Activity';
        
        if (presenceValueEl) presenceValueEl.textContent = occupancyLabel;
        if (presenceStatusEl) {
            presenceStatusEl.textContent = occupancyStatus;
            presenceStatusEl.className = `status-badge ${occupancyStatus.toLowerCase()}`;
        }
        
        // Energy waste
        const energyValueEl = document.getElementById('energy-value');
        const energyStatusEl = document.getElementById('energy-status');
        
        if (energyValueEl) energyValueEl.textContent = `${data.waste.toFixed(1)} kWh`;
        
        // Energy status
        if (energyStatusEl) {
            // Adjust thresholds based on accumulated waste
            if (data.waste > 10) {
                energyStatusEl.textContent = 'High';
                energyStatusEl.className = 'status-badge high';
            } else if (data.waste > 5) {
                energyStatusEl.textContent = 'Warning';
                energyStatusEl.className = 'status-badge warning';
            } else {
                energyStatusEl.textContent = 'Good';
                energyStatusEl.className = 'status-badge good';
            }
        }
        
        console.log("Display updated successfully");
    }
    
    // Add CSS for the controls and selector
    const style = document.createElement('style');
    style.textContent = `
        .keyboard-controls-info {
            max-width: 900px;
            margin: 20px auto;
            padding: 15px;
            background-color: var(--dark-card-bg, #2a2a2a);
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        body.light-theme .keyboard-controls-info {
            background-color: var(--light-card-bg, #f5f5f5);
        }
        
        .keyboard-controls-info h3 {
            margin-top: 0;
            color: var(--dark-text, #ffffff);
        }
        
        body.light-theme .keyboard-controls-info h3 {
            color: var(--light-text, #333333);
        }
        
        .keyboard-controls-info ul {
            padding-left: 20px;
            color: var(--dark-subtext, #cccccc);
        }
        
        body.light-theme .keyboard-controls-info ul {
            color: var(--light-subtext, #666666);
        }
        
        .keyboard-controls-info strong {
            color: var(--dark-accent, #4caf50);
            background-color: var(--dark-neutral, #333333);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }
        
        body.light-theme .keyboard-controls-info strong {
            color: var(--light-accent, #2e7d32);
            background-color: var(--light-neutral, #eeeeee);
        }
        
        .class-selector {
            background-color: var(--dark-card-bg, #2a2a2a);
            color: var(--dark-text, #ffffff);
            border: 1px solid var(--dark-border, #444444);
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        
        body.light-theme .class-selector {
            background-color: var(--light-card-bg, #f5f5f5);
            color: var(--light-text, #333333);
            border: 1px solid var(--light-border, #dddddd);
        }
        
        .single-class-view .class-card {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .status-badge.wasting {
            background-color: #ff9800;
            color: #000;
        }
        
        .temperature-display {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .temperature-item {
            display: flex;
            align-items: center;
        }
        
        .temperature-label {
            font-size: 0.8rem;
            color: var(--dark-subtext, #cccccc);
            margin-right: 5px;
        }
        
        body.light-theme .temperature-label {
            color: var(--light-subtext, #666666);
        }
        
        .sensor-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
        }
        
        .sensor-item {
            padding: 15px;
            border-radius: 8px;
            background-color: var(--dark-card-bg, #333);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            min-height: 120px;
        }
        
        body.light-theme .sensor-item {
            background-color: var(--light-card-bg, #f0f0f0);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .sensor-icon {
            font-size: 2rem;
            margin-right: 15px;
            color: var(--dark-accent, #4caf50);
            width: 50px;
            text-align: center;
        }
        
        body.light-theme .sensor-icon {
            color: var(--light-accent, #2e7d32);
        }
        
        .sensor-data {
            flex: 1;
        }
        
        .sensor-label {
            display: block;
            font-size: 1rem;
            color: var(--dark-subtext, #aaa);
            margin-bottom: 5px;
        }
        
        body.light-theme .sensor-label {
            color: var(--light-subtext, #666);
        }
        
        .sensor-value {
            display: block;
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--dark-text, #fff);
            margin-bottom: 8px;
        }
        
        body.light-theme .sensor-value {
            color: var(--light-text, #333);
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: bold;
        }
        
        .energy-waste-item {
            grid-column: 1 / -1;
            background-color: var(--dark-accent-bg, #2d4c2d);
        }
        
        body.light-theme .energy-waste-item {
            background-color: var(--light-accent-bg, #e8f5e9);
        }
        
        .class-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid var(--dark-border, #444);
            padding-bottom: 10px;
        }
        
        body.light-theme .class-header {
            border-bottom: 1px solid var(--light-border, #ddd);
        }
        
        .class-header h2 {
            font-size: 1.8rem;
            margin: 0;
        }
    `;
    document.head.appendChild(style);
    
    // Add outside temperature and target temperature to the temperature sensor item
    const tempSensorItem = document.querySelector('.sensor-item:nth-child(2)');
    if (tempSensorItem) {
        // Create temperature display container
        const tempDisplay = document.createElement('div');
        tempDisplay.className = 'temperature-display';
        
        // Create outside temperature element
        const outsideTempItem = document.createElement('div');
        outsideTempItem.className = 'temperature-item';
        outsideTempItem.innerHTML = `
            <span class="temperature-label">Outside:</span>
            <span id="outside-temp-value">${outsideTemp.toFixed(1)}°C</span>
        `;
        
        // Create target temperature element
        const targetTempItem = document.createElement('div');
        targetTempItem.className = 'temperature-item';
        targetTempItem.innerHTML = `
            <span class="temperature-label">Target:</span>
            <span id="target-temp-value">${classData[currentClass].targetTemp.toFixed(1)}°C</span>
        `;
        
        // Add elements to the display
        tempDisplay.appendChild(outsideTempItem);
        tempDisplay.appendChild(targetTempItem);
        
        // Insert before the status badge
        const sensorData = tempSensorItem.querySelector('.sensor-data');
        const statusBadge = tempSensorItem.querySelector('.status-badge');
        sensorData.insertBefore(tempDisplay, statusBadge);
    }
    
    // Update keyboard controls info to include new controls
    const controlsInfo = document.querySelector('.keyboard-controls-info ul');
    if (controlsInfo) {
        controlsInfo.innerHTML = `
            <li><strong>W/S</strong> - Increase/Decrease Room Temperature</li>
            <li><strong>T/G</strong> - Increase/Decrease Target Temperature</li>
            <li><strong>P/L</strong> - Increase/Decrease Outside Temperature</li>
            <li><strong>A/D</strong> - Decrease/Increase Light</li>
            <li><strong>O</strong> - Toggle Occupancy</li>
            <li><strong>E</strong> - Increase Energy Waste</li>
            <li><strong>Q</strong> - Reset Energy Waste</li>
            <li><strong>C</strong> - Change Class</li>
        `;
    }
    
    // Remove any existing buttons that might be added by old code
    document.querySelectorAll('.update-button, .reset-button').forEach(button => {
        button.remove();
    });
    
    // Initial setup
    updateClassTitle();
    updateDisplay();
    
    console.log("Initialization complete");
}); 