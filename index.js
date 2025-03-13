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

    // Class data storage with realistic baseline values
    const classData = {
        '1A': { 
            temp: 21.5, 
            light: 350, 
            occupied: true, 
            waste: 0.4
        },
        '1B': { 
            temp: 22.0, 
            light: 420, 
            occupied: true, 
            waste: 0.5
        },
        '2A': { 
            temp: 22.5, 
            light: 380, 
            occupied: false, 
            waste: 0.35
        },
        '2B': { 
            temp: 21.8, 
            light: 450, 
            occupied: true, 
            waste: 0.45
        },
        '3A': { 
            temp: 22.2, 
            light: 400, 
            occupied: false, 
            waste: 0.38
        }
    };
    
    // Get class from URL parameter if available
    let currentClass = '1A'; // Default class
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const classParam = urlParams.get('class');
    
    // If class parameter exists and is valid, use it
    if (classParam && classData[classParam]) {
        currentClass = classParam;
        console.log("Class set from URL parameter:", currentClass);
    }
    
    // Class selector functionality
    const classSelector = document.getElementById('class-selector');
    if (classSelector) {
        // Set the selector to match the current class
        classSelector.value = currentClass;
        
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
            // Decrease light (but not below 50 - some ambient light always present)
            data.light = Math.max(50, data.light - 50);
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
            data.waste += 0.2;
            console.log("Energy waste increased to:", data.waste);
            updateDisplay();
        } else if (key === 'q') {
            // Reset energy waste to baseline (0.3-0.5 kWh)
            data.waste = 0.3 + (Math.random() * 0.2);
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
        
        if (tempValueEl) tempValueEl.textContent = `${data.temp.toFixed(1)}°C`;
        
        // Determine AC status based on comparison with outside temperature
        let acStatus = 'Off';
        let acWasting = false;
        
        // AC is on if room is cooler than outside by more than 1°C (AC cooling)
        if (data.temp < outsideTemp - 1) {
            acStatus = 'On';
            
            // If room is vacant and AC is on, it's wasting energy
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
    
    // Initial display update
    updateClassTitle();
    updateDisplay();
    
    // Add reset button to header controls
    const headerControls = document.querySelector('.header-controls');
    if (headerControls && !document.querySelector('.reset-button')) {
        const resetButton = document.createElement('button');
        resetButton.className = 'reset-button';
        resetButton.innerHTML = '<i class="fas fa-redo"></i> Reset Energy';
        resetButton.addEventListener('click', function() {
            // Reset energy waste to baseline
            classData[currentClass].waste = 0.3 + (Math.random() * 0.2);
            updateDisplay();
        });
        headerControls.appendChild(resetButton);
    }
}); 