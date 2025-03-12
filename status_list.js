// Update the function that updates sensor values in status_list.js
function updateSensorValues() {
    document.querySelectorAll('.class-row').forEach(row => {
        const className = row.getAttribute('data-class');
        if (!className) return;

        // Temperature - more realistic fluctuations
        const tempElement = row.querySelector('.temp-value');
        const oldTemp = parseFloat(tempElement.textContent) || 21.0;
        // Temperature can go up or down slightly
        const tempChange = (Math.random() * 0.4) - 0.2; // -0.2 to +0.2 degrees
        const newTemp = oldTemp + tempChange;
        tempElement.textContent = newTemp.toFixed(1);

        // Light - more realistic fluctuations
        const lightElement = row.querySelector('.light-value');
        const oldLight = parseFloat(lightElement.textContent) || 350;
        // Light can go up or down
        const lightChange = (Math.random() * 60) - 20; // -20 to +40 lux
        const newLight = Math.max(50, oldLight + lightChange); // Minimum 50 lux (ambient light)
        lightElement.textContent = Math.round(newLight);

        // Energy waste - realistic fluctuations
        const wasteElement = row.querySelector('.energy-value');
        const currentWaste = parseFloat(wasteElement.textContent) || 0.3;
        
        // Determine if energy waste should increase or decrease
        const shouldIncrease = Math.random() < 0.6; // 60% chance of increase
        
        let newWaste;
        if (shouldIncrease) {
            // Smaller increase: 0 to 0.1 kWh
            const increase = Math.random() * 0.1;
            newWaste = currentWaste + increase;
        } else {
            // Smaller decrease: 0 to 0.08 kWh
            const decrease = Math.random() * 0.08;
            // Ensure we don't go below the minimum baseline (0.3 kWh)
            newWaste = Math.max(0.3, currentWaste - decrease);
        }
        
        wasteElement.textContent = newWaste.toFixed(1);

        // Update status indicators based on new values
        updateStatusIndicators(row, newTemp, newLight, newWaste);
    });
}

// Add reset function for status_list.js
function resetEnergyWaste() {
    document.querySelectorAll('.class-row').forEach(row => {
        const className = row.getAttribute('data-class');
        if (!className) return;
        
        const wasteElement = row.querySelector('.energy-value');
        const finalValue = parseFloat(wasteElement.textContent) || 0;
        console.log(`Class ${className} daily energy waste: ${finalValue.toFixed(1)} kWh`);
        
        // Reset to a realistic baseline value (0.3-0.5 kWh)
        const baselineWaste = 0.3 + (Math.random() * 0.2);
        wasteElement.textContent = baselineWaste.toFixed(1);
        
        // Update status indicators
        const tempValue = parseFloat(row.querySelector('.temp-value').textContent);
        const lightValue = parseFloat(row.querySelector('.light-value').textContent);
        updateStatusIndicators(row, tempValue, lightValue, baselineWaste);
    });
}

// Add reset button to status_list.html
const headerControls = document.querySelector('.header-controls');
const resetButton = document.createElement('button');
resetButton.className = 'reset-button';
resetButton.innerHTML = '<i class="fas fa-redo"></i> Reset Energy';
resetButton.addEventListener('click', resetEnergyWaste);
headerControls.appendChild(resetButton); 