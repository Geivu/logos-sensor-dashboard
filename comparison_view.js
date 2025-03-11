// Theme handling
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

// Clock update
function updateClock() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Sample data structure for rooms
const rooms = ['1A', '1B', '1C', '2A', '2B'];
let roomData = {};

// Initialize room data
rooms.forEach(room => {
    roomData[room] = {
        energyWaste: 0,
        temperature: 0,
        lightLevel: 0,
        occupancy: false,
        status: 'Unknown'
    };
});

// Chart initialization
const ctx = document.getElementById('comparison-chart').getContext('2d');
const comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: rooms,
        datasets: [{
            label: 'Energy Waste (kWh)',
            data: rooms.map(room => roomData[room].energyWaste),
            backgroundColor: '#2196F3',
            borderColor: '#1976D2',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Energy Waste (kWh)'
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'Energy Waste by Room'
            }
        }
    }
});

// Function to update room data
function updateRoomData(room, data) {
    roomData[room] = { ...roomData[room], ...data };
    updateUI();
}

// Function to update the UI
function updateUI() {
    // Update chart
    comparisonChart.data.datasets[0].data = rooms.map(room => roomData[room].energyWaste);
    comparisonChart.update();

    // Update quick stats
    const sortedRooms = [...rooms].sort((a, b) => roomData[a].energyWaste - roomData[b].energyWaste);
    const mostEfficient = sortedRooms[0];
    const mostWasteful = sortedRooms[sortedRooms.length - 1];
    
    document.getElementById('most-efficient-room').textContent = `Room ${mostEfficient}`;
    document.getElementById('most-efficient-value').textContent = `${roomData[mostEfficient].energyWaste.toFixed(2)} kWh`;
    
    document.getElementById('most-wasteful-room').textContent = `Room ${mostWasteful}`;
    document.getElementById('most-wasteful-value').textContent = `${roomData[mostWasteful].energyWaste.toFixed(2)} kWh`;
    
    const totalWaste = rooms.reduce((sum, room) => sum + roomData[room].energyWaste, 0);
    document.getElementById('total-waste-value').textContent = `${totalWaste.toFixed(2)} kWh`;

    // Update table
    const tableBody = document.getElementById('room-details-body');
    tableBody.innerHTML = '';
    
    rooms.forEach(room => {
        const data = roomData[room];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Room ${room}</td>
            <td>${data.energyWaste.toFixed(2)} kWh</td>
            <td>${data.temperature.toFixed(1)}°C</td>
            <td>${data.lightLevel} Lux</td>
            <td>${data.occupancy ? 'Occupied' : 'Empty'}</td>
            <td><span class="status-badge ${getStatusClass(data.energyWaste)}">${data.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// Helper function to determine status class
function getStatusClass(energyWaste) {
    if (energyWaste < 1) return 'status-good';
    if (energyWaste < 2) return 'status-warning';
    return 'status-danger';
}

// Simulate real-time updates (for demonstration)
function simulateData() {
    rooms.forEach(room => {
        const randomWaste = Math.random() * 3;
        const randomTemp = 20 + Math.random() * 5;
        const randomLight = Math.floor(Math.random() * 1000);
        const randomOccupancy = Math.random() > 0.5;
        
        updateRoomData(room, {
            energyWaste: randomWaste,
            temperature: randomTemp,
            lightLevel: randomLight,
            occupancy: randomOccupancy,
            status: getStatus(randomWaste)
        });
    });
}

// Helper function to determine status text
function getStatus(energyWaste) {
    if (energyWaste < 1) return 'Efficient';
    if (energyWaste < 2) return 'Moderate';
    return 'Wasteful';
}

// Initial simulation
simulateData();

// Update data every 5 seconds (for demonstration)
setInterval(simulateData, 5000); 