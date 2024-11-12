function handleCredentialResponse(response) {
    // Decode the JWT token
    const responsePayload = decodeJwtResponse(response.credential);
    
    // Store user info in sessionStorage
    sessionStorage.setItem('userEmail', responsePayload.email);
    sessionStorage.setItem('userName', responsePayload.name);
    sessionStorage.setItem('userPicture', responsePayload.picture);
    
    // Redirect to locations page
    window.location.href = 'locations.html';
}

function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Check if user is logged in
function checkAuth() {
    if (!sessionStorage.getItem('userEmail')) {
        window.location.href = 'index.html';
    }
} 