// Update the dashboard overview to ensure energy waste only increases
function updateDashboardValues() {
    // Get current total energy waste
    const totalEnergyElement = document.getElementById('total-energy-waste');
    const currentTotal = parseFloat(totalEnergyElement.textContent) || 0;
    
    // Add a small increment (0.1 to 0.5 kWh)
    const increment = parseFloat((Math.random() * 0.4 + 0.1).toFixed(1));
    const newTotal = currentTotal + increment;
    
    // Update with animation
    animateValue(totalEnergyElement, currentTotal, newTotal, 500);
    
    // Update status based on new total
    const energyStatus = document.getElementById('energy-status');
    if (newTotal > 20) {
        energyStatus.textContent = 'High';
        energyStatus.className = 'status high';
    } else if (newTotal > 10) {
        energyStatus.textContent = 'Warning';
        energyStatus.className = 'status warning';
    } else {
        energyStatus.textContent = 'Good';
        energyStatus.className = 'status good';
    }
    
    // Update other dashboard metrics similarly
    // ...
}

// Add reset function for index.js
function resetEnergyWaste() {
    const totalEnergyElement = document.getElementById('total-energy-waste');
    const finalValue = parseFloat(totalEnergyElement.textContent) || 0;
    console.log(`Total daily energy waste: ${finalValue.toFixed(1)} kWh`);
    
    // Reset to a small starting value with animation
    animateValue(totalEnergyElement, finalValue, 0.1, 800);
    
    // Reset status
    const energyStatus = document.getElementById('energy-status');
    energyStatus.textContent = 'Good';
    energyStatus.className = 'status good';
}

// Add reset button to index.html
const headerControls = document.querySelector('.header-controls');
const resetButton = document.createElement('button');
resetButton.className = 'reset-button';
resetButton.innerHTML = '<i class="fas fa-redo"></i> Reset Energy';
resetButton.addEventListener('click', resetEnergyWaste);
headerControls.appendChild(resetButton); 