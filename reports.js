// Reports Management
document.addEventListener('DOMContentLoaded', () => {
    initializeReports();
    setupEventListeners();
    checkUserRole();
});

// Initialize reports
function initializeReports() {
    const reports = getReportsFromStorage();
    displayReports(reports);
}

// Setup event listeners
function setupEventListeners() {
    const categoryFilter = document.getElementById('category-filter');
    const dateFilter = document.getElementById('date-filter');
    const reportForm = document.getElementById('reportForm');

    categoryFilter?.addEventListener('change', filterReports);
    dateFilter?.addEventListener('change', filterReports);
    reportForm?.addEventListener('submit', handleReportSubmission);
}

// Check user role and show/hide add report section
function checkUserRole() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const addReportSection = document.getElementById('addReportSection');
    
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'editor')) {
        addReportSection.style.display = 'block';
    }
}

// Handle report submission
async function handleReportSubmission(event) {
    event.preventDefault();
    
    const title = document.getElementById('reportTitle').value;
    const category = document.getElementById('reportCategory').value;
    const content = document.getElementById('reportContent').value;
    const files = document.getElementById('reportFiles').files;
    
    try {
        const fileUrls = await handleFileUploads(files);
        
        const report = {
            id: Date.now(),
            title,
            category,
            content,
            files: fileUrls,
            author: JSON.parse(localStorage.getItem('currentUser')).name,
            date: new Date().toISOString(),
            comments: []
        };
        
        saveReport(report);
        displayReports(getReportsFromStorage());
        event.target.reset();
        showMessage('گزارش با موفقیت منتشر شد', 'success');
    } catch (error) {
        console.error('Error submitting report:', error);
        showMessage('خطا در انتشار گزارش', 'error');
    }
}

// Handle file uploads
async function handleFileUploads(files) {
    const fileUrls = [];
    
    for (const file of files) {
        try {
            const dataUrl = await readFileAsDataURL(file);
            fileUrls.push({
                name: file.name,
                type: file.type,
                url: dataUrl
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('File upload failed');
        }
    }
    
    return fileUrls;
}

// Read file as Data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsDataURL(file);
    });
}

// Save report to storage
function saveReport(report) {
    const reports = getReportsFromStorage();
    reports.unshift(report);
    localStorage.setItem('reports', JSON.stringify(reports));
}

// Get reports from storage
function getReportsFromStorage() {
    return JSON.parse(localStorage.getItem('reports')) || [];
}

// Display reports
function displayReports(reports) {
    const reportsContainer = document.getElementById('reportsContainer');
    const categoryFilter = document.getElementById('category-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    let filteredReports = reports;
    
    // Apply category filter
    if (categoryFilter !== 'all') {
        filteredReports = filteredReports.filter(report => report.category === categoryFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        if (dateFilter === 'week') {
            filterDate.setDate(filterDate.getDate() - 7);
        } else if (dateFilter === 'month') {
            filterDate.setMonth(filterDate.getMonth() - 1);
        }
        
        filteredReports = filteredReports.filter(report => {
            const reportDate = new Date(report.date);
            return reportDate >= filterDate && reportDate <= now;
        });
    }
    
    const reportsHTML = filteredReports.map(report => `
        <article class="report-card">
            <header class="report-header">
                <h3>${report.title}</h3>
                <div class="report-meta">
                    <span class="report-author">${report.author}</span>
                    <span class="report-date">${new Date(report.date).toLocaleDateString('fa-IR')}</span>
                    <span class="report-category">${getCategoryLabel(report.category)}</span>
                </div>
            </header>
            <div class="report-content">
                <p>${report.content}</p>
            </div>
            ${report.files.length > 0 ? `
                <div class="report-attachments">
                    <h4>فایل‌های پیوست:</h4>
                    <div class="attachment-list">
                        ${report.files.map(file => `
                            <a href="${file.url}" target="_blank" class="attachment-link">
                                ${file.name}
                            </a>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            <div class="report-comments">
                <h4>نظرات (${report.comments.length})</h4>
                ${report.comments.map(comment => `
                    <div class="comment">
                        <div class="comment-header">
                            <span class="comment-author">${comment.author}</span>
                            <span class="comment-date">${new Date(comment.date).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <p>${comment.content}</p>
                    </div>
                `).join('')}
                ${isUserLoggedIn() ? `
                    <form class="comment-form" onsubmit="addComment(event, ${report.id})">
                        <textarea required placeholder="نظر خود را بنویسید..."></textarea>
                        <button type="submit" class="submit-btn">ارسال نظر</button>
                    </form>
                ` : `
                    <p class="login-message">برای ارسال نظر لطفا <a href="#" onclick="showLoginModal()">وارد شوید</a></p>
                `}
            </div>
        </article>
    `).join('');
    
    reportsContainer.innerHTML = reportsHTML || '<p class="no-reports">گزارشی یافت نشد</p>';
}

// Filter reports
function filterReports() {
    const reports = getReportsFromStorage();
    displayReports(reports);
}

// Add comment to a report
function addComment(event, reportId) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const commentContent = event.target.querySelector('textarea').value;
    
    const comment = {
        author: currentUser.name,
        content: commentContent,
        date: new Date().toISOString()
    };
    
    const reports = getReportsFromStorage();
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex !== -1) {
        reports[reportIndex].comments.push(comment);
        localStorage.setItem('reports', JSON.stringify(reports));
        displayReports(reports);
        showMessage('نظر شما با موفقیت ثبت شد', 'success');
    }
}

// Utility functions
function getCategoryLabel(category) {
    const labels = {
        technical: 'تحلیل تکنیکال',
        fundamental: 'تحلیل فاندامنتال',
        news: 'اخبار و گزارش‌ها'
    };
    return labels[category] || category;
}

function isUserLoggedIn() {
    return !!localStorage.getItem('currentUser');
}

function showMessage(message, type) {
    // Implementation from script.js
}

// Add reports-specific styles
const reportsStyles = `
    .reports-container {
        padding: 6rem 2rem 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .reports-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .reports-filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        justify-content: center;
    }

    .report-card {
        background: var(--card-bg);
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .report-header {
        margin-bottom: 1rem;
    }

    .report-meta {
        display: flex;
        gap: 1rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .report-category {
        background: var(--accent-color);
        color: var(--background-dark);
        padding: 0.2rem 0.5rem;
        border-radius: 1rem;
    }

    .report-content {
        margin-bottom: 1.5rem;
    }

    .report-attachments {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
    }

    .attachment-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    .attachment-link {
        color: var(--accent-color);
        text-decoration: none;
        padding: 0.3rem 0.8rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        transition: all 0.3s ease;
    }

    .attachment-link:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .report-comments {
        border-top: 1px solid var(--border-color);
        padding-top: 1rem;
    }

    .comment {
        background: rgba(255, 255, 255, 0.05);
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }

    .comment-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .comment-form {
        margin-top: 1rem;
    }

    .comment-form textarea {
        width: 100%;
        min-height: 100px;
        margin-bottom: 1rem;
    }

    .no-reports {
        text-align: center;
        padding: 2rem;
        background: var(--card-bg);
        border-radius: 0.5rem;
    }

    @media (max-width: 768px) {
        .reports-filters {
            flex-direction: column;
        }
        
        .report-meta {
            flex-direction: column;
            gap: 0.5rem;
        }
    }
`;

// Add styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = reportsStyles;
document.head.appendChild(styleSheet); 