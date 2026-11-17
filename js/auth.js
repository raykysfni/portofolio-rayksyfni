import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let currentUser = null;
let isDashboardUnlocked = localStorage.getItem('admin_unlocked') === 'true';

export function hasAdminAccess() {
    return Boolean(currentUser && isDashboardUnlocked);
}

export function initAuth() {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateAdminVisibility();
        if (user) {
            const emailLabel = document.getElementById('admin-active-email');
            if (emailLabel) emailLabel.innerText = `Login aktif sebagai: ${user.email}`;
        } else {
            isDashboardUnlocked = false;
            localStorage.removeItem('admin_unlocked');
            if (window.location.hash === '#admin' && window.switchTab) {
                window.switchTab('home');
            }
        }
    });

    // Shortcut Keyboard Alt + Shift + A
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            window.openAdminTab();
        }
    });

    // Klik Logo RK 3x
    let logoClickCount = 0;
    let logoClickTimer = null;
    window.handleLogoClick = function(e) {
        e.preventDefault();
        logoClickCount++;
        clearTimeout(logoClickTimer);
        if (logoClickCount >= 3) {
            logoClickCount = 0;
            window.openAdminTab();
        } else {
            logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 1000);
        }
    };

    function updateAdminVisibility() {
        const adminBtn = document.getElementById('nav-admin');
        if (!adminBtn) return;
        if (currentUser) adminBtn.classList.remove('hidden');
        else adminBtn.classList.add('hidden');
    }

    window.openAdminTab = function() {
        updateAdminVisibility();
        if (currentUser && isDashboardUnlocked) {
            window.switchTab('admin');
        } else {
            showAuthModal();
        }
    };

    function showAuthModal() {
        const modal = document.getElementById('auth-modal');
        const formFull = document.getElementById('form-full-login');
        const formPin = document.getElementById('form-pin-login');
        const title = document.getElementById('auth-modal-title');
        const sub = document.getElementById('auth-modal-sub');

        modal.classList.remove('hidden');

        if (currentUser && !isDashboardUnlocked) {
            title.innerText = "Buka Kunci Layar Admin";
            sub.innerText = "Masukkan PIN 4-digit Anda untuk melanjutkan.";
            formFull.classList.add('hidden');
            formPin.classList.remove('hidden');
        } else {
            title.innerText = "Login Administrator";
            sub.innerText = "Masukkan Email & Password Firebase Admin.";
            formFull.classList.remove('hidden');
            formPin.classList.add('hidden');
        }
    }

    window.closeAdminAuth = function() {
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('full-login-error').classList.add('hidden');
        document.getElementById('pin-login-error').classList.add('hidden');
    };

    window.handleFullLogin = async function(e) {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const pass = document.getElementById('admin-pass').value;
        const errorMsg = document.getElementById('full-login-error');
        const loginBtn = document.getElementById('admin-login-btn');

        errorMsg.classList.add('hidden');
        loginBtn.disabled = true;
        loginBtn.innerText = "Memproses...";

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            isDashboardUnlocked = true;
            localStorage.setItem('admin_unlocked', 'true');
            window.closeAdminAuth();
            updateAdminVisibility();
            window.switchTab('admin');
        } catch (error) {
            errorMsg.innerText = "Email atau Password Salah!";
            errorMsg.classList.remove('hidden');
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerText = "Login Admin";
        }
    };

    window.handlePinUnlock = function(e) {
        e.preventDefault();
        const pin = document.getElementById('admin-pin').value;

        if (pin === '1234') {
            isDashboardUnlocked = true;
            localStorage.setItem('admin_unlocked', 'true');
            document.getElementById('admin-pin').value = '';
            window.closeAdminAuth();
            window.switchTab('admin');
        } else {
            document.getElementById('pin-login-error').classList.remove('hidden');
        }
    };

    window.lockAdminTab = function() {
        isDashboardUnlocked = false;
        localStorage.setItem('admin_unlocked', 'false');
        window.switchTab('home');
        alert("Dashboard Admin dikunci. Anda dapat membukanya kembali menggunakan PIN.");
    };

    window.logoutAdmin = async function() {
        try {
            await signOut(auth);
            isDashboardUnlocked = false;
            localStorage.removeItem('admin_unlocked');
            window.closeAdminAuth();
            updateAdminVisibility();
            window.switchTab('home');
            alert("Berhasil Log Out dari Admin Dashboard.");
        } catch (error) {
            alert("Gagal Log Out: " + error.message);
        }
    };
}