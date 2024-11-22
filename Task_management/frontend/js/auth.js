// Check which page we're on
const isLoginPage = window.location.pathname.includes('login.html');
const isSignupPage = window.location.pathname.includes('signup.html');
const isHomePage = window.location.pathname.includes('home.html');
const welcome = document.getElementById("welcomeUser");
// DOM Elements - only select elements that exist on the current page
const loginError = isLoginPage ? document.getElementById('loginError') : null;
const signupError = isSignupPage ? document.getElementById('signupError') : null;
const welcomeUser = isHomePage ? document.getElementById('welcomeUser') : null;

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', checkAuth);

async function checkAuth() {
    const username = localStorage.getItem('username');
    
    // Redirect logic based on auth status and current page
    if (username) {
        // If user is logged in
        if (isLoginPage || isSignupPage) {
            window.location.href = 'home.html';
        } else if (isHomePage) {
            welcomeUser.textContent = `Welcome, ${username}`;
            loadDashboard();
            loadTasks();
        }
    } else {
        // If user is not logged in
        if (isHomePage) {
            window.location.href = 'login.html';
        }
    }
}

async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = '';
    if (!username || !password) {
        errorDiv.textContent = 'Enter both username and password';
        return;
    }
    welcome.textContent = "Welcome"+username;
    try {
        await apiService.auth.getCSRFToken(); // Get CSRF token first
        const response = await apiService.auth.login({ username, password });
        localStorage.setItem('username', response.data.username);
        window.location.href = 'home.html';
    } catch (error) {
        loginError.textContent = error.response?.data?.message || 'Login failed';
    }
}

async function handleSignup() {
    const firstName = document.getElementById('signupFirstName').value;
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    signupError.textContent = '';

    // Validation
    if (!username || !password || !confirmPassword || !firstName) {
        signupError.textContent = 'All fields are required';
        return;
    }

    if (password !== confirmPassword) {
        signupError.textContent = "Passwords don't match";
        return;
    }

    if (password.length < 8) {
        signupError.textContent = 'Password must be at least 8 characters long';
        return;
    }

    try {
        await apiService.auth.signup({
            username,
            password,
            confirm_password: confirmPassword,
            first_name: firstName
        });
        
        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
    } catch (error) {
        signupError.textContent = error.response?.data?.message || 'Signup failed';
    }
}

async function handleLogout() {
    try {
        await apiService.auth.logout();
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout failed:', error);
        // Even if logout fails on server, redirect to login
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}

// Helper function to check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('username') !== null;
}

// Helper function to get current username
function getCurrentUsername() {
    return localStorage.getItem('username');
}

// Export functions that might be needed by other modules
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.isAuthenticated = isAuthenticated;
window.getCurrentUsername = getCurrentUsername;

//python -m http.server 3000