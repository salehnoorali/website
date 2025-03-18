// TradingView Widgets
function initTradingViewWidgets() {
    // Bitcoin/USDT Widget
    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": "BINANCE:BTCUSDT",
        "interval": "D",
        "timezone": "Asia/Tehran",
        "theme": "dark",
        "style": "1",
        "locale": "fa_IR",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_widget1"
    });

    // ETH/USDT Widget
    new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": "BINANCE:ETHUSDT",
        "interval": "D",
        "timezone": "Asia/Tehran",
        "theme": "dark",
        "style": "1",
        "locale": "fa_IR",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_widget2"
    });
}

// Authentication Modal Handling
function handleAuth() {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const closeBtns = document.querySelectorAll('.close-modal');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');

    // Show modals
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
        setTimeout(() => loginModal.classList.add('show'), 10);
    });

    signupBtn.addEventListener('click', () => {
        signupModal.style.display = 'block';
        setTimeout(() => signupModal.classList.add('show'), 10);
    });

    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.classList.remove('show');
            signupModal.classList.remove('show');
            setTimeout(() => {
                loginModal.style.display = 'none';
                signupModal.style.display = 'none';
            }, 300);
        });
    });

    // Switch between modals
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('show');
        setTimeout(() => {
            loginModal.style.display = 'none';
            signupModal.style.display = 'block';
            setTimeout(() => signupModal.classList.add('show'), 10);
        }, 300);
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.classList.remove('show');
        setTimeout(() => {
            signupModal.style.display = 'none';
            loginModal.style.display = 'block';
            setTimeout(() => loginModal.classList.add('show'), 10);
        }, 300);
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal || e.target === signupModal) {
            loginModal.classList.remove('show');
            signupModal.classList.remove('show');
            setTimeout(() => {
                loginModal.style.display = 'none';
                signupModal.style.display = 'none';
            }, 300);
        }
    });

    // Handle form submissions
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your login logic here
        console.log('Login submitted:', {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
        });
    });

    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your signup logic here
        console.log('Signup submitted:', {
            name: document.getElementById('signupName').value,
            email: document.getElementById('signupEmail').value,
            password: document.getElementById('signupPassword').value
        });
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = `
        <span class="menu-icon"></span>
        <span class="menu-icon"></span>
        <span class="menu-icon"></span>
    `;
    
    const nav = document.querySelector('.nav-container');
    nav.insertBefore(mobileMenuBtn, nav.firstChild);
    
    mobileMenuBtn.addEventListener('click', function() {
        const menu = document.querySelector('.nav-menu');
        menu.classList.toggle('show');
    });
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animation Observer
function initAnimationObserver() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initAnimationObserver();
    handleAuth();
    
    // Load TradingView script
    const tradingViewScript = document.createElement('script');
    tradingViewScript.src = 'https://s3.tradingview.com/tv.js';
    tradingViewScript.async = true;
    tradingViewScript.onload = function() {
        // Initialize widgets after script is loaded
        initTradingViewWidgets();
    };
    document.head.appendChild(tradingViewScript);
}); 