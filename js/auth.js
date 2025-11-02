// --- Top of js/auth.js ---

// Initialize Supabase client
// I have used your actual keys from your Vercel screenshot to fix the error.
const SUPABASE_URL = 'https://lvjkrqkuzthpjrexdabw.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2amtycWt1enRocGpyZXhkYWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODk3NTgsImV4cCI6MjA3NzY2NTc1OH0.yCoYwNawqNiCQSPTSQuUTR566CLzCXJV7SaNcGyO9sc'; 

// CORRECT INITIALIZATION: The CDN makes 'supabase' a global variable.
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Get DOM Elements ---
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const messageEl = document.getElementById('auth-message');

// --- Event Listeners ---

// Login Button Click
loginBtn.addEventListener('click', async (e) => {
    e.preventDefault(); 
    messageEl.textContent = ''; 

    // Use the new 'supabaseClient' variable
    const { error } = await supabaseClient.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value,
    });

    if (error) {
        messageEl.textContent = `Error: ${error.message}`;
        messageEl.className = 'auth-message error';
    } else {
        messageEl.textContent = 'Login successful! Redirecting...';
        messageEl.className = 'auth-message success';
        setTimeout(() => {
            window.location.href = 'builder.html';
        }, 1000);
    }
});

// Sign Up Button Click
signupBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    messageEl.textContent = '';

    // Use the new 'supabaseClient' variable
    const { data, error } = await supabaseClient.auth.signUp({
        email: emailInput.value,
        password: passwordInput.value,
    });

    if (error) {
        messageEl.textContent = `Error: ${error.message}`;
        messageEl.className = 'auth-message error';
    } else {
        messageEl.textContent = 'Sign up successful! Please check your email for verification. Redirecting to builder...';
        messageEl.className = 'auth-message success';
        setTimeout(() => {
            window.location.href = 'builder.html';
        }, 1000);
    }
});