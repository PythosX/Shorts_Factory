let isLoggedIn = false;
let isSignUpMode = false;

const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const closeModal = document.getElementById('closeModal');
const generateBtn = document.getElementById('generateBtn');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authForm = document.getElementById('authForm');
const navAuthSection = document.getElementById('navAuthSection');
const youtubeUrlInput = document.getElementById('youtubeUrl');

function openModal(mode) {
    isSignUpMode = mode === 'signup';
    updateModalUI();
    authModal.classList.add('active');
}

function updateModalUI() {
    if (isSignUpMode) {
        document.getElementById('modalTitle').innerText = "Create Your Account";
        document.getElementById('modalSubtitle').innerText = "Start transforming your long-form content.";
        document.getElementById('submitAuthBtn').innerText = "Sign Up";
        document.getElementById('togglePrompt').innerText = "Already have an account?";
        toggleAuthMode.innerText = "Sign In";
    } else {
        document.getElementById('modalTitle').innerText = "Welcome Back";
        document.getElementById('modalSubtitle').innerText = "Sign in to manage your factory projects.";
        document.getElementById('submitAuthBtn').innerText = "Sign In";
        document.getElementById('togglePrompt').innerText = "New to the Factory?";
        toggleAuthMode.innerText = "Create an account";
    }
}

loginBtn.addEventListener('click', () => openModal('login'));
signupBtn.addEventListener('click', () => openModal('signup'));
closeModal.addEventListener('click', () => authModal.classList.remove('active'));

toggleAuthMode.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    updateModalUI();
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    isLoggedIn = true;
    authModal.classList.remove('active');
    navAuthSection.innerHTML = `
        <span style="color: #928f9c; font-size: 0.9rem; margin-right: 15px;">${email}</span>
        <button class="btn-primary" onclick="location.reload()">Logout</button>
    `;
});

generateBtn.addEventListener('click', async () => {
    if (!isLoggedIn) {
        openModal('login');
        return;
    }

    const videoUrl = youtubeUrlInput.value.trim();
    if (!videoUrl) {
        alert("Please paste a valid YouTube link first!");
        return;
    }

    generateBtn.innerText = "DOWNLOADING...";
    generateBtn.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ youtube_url: videoUrl })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Success!\nTitle: ${data.title}\nAI Suggested Hook: ${data.ai_suggested_hook}`);
        } else {
            alert(`Error from engine backend: ${data.detail}`);
        }
    } catch (err) {
        alert("Could not connect to Python backend server. Make sure main.py is running!");
    } finally {
        generateBtn.innerHTML = `<span>GENERATE SHORTS</span> ➔`;
        generateBtn.disabled = false;
    }
});
      
