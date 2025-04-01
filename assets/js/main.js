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
        // 添加時間戳參數來防止快取
        const timestamp = new Date().getTime();
        const response = await fetch(`data/works.json?t=${timestamp}`);
        if (!response.ok) {
            throw new Error('Failed to load works data');
        }
        const data = await response.json();
        return data;
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
                    <a href="${work.link}" class="btn btn-primary">查看作品</a>
                </div>
            </div>
        </div>
    `;
}

// 建立分類區塊
function createCategorySection(category, works) {
    const sectionId = category.toLowerCase().replace(/\s+/g, '-');
    const categorySection = document.createElement('div');
    categorySection.className = 'category-section';
    categorySection.id = sectionId;
    
    categorySection.innerHTML = `
        <h2 class="category-title">${category}</h2>
        <div class="category-content">
            ${works.map(work => renderWorkCard(work)).join('')}
        </div>
    `;
    
    return categorySection;
}

// 顯示作品
async function displayWorks() {
    const gallery = document.querySelector('.gallery');
    if (!gallery) {
        return;
    }

    try {
        const works = await loadWorks();
        
        if (!works || works.length === 0) {
            gallery.innerHTML = '<div class="text-center">目前沒有作品</div>';
            return;
        }
        
        // 按分類組織作品
        const categorizedWorks = {};
        works.forEach(work => {
            if (!categorizedWorks[work.category]) {
                categorizedWorks[work.category] = [];
            }
            categorizedWorks[work.category].push(work);
        });
        
        // 創建網格容器
        const gridContainer = document.createElement('div');
        gridContainer.className = 'category-grid';
        
        // 添加每個分類區塊
        Object.entries(categorizedWorks).forEach(([category, works]) => {
            if (works.length > 0) {
                const categorySection = createCategorySection(category, works);
                gridContainer.appendChild(categorySection);
            }
        });
        
        // 更新頁面
        gallery.innerHTML = '';
        gallery.appendChild(gridContainer);
        
        // 處理錨點導航
        if (window.location.hash) {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                requestAnimationFrame(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                });
            }
        }
    } catch (error) {
        gallery.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">載入失敗</h4>
                <p>${error.message || '載入作品時發生錯誤'}</p>
                <hr>
                <p class="mb-0">請稍後再試，或聯繫管理員</p>
            </div>
        `;
    }
}

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

// 當頁面載入完成時執行
document.addEventListener('DOMContentLoaded', () => {
    displayWorks();
}); 