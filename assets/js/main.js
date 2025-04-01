// 作品資料結構
class WorkItem {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.desc = data.desc;
        this.category = data.category;
        this.link = data.link;
        this.student = data.student;
        this.date = data.date;
    }
}

// 加載作品數據
async function loadWorks() {
    try {
        // 獲取當前頁面的基礎路徑
        const basePath = window.location.hostname.includes('github.io') ? '/student-portfolio' : '';
        const response = await fetch(`${basePath}/data/works.json`);
        
        if (!response.ok) {
            throw new Error('Failed to load works data');
        }
        const data = await response.json();
        return data.works; // 返回 works 數組
    } catch (error) {
        console.error('Error loading works:', error);
        return [];
    }
}

// 渲染作品卡片
function renderWorkCard(work) {
    return `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${work.title}</h5>
                <p class="card-text">${work.desc}</p>
                <div class="card-footer">
                    <div class="author-date">
                        <span>作者：${work.student}</span>
                        <span>日期：${work.date}</span>
                    </div>
                    <a href="${work.link || '#'}" class="btn btn-primary" ${work.link ? 'target="_blank"' : ''}>查看作品</a>
                </div>
            </div>
        </div>
    `;
}

// 按類別分組作品
function groupWorksByCategory(works) {
    const categorizedWorks = {};
    works.forEach(work => {
        if (!categorizedWorks[work.category]) {
            categorizedWorks[work.category] = [];
        }
        categorizedWorks[work.category].push(work);
    });
    return categorizedWorks;
}

// 渲染分類區塊
function renderCategorySection(category, works) {
    const categoryId = category.toLowerCase().replace(/\s+/g, '-');
    return `
        <div class="category-section" id="${categoryId}">
            <h2 class="category-title">${category}</h2>
            <div class="category-content">
                ${works.map(work => renderWorkCard(work)).join('')}
            </div>
        </div>
    `;
}

// 初始化頁面
async function initializePage() {
    try {
        const works = await loadWorks();
        if (!Array.isArray(works)) {
            throw new Error('Works data is not an array');
        }
        
        const gallery = document.querySelector('.gallery');
        if (!gallery) {
            throw new Error('Gallery element not found');
        }
        
        const categorizedWorks = groupWorksByCategory(works);
        const categorySections = Object.entries(categorizedWorks)
            .map(([category, works]) => renderCategorySection(category, works))
            .join('');
            
        gallery.innerHTML = categorySections;
    } catch (error) {
        console.error('Error initializing page:', error);
        const gallery = document.querySelector('.gallery');
        if (gallery) {
            gallery.innerHTML = '<div class="alert alert-danger">載入失敗，請稍後再試</div>';
        }
    }
}

// 當 DOM 加載完成後初始化頁面
document.addEventListener('DOMContentLoaded', initializePage);

// 處理導航點擊
document.addEventListener('click', (e) => {
    if (e.target.matches('.nav-link')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            history.pushState(null, '', targetId);
        }
    }
}); 