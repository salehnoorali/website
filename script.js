// Message Display Function
function showMessage(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease forwards;
    `;
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#ef4444';
    }
    
    messageDiv.textContent = text;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// TradingView Widgets
function initTradingViewWidgets() {
    const tradingViewWidget = document.getElementById('tradingview_widget');
    if (!tradingViewWidget) return;

    new TradingView.widget({
        "autosize": false,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "D",
        "timezone": "Asia/Tehran",
        "theme": "dark",
        "style": "1",
        "locale": "fa_IR",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_widget",
        "height": 800
    });
}

// Check if TradingView script is already loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('tradingview_widget')) {
        if (typeof TradingView === 'undefined') {
            const tradingViewScript = document.createElement('script');
            tradingViewScript.src = 'https://s3.tradingview.com/tv.js';
            tradingViewScript.async = true;
            tradingViewScript.onload = function() {
                initTradingViewWidgets();
            };
            document.head.appendChild(tradingViewScript);
        } else {
            initTradingViewWidgets();
        }
    }
});

// Authentication and User Management
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    setupEventListeners();
});

// Initialize authentication
function initializeAuth() {
    // Check for remembered login
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        currentUser = JSON.parse(rememberedUser);
        updateAuthButtons();
    }
    
    // Check for current session
    const sessionUser = localStorage.getItem('currentUser');
    if (sessionUser) {
        currentUser = JSON.parse(sessionUser);
        updateAuthButtons();
    }
}

// Setup event listeners
function setupEventListeners() {
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const logoutBtn = document.querySelector('.logout-btn');
    
    loginBtn?.addEventListener('click', () => showModal('loginModal'));
    signupBtn?.addEventListener('click', () => showModal('signupModal'));
    logoutBtn?.addEventListener('click', handleLogout);
    
    // Setup form submissions
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('signupForm')?.addEventListener('submit', handleSignup);
    
    // Setup modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) hideModal(modal.id);
        });
    });
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        
        // Store user in session
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Handle remember me
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        hideModal('loginModal');
        updateAuthButtons();
        showMessage('خوش آمدید!', 'success');
        
        // Redirect admins and editors to dashboard
        if (user.role === 'admin' || user.role === 'editor') {
            window.location.href = 'dashboard.html';
        }
    } else {
        showMessage('ایمیل یا رمز عبور اشتباه است', 'error');
    }
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.email === email)) {
        showMessage('این ایمیل قبلا ثبت شده است', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: 'user'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    hideModal('signupModal');
    updateAuthButtons();
    showMessage('ثبت نام با موفقیت انجام شد', 'success');
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberedUser');
    updateAuthButtons();
    showMessage('success', 'با موفقیت خارج شدید');
    
    // Redirect to home if on dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
}

// Update auth buttons based on user state
function updateAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    if (currentUser) {
        authButtons.innerHTML = `
            <span class="user-name">خوش آمدید، ${currentUser.name}</span>
            ${currentUser.role === 'admin' || currentUser.role === 'editor' 
                ? '<a href="dashboard.html" class="dashboard-link">پنل مدیریت</a>' 
                : ''}
            <button class="logout-btn">خروج</button>
        `;
        
        // Reattach logout event listener
        document.querySelector('.logout-btn')?.addEventListener('click', handleLogout);
    } else {
        authButtons.innerHTML = `
            <button class="login-btn">ورود</button>
            <button class="signup-btn">ثبت نام</button>
        `;
        
        // Reattach modal event listeners
        document.querySelector('.login-btn')?.addEventListener('click', () => showModal('loginModal'));
        document.querySelector('.signup-btn')?.addEventListener('click', () => showModal('signupModal'));
    }
}

// Course Comments Management
function addCourseComment(courseId, comment) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) return false;
    
    if (!courses[courseIndex].comments) {
        courses[courseIndex].comments = [];
    }
    
    const newComment = {
        id: Date.now(),
        author: currentUser.name,
        authorId: currentUser.id,
        content: comment,
        date: new Date().toISOString(),
        likes: 0
    };
    
    courses[courseIndex].comments.push(newComment);
    localStorage.setItem('courses', JSON.stringify(courses));
    
    return true;
}

function displayCourseComments(courseId, container) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const course = courses.find(c => c.id === courseId);
    
    if (!course || !course.comments) return;
    
    const commentsHTML = course.comments.map(comment => `
        <div class="comment" data-comment-id="${comment.id}">
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${new Date(comment.date).toLocaleDateString('fa-IR')}</span>
            </div>
            <p class="comment-content">${comment.content}</p>
            <div class="comment-actions">
                <button class="like-button" onclick="likeCourseComment(${courseId}, ${comment.id})">
                    <span class="like-count">${comment.likes}</span>
                    پسندیدن
                </button>
                ${currentUser?.id === comment.authorId ? `
                    <button class="delete-button" onclick="deleteCourseComment(${courseId}, ${comment.id})">
                        حذف
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = commentsHTML;
}

function likeCourseComment(courseId, commentId) {
    if (!currentUser) {
        showMessage('برای پسندیدن نظر باید وارد شوید', 'error');
        return;
    }
    
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) return;
    
    const commentIndex = courses[courseIndex].comments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) return;
    
    courses[courseIndex].comments[commentIndex].likes++;
    localStorage.setItem('courses', JSON.stringify(courses));
    
    // Update display
    const likeCount = document.querySelector(`[data-comment-id="${commentId}"] .like-count`);
    if (likeCount) {
        likeCount.textContent = courses[courseIndex].comments[commentIndex].likes;
    }
}

function deleteCourseComment(courseId, commentId) {
    if (!currentUser) return;
    
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex === -1) return;
    
    const commentIndex = courses[courseIndex].comments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) return;
    
    // Verify ownership
    if (courses[courseIndex].comments[commentIndex].authorId !== currentUser.id) {
        showMessage('شما اجازه حذف این نظر را ندارید', 'error');
        return;
    }
    
    courses[courseIndex].comments.splice(commentIndex, 1);
    localStorage.setItem('courses', JSON.stringify(courses));
    
    // Remove from display
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (commentElement) {
        commentElement.remove();
    }
}

// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        modal.querySelector('input')?.focus();
    }, 10);
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
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
    // Initialize comments array from localStorage
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    
    // Display existing comments immediately
    displayComments();
    
    // Function to display comments
    function displayComments() {
        if (!commentsContainer) return;
        
        const commentsHTML = comments.map(comment => `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-user">
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
                    <button class="like-button" onclick="likeComment('${comment.id}')">
                        <span class="like-count">${comment.likes}</span>
                        <span>پسندیدم</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        commentsContainer.innerHTML = commentsHTML || '<p class="no-comments">هنوز نظری ثبت نشده است</p>';
    }

    // Function to format date in Persian
    function formatDate(date) {
        return new Date(date).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    // Handle form submission
    forumForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            showMessage('error', 'لطفا ابتدا وارد شوید');
            return;
        }

        const title = document.getElementById('commentTitle').value.trim();
        const type = document.getElementById('commentType').value;
        const message = document.getElementById('forumMessage').value.trim();

        if (!title || !type || !message) {
            showMessage('error', 'لطفا تمام فیلدها را پر کنید');
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

        // Add to beginning of array
        comments.unshift(newComment);
        
        // Save to localStorage
        localStorage.setItem('comments', JSON.stringify(comments));
        
        // Update display
        displayComments();
        
        // Reset form
        forumForm.reset();
        
        // Show success message
        showMessage('نظر شما با موفقیت ثبت شد');
    });

    // Like comment function
    window.likeComment = function(commentId) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            showMessage('error', 'برای پسندیدن نظر باید وارد شوید');
            return;
        }
        
        const commentIndex = comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
            comments[commentIndex].likes++;
            localStorage.setItem('comments', JSON.stringify(comments));
            displayComments();
        }
    };

    // Check login status and show/hide form
    function updateForumFormVisibility() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            forumForm.style.display = 'none';
            if (!document.querySelector('.login-message')) {
                const loginMessage = document.createElement('div');
                loginMessage.className = 'login-message';
                loginMessage.innerHTML = 'برای ارسال نظر لطفا <a href="#" onclick="showModal(\'loginModal\'); return false;">وارد شوید</a>';
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

    // Listen for storage events
    window.addEventListener('storage', function(e) {
        if (e.key === 'comments') {
            comments = JSON.parse(e.newValue || '[]');
            displayComments();
        } else if (e.key === 'currentUser') {
            updateForumFormVisibility();
        }
    });
}

// Initialize special users if they don't exist
function initializeSpecialUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if admin exists
    if (!users.find(u => u.role === 'admin')) {
        users.push({
            id: 'admin',
            email: 'admin@ehsaneliott.com',
            password: 'adminEhsan2024!',
            name: 'مدیر سایت',
            role: 'admin',
            avatar: 'assets/admin-avatar.png'
        });
    }
    
    // Check if editor exists
    if (!users.find(u => u.role === 'editor')) {
        users.push({
            id: 'editor',
            email: 'editor@ehsaneliott.com',
            password: 'editorEhsan2024!',
            name: 'ویرایشگر سایت',
            role: 'editor',
            avatar: 'assets/editor-avatar.png'
        });
    }
    
    localStorage.setItem('users', JSON.stringify(users));
}

// Call initializeSpecialUsers when the page loads
document.addEventListener('DOMContentLoaded', initializeSpecialUsers);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSpecialUsers();
    initMobileMenu();
    initSmoothScroll();
    initAnimationObserver();
    updateAuthButtons();
    
    // Handle Start Learning buttons
    const mainCtaButton = document.querySelector('.hero-section .cta-button');
    if (mainCtaButton) {
        mainCtaButton.addEventListener('click', () => {
            document.querySelector('#courses').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    }

    // Handle individual course buttons
    document.querySelectorAll('.course-btn').forEach(button => {
        button.addEventListener('click', function() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                // Show login modal if user is not logged in
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = 'flex';
                    requestAnimationFrame(() => {
                        loginModal.classList.add('show');
                    });
                }
            } else {
                // Get course title from the parent card
                const courseTitle = this.closest('.course-content').querySelector('h3').textContent;
                // Store selected course in localStorage
                localStorage.setItem('selectedCourse', courseTitle);
                // Redirect to course page (you'll need to create this)
                window.location.href = `/courses/${courseTitle.toLowerCase().replace(/\s+/g, '-')}.html`;
            }
        });
    });
    
    // Load TradingView script only if widget container exists
    const tradingViewWidget = document.getElementById('tradingview_widget');
    if (tradingViewWidget) {
        const tradingViewScript = document.createElement('script');
        tradingViewScript.src = 'https://s3.tradingview.com/tv.js';
        tradingViewScript.async = true;
        tradingViewScript.onload = function() {
            initTradingViewWidgets();
        };
        document.head.appendChild(tradingViewScript);
    }

    // Add this function to handle switching between modals
    setupModalSwitching();
});

// Forex Calendar Initialization
function initForexCalendar() {
    const calendarContainer = document.querySelector('.forex-calendar-container');
    const calendarFrame = document.querySelector('.forex-calendar');
    
    if (!calendarContainer || !calendarFrame) return;
    
    // Add a loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="spinner"></div>
        <p>در حال بارگذاری تقویم اقتصادی...</p>
    `;
    calendarContainer.appendChild(loadingIndicator);
    
    // Handle iframe load event
    calendarFrame.addEventListener('load', function() {
        loadingIndicator.style.display = 'none';
    });
    
    // Handle iframe error with fallback
    calendarFrame.addEventListener('error', function() {
        // If iframe fails, replace with a message
        calendarContainer.innerHTML = `
            <div class="calendar-fallback">
                <h3>تقویم اقتصادی فارکس</h3>
                <p>برای مشاهده آخرین اخبار و رویدادهای اقتصادی، لطفاً به وبسایت زیر مراجعه کنید:</p>
                <a href="https://www.forexfactory.com/calendar" target="_blank" class="forex-link">
                    Forex Factory Calendar
                </a>
                <div class="news-highlights">
                    <h4>رویدادهای مهم امروز</h4>
                    <ul id="todayEvents">
                        <li>در حال بارگذاری رویدادها...</li>
                    </ul>
                </div>
            </div>
        `;
        
        // You could add an API call here to fetch the latest events
        fetchLatestForexEvents();
    });
}

// Function to fetch the latest forex events (as a fallback)
function fetchLatestForexEvents() {
    const todayEventsList = document.getElementById('todayEvents');
    if (!todayEventsList) return;
    
    // In a real implementation, you would fetch data from an API
    // For now, we'll just show some placeholder events
    const events = [
        { time: '14:30', currency: 'USD', event: 'شاخص قیمت تولیدکننده (PPI)', impact: 'high' },
        { time: '16:00', currency: 'EUR', event: 'سخنرانی رئیس بانک مرکزی اروپا', impact: 'medium' },
        { time: '18:30', currency: 'USD', event: 'ذخایر نفت خام', impact: 'medium' },
        { time: '20:00', currency: 'USD', event: 'نرخ بهره فدرال رزرو', impact: 'high' }
    ];
    
    todayEventsList.innerHTML = events.map(event => `
        <li class="event-item impact-${event.impact}">
            <span class="event-time">${event.time}</span>
            <span class="event-currency">${event.currency}</span>
            <span class="event-name">${event.event}</span>
        </li>
    `).join('');
}

// Call forex calendar initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initTradingViewWidget();
    initForexCalendar();
});

// Add this function to handle switching between modals
function setupModalSwitching() {
    const showLoginLink = document.getElementById('showLogin');
    const showSignupLink = document.getElementById('showSignup');
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            const signupModal = document.getElementById('signupModal');
            if (signupModal) {
                signupModal.classList.remove('show');
                setTimeout(() => {
                    signupModal.style.display = 'none';
                    
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) {
                        loginModal.style.display = 'flex';
                        setTimeout(() => {
                            loginModal.classList.add('show');
                        }, 10);
                    }
                }, 300);
            }
        });
    }
    
    if (showSignupLink) {
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.remove('show');
                setTimeout(() => {
                    loginModal.style.display = 'none';
                    
                    const signupModal = document.getElementById('signupModal');
                    if (signupModal) {
                        signupModal.style.display = 'flex';
                        setTimeout(() => {
                            signupModal.classList.add('show');
                        }, 10);
                    }
                }, 300);
            }
        });
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const modals = [loginModal, signupModal];
    
    modals.forEach(modal => {
        if (modal && modal.style.display === 'flex') {
            if (!modal.querySelector('.modal-content').contains(event.target) && 
                !event.target.matches('.login-btn') && 
                !event.target.matches('.signup-btn')) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        }
    });
});

// Prevent modal content clicks from closing the modal
document.querySelectorAll('.modal-content').forEach(content => {
    content.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});

// Firebase Authentication
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the signup page
  const googleSignInBtn = document.getElementById('googleSignInBtn');
  if (!googleSignInBtn) return;
  
  // Import Firebase modules only when needed
  import('https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js')
    .then(({initializeApp}) => {
      import('https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js')
        .then(({getAuth, signInWithPopup, GoogleAuthProvider}) => {
          
          // Firebase configuration
          const firebaseConfig = {
            apiKey: "AIzaSyA5SGUEBWDqXkCxvGnHw0QhiV_3PJXJ0yI",
            authDomain: "ehsan-eliott.firebaseapp.com",
            projectId: "ehsan-eliott",
            storageBucket: "ehsan-eliott.appspot.com",
            messagingSenderId: "382280061827",
            appId: "1:382280061827:web:1c6a6e6c2eef85e0e9e19a",
            measurementId: "G-QXWMQGL7RJ"
          };
          
          // Initialize Firebase
          const app = initializeApp(firebaseConfig);
          const auth = getAuth(app);
          const provider = new GoogleAuthProvider();
          
          // Set up Google Sign In button
          googleSignInBtn.addEventListener('click', () => {
            signInWithPopup(auth, provider)
              .then((result) => {
                const user = result.user;
                
                // Store user info in localStorage
                const currentUser = {
                  id: user.uid,
                  name: user.displayName || user.email.split('@')[0],
                  email: user.email,
                  role: 'user'
                };
                
                // Save to localStorage
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Check if users array exists
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                if (!users.some(u => u.email === user.email)) {
                  users.push({
                    id: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    password: '******', // Placeholder for Google users
                    role: 'user'
                  });
                  localStorage.setItem('users', JSON.stringify(users));
                }
                
                // Update page
                alert('ورود با گوگل موفقیت آمیز بود');
                location.reload();
              })
              .catch((error) => {
                console.error("Error signing in with Google:", error);
                alert('خطا در ورود با گوگل');
              });
          });
        })
        .catch(error => {
          console.error("Error loading Firebase Auth:", error);
        });
    })
    .catch(error => {
      console.error("Error loading Firebase App:", error);
    });
});

// Initialize TradingView Widget when document is ready
document.addEventListener('DOMContentLoaded', function() {
    initTradingViewWidget();
});

// TradingView Widget Initialization
function initTradingViewWidget() {
    const widgetContainer = document.getElementById('tradingview_widget');
    if (!widgetContainer) {
        console.log('TradingView widget container not found');
        return;
    }

    console.log('Initializing TradingView widget');
    
    // Create new TradingView widget
    new TradingView.widget({
        "autosize": false,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "D",
        "timezone": "Asia/Tehran",
        "theme": "dark",
        "style": "1",
        "locale": "fa_IR",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_widget",
        "height": 800
    });
}

// Function to handle Google Sign In
function handleGoogleSignIn() {
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            }));
            
            // Show success message
            showNotification('ورود موفقیت‌آمیز!', 'success');
            
            // Close the modal
            const loginModal = document.getElementById('loginModal');
            const signupModal = document.getElementById('signupModal');
            if (loginModal) {
                loginModal.classList.remove('show');
                setTimeout(() => {
                    loginModal.style.display = 'none';
                }, 300);
            }
            if (signupModal) {
                signupModal.classList.remove('show');
                setTimeout(() => {
                    signupModal.style.display = 'none';
                }, 300);
            }
            
            // Reload page after successful login
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        })
        .catch((error) => {
            console.error('Error during Google sign in:', error);
            showNotification('خطا در ورود با گوگل. لطفا دوباره تلاش کنید.', 'error');
        });
}

// Add event listeners for Google sign-in buttons
document.addEventListener('DOMContentLoaded', function() {
    const googleButtons = document.querySelectorAll('.google-signin-btn');
    googleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleGoogleSignIn();
        });
    });
});

// Function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }

    // Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('.nav-menu a, .hero-content a, .cta-button');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (navMenu.classList.contains('show')) {
                        navMenu.classList.remove('show');
                    }
                }
            }
        });
    });

    // Comment form submission in forum
    const commentForm = document.querySelector('.forum-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const commentText = document.querySelector('textarea[name="comment"]').value;
            
            if (commentText.trim() !== '') {
                // Here you would typically send the comment to a server or API
                // For now, we'll just show a notification
                
                showNotification('نظر شما با موفقیت ثبت شد.', 'success');
                
                // Clear the form
                document.querySelector('textarea[name="comment"]').value = '';
            }
        });
    }

    // Animation observer for fade-in effect
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const elementsToAnimate = document.querySelectorAll('.course-card, .signal-card, .feature-card');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });

    // Authentication Modal Handling
    setupAuthModals();
});

// Setup authentication modals
function setupAuthModals() {
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    
    // Show modals
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', function() {
            loginModal.style.display = 'flex';
            setTimeout(() => {
                loginModal.classList.add('show');
            }, 10);
        });
    }
    
    if (signupBtn && signupModal) {
        signupBtn.addEventListener('click', function() {
            signupModal.style.display = 'flex';
            setTimeout(() => {
                signupModal.classList.add('show');
            }, 10);
        });
    }
    
    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
            
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    });
    
    // Switch between modals
    if (showSignupLink && signupModal && loginModal) {
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            loginModal.classList.remove('show');
            setTimeout(() => {
                loginModal.style.display = 'none';
                signupModal.style.display = 'flex';
                
                setTimeout(() => {
                    signupModal.classList.add('show');
                }, 10);
            }, 300);
        });
    }
    
    if (showLoginLink && loginModal && signupModal) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            signupModal.classList.remove('show');
            setTimeout(() => {
                signupModal.style.display = 'none';
                loginModal.style.display = 'flex';
                
                setTimeout(() => {
                    loginModal.classList.add('show');
                }, 10);
            }, 300);
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
            
            setTimeout(() => {
                e.target.style.display = 'none';
            }, 300);
        }
    });
}

// TradingView is now initialized in the HTML file
// // TradingView Widgets initialization code is commented out to avoid conflict
// function initTradingViewWidgets() {
//     // This function is no longer used
// }

// Forex Factory Calendar for forex-news.html
document.addEventListener('DOMContentLoaded', function() {
    const forexCalendarContainer = document.querySelector('.forex-calendar-container');
    const loadingIndicator = document.querySelector('.loading-indicator');
    
    if (forexCalendarContainer && loadingIndicator) {
        const forexCalendar = forexCalendarContainer.querySelector('iframe');
        
        if (forexCalendar) {
            forexCalendar.onload = function() {
                loadingIndicator.style.display = 'none';
                forexCalendar.style.opacity = '1';
            };
            
            forexCalendar.onerror = function() {
                loadingIndicator.style.display = 'none';
                forexCalendarContainer.innerHTML = `
                    <div class="calendar-error">
                        <h3>خطا در بارگذاری تقویم اقتصادی</h3>
                        <p>متأسفانه مشکلی در بارگذاری تقویم اقتصادی Forex Factory پیش آمده است.</p>
                        <a href="https://www.forexfactory.com/calendar" class="forex-link" target="_blank">مشاهده تقویم در سایت Forex Factory</a>
                    </div>
                `;
            };
            
            // Handle reload button
            const reloadBtn = loadingIndicator.querySelector('.reload-btn');
            if (reloadBtn) {
                reloadBtn.addEventListener('click', function() {
                    forexCalendar.src = forexCalendar.src;
                });
            }
        }
    }
});

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDRQJbVr-kXdc4wWCZ_lmLVGR_6YXcEKmQ",
    authDomain: "ehsan-elliott.firebaseapp.com",
    projectId: "ehsan-elliott",
    storageBucket: "ehsan-elliott.appspot.com",
    messagingSenderId: "968619420797",
    appId: "1:968619420797:web:0a37b96c8f8fad56492b59",
    measurementId: "G-R9WTQ68BWJ"
};

// Initialize Firebase only if it's not already initialized
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    // Handle Google Sign in
    document.querySelectorAll('.google-signin-btn').forEach(button => {
        button.addEventListener('click', function() {
            auth.signInWithPopup(googleProvider)
                .then((result) => {
                    // This gives you a Google Access Token
                    const credential = result.credential;
                    
                    // The signed-in user info
                    const user = result.user;
                    
                    // Store user data in localStorage
                    localStorage.setItem('user', JSON.stringify({
                        uid: user.uid,
                        displayName: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL
                    }));
                    
                    // Update UI to show logged in state
                    updateUIOnLogin(user);
                    
                    // Close the modal
                    const modal = this.closest('.modal');
                    if (modal) {
                        modal.classList.remove('show');
                        setTimeout(() => {
                            modal.style.display = 'none';
                        }, 300);
                    }
                    
                    // Show success notification
                    showNotification('شما با موفقیت وارد شدید', 'success');
                })
                .catch((error) => {
                    console.error('Error during sign in:', error);
                    showNotification('خطا در ورود: ' + error.message, 'error');
                });
        });
    });

    // Login form handling
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.querySelector('#login-email').value;
            const password = document.querySelector('#login-password').value;
            
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    
                    localStorage.setItem('user', JSON.stringify({
                        uid: user.uid,
                        displayName: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL
                    }));
                    
                    updateUIOnLogin(user);
                    
                    const modal = document.getElementById('login-modal');
                    if (modal) {
                        modal.classList.remove('show');
                        setTimeout(() => {
                            modal.style.display = 'none';
                        }, 300);
                    }
                    
                    showNotification('شما با موفقیت وارد شدید', 'success');
                })
                .catch((error) => {
                    console.error('Error during login:', error);
                    showNotification('خطا در ورود: ' + error.message, 'error');
                });
        });
    }

    // Signup form handling
    const signupForm = document.querySelector('#signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.querySelector('#signup-name').value;
            const email = document.querySelector('#signup-email').value;
            const password = document.querySelector('#signup-password').value;
            
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    
                    // Update profile with name
                    return user.updateProfile({
                        displayName: name
                    }).then(() => {
                        localStorage.setItem('user', JSON.stringify({
                            uid: user.uid,
                            displayName: name,
                            email: user.email,
                            photoURL: user.photoURL
                        }));
                        
                        updateUIOnLogin(user);
                        
                        const modal = document.getElementById('signup-modal');
                        if (modal) {
                            modal.classList.remove('show');
                            setTimeout(() => {
                                modal.style.display = 'none';
                            }, 300);
                        }
                        
                        showNotification('حساب کاربری با موفقیت ایجاد شد', 'success');
                    });
                })
                .catch((error) => {
                    console.error('Error during signup:', error);
                    showNotification('خطا در ثبت نام: ' + error.message, 'error');
                });
        });
    }

    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            updateUIOnLogin(user);
        } catch (e) {
            console.error('Error parsing stored user data:', e);
            localStorage.removeItem('user');
        }
    }

    // Forgot password handling
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = prompt('لطفاً ایمیل خود را وارد کنید:');
            
            if (email && email.trim() !== '') {
                auth.sendPasswordResetEmail(email.trim())
                    .then(() => {
                        showNotification('ایمیل بازیابی رمز عبور ارسال شد', 'info');
                    })
                    .catch((error) => {
                        console.error('Error sending password reset email:', error);
                        showNotification('خطا در ارسال ایمیل: ' + error.message, 'error');
                    });
            }
        });
    }

    // Logout handling
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.signOut()
                .then(() => {
                    localStorage.removeItem('user');
                    updateUIOnLogout();
                    showNotification('شما با موفقیت خارج شدید', 'info');
                })
                .catch((error) => {
                    console.error('Error during logout:', error);
                    showNotification('خطا در خروج: ' + error.message, 'error');
                });
        });
    }
}

// Update UI when user logs in
function updateUIOnLogin(user) {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (authButtons) {
        authButtons.innerHTML = `
            <span class="user-name">سلام ${user.displayName || 'کاربر'}</span>
            <a href="dashboard.html" class="dashboard-link">پنل کاربری</a>
            <button class="logout-btn">خروج</button>
        `;
        
        // Add event listener to the new logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                firebase.auth().signOut()
                    .then(() => {
                        localStorage.removeItem('user');
                        updateUIOnLogout();
                        showNotification('شما با موفقیت خارج شدید', 'info');
                    })
                    .catch((error) => {
                        console.error('Error during logout:', error);
                        showNotification('خطا در خروج: ' + error.message, 'error');
                    });
            });
        }
    }
}

// Update UI when user logs out
function updateUIOnLogout() {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (authButtons) {
        authButtons.innerHTML = `
            <button class="login-btn">ورود</button>
            <button class="signup-btn">ثبت نام</button>
        `;
        
        // Re-setup auth modals
        setupAuthModals();
    }
}

.trading-view-container {
    width: 100%;
    height: 900px; /* افزایش ارتفاع */
    border: 1px solid #ccc; /* حاشیه مدرن */
    border-radius: 10px; /* گوشه‌های گرد */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); /* سایه برای عمق بیشتر */
    overflow: hidden; /* جلوگیری از overflow */
    background-color: #2c2c2c; /* پس‌زمینه تیره برای هماهنگی با چارت */
    padding: 20px; /* فضای داخلی */
}

.trading-widget {
    width: 100% !important; /* عرض را به 100% تنظیم کنید */
    height: 100% !important; /* ارتفاع را به 100% تنظیم کنید */
    border-radius: 10px; /* گوشه‌های گرد */
    background-color: #1e1e1e; /* پس‌زمینه چارت */
} 