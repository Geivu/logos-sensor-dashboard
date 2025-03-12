// Update the function that updates sensor values in status_list.js
function updateSensorValues() {
    document.querySelectorAll('.class-row').forEach(row => {
        const className = row.getAttribute('data-class');
        if (!className) return;

        // Temperature - always increasing
        const tempElement = row.querySelector('.temp-value');
        const oldTemp = parseFloat(tempElement.textContent) || 20.0;
        const tempIncrement = Math.random() * 0.3;
        const newTemp = oldTemp + tempIncrement;
        tempElement.textContent = newTemp.toFixed(1);

        // Light - always increasing
        const lightElement = row.querySelector('.light-value');
        const oldLight = parseFloat(lightElement.textContent) || 100;
        const lightIncrement = Math.random() * 50;
        const newLight = oldLight + lightIncrement;
        lightElement.textContent = Math.round(newLight);

        // Energy waste - always accumulating
        const wasteElement = row.querySelector('.energy-value');
        const currentWaste = parseFloat(wasteElement.textContent) || 0;
        const wasteIncrement = parseFloat((Math.random() * 0.25 + 0.05).toFixed(1));
        const newWaste = currentWaste + wasteIncrement;
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
        
        // Reset to a small starting value
        wasteElement.textContent = '0.1';
        
        // Update status indicators
        const tempValue = parseFloat(row.querySelector('.temp-value').textContent);
        const lightValue = parseFloat(row.querySelector('.light-value').textContent);
        updateStatusIndicators(row, tempValue, lightValue, 0.1);
    });
}

// Add reset button to status_list.html
const headerControls = document.querySelector('.header-controls');
const resetButton = document.createElement('button');
resetButton.className = 'reset-button';
resetButton.innerHTML = '<i class="fas fa-redo"></i> Reset Energy';
resetButton.addEventListener('click', resetEnergyWaste);
headerControls.appendChild(resetButton); 