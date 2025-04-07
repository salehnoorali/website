// ForexFactory News API Configuration
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const FOREX_FACTORY_URL = 'https://www.forexfactory.com/calendar.php?day=';

// News cache
let newsCache = {
    data: [],
    lastUpdate: null
};

// Initialize the news component
document.addEventListener('DOMContentLoaded', () => {
    initializeNewsFilters();
    loadForexNews();
});

// Initialize filter event listeners
function initializeNewsFilters() {
    const dateFilter = document.getElementById('date-filter');
    const impactFilter = document.getElementById('impact-filter');

    dateFilter.addEventListener('change', filterNews);
    impactFilter.addEventListener('change', filterNews);
}

// Load news from ForexFactory
async function loadForexNews() {
    try {
        const newsContainer = document.getElementById('newsContainer');
        newsContainer.innerHTML = '<div class="loading">در حال بارگذاری اخبار...</div>';

        // Check cache first
        if (shouldUseCache()) {
            displayNews(newsCache.data);
            return;
        }

        // Fetch new data
        const response = await fetch(PROXY_URL + FOREX_FACTORY_URL + getTodayDate());
        const data = await response.text();

        // Parse the HTML response
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        
        // Extract news items
        const newsItems = parseNewsItems(doc);
        
        // Update cache
        updateNewsCache(newsItems);
        
        // Display news
        displayNews(newsItems);
    } catch (error) {
        console.error('Error loading news:', error);
        document.getElementById('newsContainer').innerHTML = 
            '<div class="error">خطا در بارگذاری اخبار. لطفا دوباره تلاش کنید.</div>';
    }
}

// Parse news items from HTML
function parseNewsItems(doc) {
    const newsItems = [];
    const rows = doc.querySelectorAll('.calendar_row');
    
    rows.forEach(row => {
        const newsItem = {
            time: row.querySelector('.calendar__time')?.textContent.trim(),
            currency: row.querySelector('.calendar__currency')?.textContent.trim(),
            impact: row.querySelector('.calendar__impact')?.getAttribute('title'),
            event: row.querySelector('.calendar__event')?.textContent.trim(),
            actual: row.querySelector('.calendar__actual')?.textContent.trim(),
            forecast: row.querySelector('.calendar__forecast')?.textContent.trim(),
            previous: row.querySelector('.calendar__previous')?.textContent.trim()
        };
        
        if (newsItem.event) {
            newsItems.push(newsItem);
        }
    });
    
    return newsItems;
}

// Display news items
function displayNews(newsItems) {
    const newsContainer = document.getElementById('newsContainer');
    const impactFilter = document.getElementById('impact-filter').value;
    
    const filteredNews = newsItems.filter(item => {
        if (impactFilter === 'all') return true;
        return item.impact.toLowerCase().includes(impactFilter);
    });
    
    const newsHTML = filteredNews.map(item => `
        <div class="news-item impact-${item.impact.toLowerCase()}">
            <div class="news-time">${item.time}</div>
            <div class="news-currency">${item.currency}</div>
            <div class="news-impact">
                <span class="impact-indicator"></span>
                ${item.impact}
            </div>
            <div class="news-event">${item.event}</div>
            <div class="news-details">
                <div class="news-actual">
                    <span>واقعی:</span> ${item.actual || '-'}
                </div>
                <div class="news-forecast">
                    <span>پیش‌بینی:</span> ${item.forecast || '-'}
                </div>
                <div class="news-previous">
                    <span>قبلی:</span> ${item.previous || '-'}
                </div>
            </div>
        </div>
    `).join('');
    
    newsContainer.innerHTML = newsHTML || '<div class="no-news">خبری یافت نشد</div>';
}

// Filter news based on selected filters
function filterNews() {
    if (newsCache.data.length > 0) {
        displayNews(newsCache.data);
    }
}

// Cache management functions
function shouldUseCache() {
    if (!newsCache.lastUpdate) return false;
    
    const cacheAge = Date.now() - newsCache.lastUpdate;
    return cacheAge < 5 * 60 * 1000; // 5 minutes cache
}

function updateNewsCache(newsItems) {
    newsCache.data = newsItems;
    newsCache.lastUpdate = Date.now();
}

// Utility function to get today's date in required format
function getTodayDate() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Add news-specific styles
const newsStyles = `
    .forex-news-container {
        padding: 6rem 2rem 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .news-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .news-filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        justify-content: center;
    }

    .filter-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .news-grid {
        display: grid;
        gap: 1rem;
    }

    .news-item {
        background: var(--card-bg);
        padding: 1rem;
        border-radius: 0.5rem;
        display: grid;
        gap: 0.5rem;
    }

    .impact-high .impact-indicator {
        background-color: var(--danger-color);
    }

    .impact-medium .impact-indicator {
        background-color: var(--warning-color);
    }

    .impact-low .impact-indicator {
        background-color: var(--success-color);
    }

    .impact-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 0.5rem;
    }

    .news-details {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-color);
    }

    .loading, .error, .no-news {
        text-align: center;
        padding: 2rem;
        background: var(--card-bg);
        border-radius: 0.5rem;
    }

    .error {
        color: var(--danger-color);
    }
`;

// Add styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = newsStyles;
document.head.appendChild(styleSheet); 