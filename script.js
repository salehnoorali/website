// TradingView Widgets
function initTradingViewWidgets() {
    new TradingView.widget({
        "autosize": true,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "D",
        "timezone": "Asia/Tehran",
        "theme": "dark",
        "style": "1",
        "locale": "fa_IR",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_widget",
        "height": "600"
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

    // Show modals with animation
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'flex';
            requestAnimationFrame(() => {
                loginModal.classList.add('show');
            });
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            signupModal.style.display = 'flex';
            requestAnimationFrame(() => {
                signupModal.classList.add('show');
            });
        });
    }

    // Close modals with animation
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    });

    // Switch between modals
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.remove('show');
            setTimeout(() => {
                loginModal.style.display = 'none';
                signupModal.style.display = 'flex';
                requestAnimationFrame(() => {
                    signupModal.classList.add('show');
                });
            }, 300);
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupModal.classList.remove('show');
            setTimeout(() => {
                signupModal.style.display = 'none';
                loginModal.style.display = 'flex';
                requestAnimationFrame(() => {
                    loginModal.classList.add('show');
                });
            }, 300);
        });
    }

    // Regular login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                const successMsg = document.createElement('div');
                successMsg.textContent = 'ورود موفقیت آمیز';
                successMsg.style.color = '#10b981';
                successMsg.style.marginBottom = '1rem';
                loginForm.insertBefore(successMsg, loginForm.firstChild);
                
                setTimeout(() => {
                    loginModal.classList.remove('show');
                    setTimeout(() => {
                        loginModal.style.display = 'none';
                        location.reload();
                    }, 300);
                }, 1000);
            } else {
                const errorMsg = document.createElement('div');
                errorMsg.textContent = 'ایمیل یا رمز عبور اشتباه است';
                errorMsg.style.color = '#ef4444';
                errorMsg.style.marginBottom = '1rem';
                loginForm.insertBefore(errorMsg, loginForm.firstChild);
                setTimeout(() => {
                    errorMsg.remove();
                }, 3000);
            }
        });
    }

    // Regular signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;

            if (!name || !email || !password) {
                const errorMsg = document.createElement('div');
                errorMsg.textContent = 'لطفا تمام فیلدها را پر کنید';
                errorMsg.style.color = '#ef4444';
                errorMsg.style.marginBottom = '1rem';
                signupForm.insertBefore(errorMsg, signupForm.firstChild);
                setTimeout(() => {
                    errorMsg.remove();
                }, 3000);
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.some(u => u.email === email)) {
                const errorMsg = document.createElement('div');
                errorMsg.textContent = 'این ایمیل قبلا ثبت شده است';
                errorMsg.style.color = '#ef4444';
                errorMsg.style.marginBottom = '1rem';
                signupForm.insertBefore(errorMsg, signupForm.firstChild);
                setTimeout(() => {
                    errorMsg.remove();
                }, 3000);
                return;
            }

            const newUser = { name, email, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            const successMsg = document.createElement('div');
            successMsg.textContent = 'ثبت نام با موفقیت انجام شد';
            successMsg.style.color = '#10b981';
            successMsg.style.marginBottom = '1rem';
            signupForm.insertBefore(successMsg, signupForm.firstChild);
            
            setTimeout(() => {
                signupModal.classList.remove('show');
                setTimeout(() => {
                    signupModal.style.display = 'none';
                    location.reload();
                }, 300);
            }, 1000);
        });
    }

    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        
        // Add logout button
        if (!document.querySelector('.logout-btn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'logout-btn';
            logoutBtn.textContent = 'خروج';
            logoutBtn.onclick = function() {
                localStorage.removeItem('currentUser');
                location.reload();
            };
            if (loginBtn) loginBtn.parentNode.appendChild(logoutBtn);
        }
    }
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

// Forum Comment Submission
const forumForm = document.querySelector('.forum-form');
const commentsContainer = document.getElementById('commentsContainer');

if (forumForm && commentsContainer) {
    // Initialize comments array
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    
    // Function to format date in Persian
    function formatDate(date) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleDateString('fa-IR', options);
    }

    // Function to get comment type in Persian
    function getCommentTypePersian(type) {
        const types = {
            'experience': 'تجربه معاملاتی',
            'question': 'سوال',
            'suggestion': 'پیشنهاد',
            'feedback': 'بازخورد'
        };
        return types[type] || type;
    }

    // Function to create comment HTML
    function createCommentElement(comment) {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-header">
                <div class="comment-user">
                    <img src="https://www.gravatar.com/avatar/${MD5(comment.userEmail)}?d=identicon" alt="avatar" class="user-avatar">
                    <div class="user-info">
                        <span class="user-name">${comment.userName}</span>
                        <span class="comment-type" data-type="${comment.type}">${getCommentTypePersian(comment.type)}</span>
                        <span class="comment-date">${formatDate(comment.date)}</span>
                    </div>
                </div>
            </div>
            <div class="comment-content">
                <h3 class="comment-title">${comment.title}</h3>
                <p>${comment.message}</p>
            </div>
            <div class="comment-actions">
                <button class="action-button like-button" data-comment-id="${comment.id}">
                    <span class="like-count">${comment.likes}</span>
                    <span>پسندیدم</span>
                </button>
            </div>
        `;

        // Add like functionality
        const likeButton = commentElement.querySelector('.like-button');
        likeButton.addEventListener('click', () => {
            if (currentUser) {
                comment.likes++;
                likeButton.querySelector('.like-count').textContent = comment.likes;
                localStorage.setItem('comments', JSON.stringify(comments));
            }
        });

        return commentElement;
    }

    // Display existing comments
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsContainer.appendChild(commentElement);
    });

    // Check login status and show/hide form accordingly
    function updateForumFormVisibility() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            forumForm.style.display = 'none';
            const loginMessage = document.createElement('div');
            loginMessage.className = 'login-message';
            loginMessage.textContent = 'برای ارسال نظر لطفا وارد شوید';
            if (!document.querySelector('.login-message')) {
                forumForm.parentNode.insertBefore(loginMessage, forumForm);
            }
        } else {
            forumForm.style.display = 'block';
            const loginMessage = document.querySelector('.login-message');
            if (loginMessage) {
                loginMessage.remove();
            }
        }
    }

    // Initial check
    updateForumFormVisibility();

    forumForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            updateForumFormVisibility();
            return;
        }

        const title = document.getElementById('commentTitle').value.trim();
        const type = document.getElementById('commentType').value;
        const message = document.getElementById('forumMessage').value.trim();

        if (!title || !type || !message) {
            const errorMsg = document.createElement('div');
            errorMsg.textContent = 'لطفا تمام فیلدها را پر کنید';
            errorMsg.style.color = '#ef4444';
            errorMsg.style.marginBottom = '1rem';
            errorMsg.style.textAlign = 'center';
            forumForm.insertBefore(errorMsg, forumForm.firstChild);
            setTimeout(() => errorMsg.remove(), 3000);
            return;
        }

        const newComment = {
            id: Date.now().toString(),
            userName: currentUser.name,
            userEmail: currentUser.email,
            title: title,
            type: type,
            message: message,
            date: new Date().toISOString(),
            likes: 0
        };

        // Add to localStorage
        comments.unshift(newComment); // Add to beginning of array
        localStorage.setItem('comments', JSON.stringify(comments));

        // Add to DOM at the beginning
        const commentElement = createCommentElement(newComment);
        commentsContainer.insertBefore(commentElement, commentsContainer.firstChild);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.textContent = 'نظر شما با موفقیت ثبت شد';
        successMsg.style.color = '#10b981';
        successMsg.style.marginBottom = '1rem';
        successMsg.style.textAlign = 'center';
        forumForm.insertBefore(successMsg, forumForm.firstChild);
        
        // Reset form and remove success message after delay
        forumForm.reset();
        setTimeout(() => successMsg.remove(), 3000);
    });

    // Listen for storage events to update form visibility
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentUser') {
            updateForumFormVisibility();
        }
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
        initTradingViewWidgets();
    };
    document.head.appendChild(tradingViewScript);
}); 