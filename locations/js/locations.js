let map;
let userMarker;
let directionsService;
let directionsRenderer;
let currentMarkers = [];
let userPosition;

// Initialize Google Maps with your API key
function initMap() {
    // Your API key is already included in the script tag, so you don't need to add it here
    const defaultLocation = { lat: -1.2921, lng: 36.8219 }; // Nairobi coordinates

    // Create map
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultLocation,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ]
    });

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Center map on user's location
                map.setCenter(userLocation);
                
                // Add marker for user's location
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Your Location",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                    }
                });
            },
            () => {
                // Handle geolocation error
                console.log("Error: The Geolocation service failed.");
            }
        );
    }

    return map;
}

// Initialize map when window loads
window.onload = function() {
    const map = initMap();
    
    // Store map instance globally if needed
    window.googleMap = map;
};

// Setup event listeners
function setupEventListeners() {
    const locationButtons = document.querySelectorAll('.location-btn');
    const searchInput = document.getElementById('search');
    
    locationButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            locationButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            showLocations(e.target.dataset.type);
        });
    });
    
    searchInput.addEventListener('input', debounce(handleSearch, 300));
}

// Show locations based on type
function showLocations(type) {
    clearMarkers();
    let locations;
    
    switch(type) {
        case 'police':
            locations = policeStations;
            break;
        case 'courts':
            locations = courts;
            break;
        case 'firms':
            locations = legalFirms;
            break;
    }
    
    locations.forEach(location => {
        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.name
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div>
                    <h3>${location.name}</h3>
                    <p>${location.address}</p>
                    <button onclick="getDirections(${location.lat}, ${location.lng})">
                        Get Directions
                    </button>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        currentMarkers.push(marker);
    });
}

// Get directions from user location to selected location
function getDirections(destLat, destLng) {
    if (!userPosition) {
        alert("Please enable location services");
        return;
    }
    
    const destination = { lat: destLat, lng: destLng };
    
    directionsService.route(
        {
            origin: userPosition,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(response);
            } else {
                alert("Directions request failed due to " + status);
            }
        }
    );
}

// Handle search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    clearMarkers();
    
    const activeType = document.querySelector('.location-btn.active').dataset.type;
    let locations;
    
    switch(activeType) {
        case 'police':
            locations = policeStations;
            break;
        case 'courts':
            locations = courts;
            break;
        case 'firms':
            locations = legalFirms;
            break;
    }
    
    const filteredLocations = locations.filter(location => 
        location.name.toLowerCase().includes(searchTerm) ||
        location.address.toLowerCase().includes(searchTerm)
    );
    
    if (filteredLocations.length === 1) {
        getDirections(filteredLocations[0].lat, filteredLocations[0].lng);
    }
    
    showFilteredLocations(filteredLocations);
}

// Utility function to clear markers
function clearMarkers() {
    currentMarkers.forEach(marker => marker.setMap(null));
    currentMarkers = [];
    directionsRenderer.setDirections({ routes: [] });
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Sidebar Toggle
document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('active');
    document.querySelector('.main-content').classList.add('sidebar-active');
});

document.getElementById('closeSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('active');
    document.querySelector('.main-content').classList.remove('sidebar-active');
});

// Category Toggle
function toggleCategory(categoryId) {
    const content = document.getElementById(`${categoryId}-content`);
    content.classList.toggle('active');
}

// Example function to populate location items
function createLocationItem(location) {
    const template = document.getElementById('location-item-template');
    const clone = template.content.cloneNode(true);
    
    clone.querySelector('.location-name').textContent = location.name;
    clone.querySelector('.location-address').textContent = location.address;
    clone.querySelector('.location-phone').textContent = location.phone;
    clone.querySelector('.location-hours').textContent = location.hours;
    
    return clone;
}

// Sidebar and Overlay functionality
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const sidebarToggle = document.getElementById('sidebarToggle');
const closeSidebar = document.getElementById('closeSidebar');
const mainContent = document.querySelector('.main-content');

// Function to open sidebar
function openSidebar() {
    if (window.innerWidth <= 768) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

// Function to close sidebar
function closeSidebar() {
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Event Listeners
sidebarToggle.addEventListener('click', openSidebar);
closeSidebar.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// Close sidebar on window resize if in mobile view
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
});

// Handle escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSidebar();
    }
});

// Category toggle function
function toggleCategory(categoryId) {
    const content = document.getElementById(`${categoryId}-content`);
    const allContents = document.querySelectorAll('.category-content');
    
    // Close other categories
    allContents.forEach(item => {
        if (item.id !== `${categoryId}-content`) {
            item.classList.remove('active');
        }
    });
    
    // Toggle selected category
    content.classList.toggle('active');
}