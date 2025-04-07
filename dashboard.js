// Check if user is logged in and has appropriate role
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'editor')) {
        window.location.href = 'index.html';
    }
    return currentUser;
}

// Initialize dashboard
function initDashboard() {
    const currentUser = checkAuth();
    
    // Set user info
    document.getElementById('userName').textContent = currentUser.name || currentUser.email;
    document.getElementById('userRole').textContent = currentUser.role === 'admin' ? 'مدیر' : 'ویرایشگر';
    document.getElementById('userAvatar').src = currentUser.avatar || 'assets/default-avatar.png';

    // Show/hide admin-only sections
    if (currentUser.role !== 'admin') {
        document.querySelector('[data-section="users"]').style.display = 'none';
    }

    // Load initial data
    loadCourses();
    loadBlogs();
    if (currentUser.role === 'admin') {
        loadUsers();
    }
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');
        
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
        // Show selected section
        document.getElementById(`${item.dataset.section}Section`).classList.add('active');
    });
});

// Load Courses
function loadCourses() {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const coursesGrid = document.querySelector('.courses-grid');
    coursesGrid.innerHTML = courses.map(course => `
        <div class="course-card">
            <img src="${course.image}" alt="${course.title}">
            <h3>${course.title}</h3>
            <div class="course-actions">
                <button onclick="editCourse('${course.id}')" class="edit-btn">ویرایش</button>
                <button onclick="deleteCourse('${course.id}')" class="delete-btn">حذف</button>
            </div>
        </div>
    `).join('');
}

// Load Blogs
function loadBlogs() {
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const blogsList = document.querySelector('.blogs-list');
    blogsList.innerHTML = blogs.map(blog => `
        <div class="blog-item">
            <div class="blog-info">
                <h3>${blog.title}</h3>
                <p>${blog.content.substring(0, 100)}...</p>
            </div>
            <div class="blog-actions">
                <button onclick="editBlog('${blog.id}')" class="edit-btn">ویرایش</button>
                <button onclick="deleteBlog('${blog.id}')" class="delete-btn">حذف</button>
            </div>
        </div>
    `).join('');
}

// Load Users (Admin only)
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const usersList = document.querySelector('.users-list');
    usersList.innerHTML = users.map(user => `
        <div class="user-card">
            <img src="${user.avatar || 'assets/default-avatar.png'}" alt="${user.name}" class="user-avatar">
            <h3>${user.name || user.email}</h3>
            <span class="user-role">${user.role || 'کاربر'}</span>
            ${checkAuth().role === 'admin' ? `
                <div class="user-actions">
                    <button onclick="changeUserRole('${user.id}')" class="edit-btn">تغییر نقش</button>
                    <button onclick="deleteUser('${user.id}')" class="delete-btn">حذف</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Course Modal
const addCourseBtn = document.getElementById('addCourseBtn');
const addCourseModal = document.getElementById('addCourseModal');
const addCourseForm = document.getElementById('addCourseForm');

addCourseBtn.addEventListener('click', () => {
    addCourseModal.style.display = 'block';
});

addCourseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(addCourseForm);
    const courseData = {
        id: Date.now().toString(),
        title: formData.get('courseTitle'),
        description: formData.get('courseDescription'),
        image: await readFileAsDataURL(formData.get('courseImage')),
        video: await readFileAsDataURL(formData.get('courseVideo')),
        createdAt: new Date().toISOString()
    };

    // Save course
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    courses.push(courseData);
    localStorage.setItem('courses', JSON.stringify(courses));

    // Refresh courses list
    loadCourses();
    addCourseModal.style.display = 'none';
    addCourseForm.reset();
});

// Blog Modal
const addBlogBtn = document.getElementById('addBlogBtn');
const addBlogModal = document.getElementById('addBlogModal');
const addBlogForm = document.getElementById('addBlogForm');

addBlogBtn.addEventListener('click', () => {
    addBlogModal.style.display = 'block';
});

addBlogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(addBlogForm);
    const blogData = {
        id: Date.now().toString(),
        title: formData.get('blogTitle'),
        content: formData.get('blogContent'),
        image: await readFileAsDataURL(formData.get('blogImage')),
        author: checkAuth().name || checkAuth().email,
        createdAt: new Date().toISOString()
    };

    // Save blog
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    blogs.push(blogData);
    localStorage.setItem('blogs', JSON.stringify(blogs));

    // Refresh blogs list
    loadBlogs();
    addBlogModal.style.display = 'none';
    addBlogForm.reset();
});

// Utility Functions
async function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Close modals when clicking close button
document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').style.display = 'none';
    });
});

// Delete functions
function deleteCourse(courseId) {
    if (confirm('آیا از حذف این دوره اطمینان دارید؟')) {
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        const updatedCourses = courses.filter(course => course.id !== courseId);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        loadCourses();
    }
}

function deleteBlog(blogId) {
    if (confirm('آیا از حذف این مقاله اطمینان دارید؟')) {
        const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
        const updatedBlogs = blogs.filter(blog => blog.id !== blogId);
        localStorage.setItem('blogs', JSON.stringify(updatedBlogs));
        loadBlogs();
    }
}

function deleteUser(userId) {
    if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUsers = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        loadUsers();
    }
}

// Change user role
function changeUserRole(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    if (user) {
        const newRole = user.role === 'editor' ? 'user' : 'editor';
        user.role = newRole;
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
    }
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard); 