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

// 載入作品資料
async function loadWorks() {
    try {
        // 顯示載入中的提示
        const gallery = document.querySelector('.gallery');
        if (gallery) {
            gallery.innerHTML = '<div class="col-12"><p class="text-center">載入中...</p></div>';
        }

        // 獲取當前頁面的基礎路徑
        const basePath = window.location.pathname.includes('student-portfolio') ? '/student-portfolio' : '';
        const response = await fetch(`${basePath}/data/works.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('JSON parsing error:', e);
            throw new Error('無法解析作品資料');
        }

        if (!data || !Array.isArray(data.works)) {
            throw new Error('作品資料格式不正確');
        }

        return data.works.map(work => new WorkItem(work));
    } catch (error) {
        console.error('Error loading works:', error);
        throw error;
    }
}

// 建立作品卡片
function createWorkCard(work) {
    return `
        <div class="col-md-4 col-sm-6 mb-4">
            <div class="work-card">
                <div class="card-body">
                    <span class="category">${work.category}</span>
                    <h5 class="card-title">${work.title}</h5>
                    <p class="card-text">${work.desc}</p>
                    <div class="card-meta">
                        <small class="text-muted">作者：${work.student}</small>
                        <small class="text-muted">日期：${work.date}</small>
                    </div>
                    ${work.link ? `<a href="${work.link}" class="btn-view mt-2" target="_blank">查看作品</a>` : ''}
                </div>
            </div>
        </div>
    `;
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
            gallery.innerHTML = '<div class="col-12"><p class="text-center">目前沒有作品</p></div>';
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
        
        // 準備 HTML 內容
        const content = document.createDocumentFragment();
        
        // 顯示每個分類的作品
        Object.entries(categorizedWorks).forEach(([category, works]) => {
            if (works.length > 0) {
                const categorySection = document.createElement('section');
                categorySection.id = category.toLowerCase().replace(/\s+/g, '-');
                
                const categoryTitle = document.createElement('h2');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = category;
                categorySection.appendChild(categoryTitle);
                
                const row = document.createElement('div');
                row.className = 'row';
                
                // 一次性設置 innerHTML
                row.innerHTML = works.map(work => createWorkCard(work)).join('');
                
                categorySection.appendChild(row);
                content.appendChild(categorySection);
            }
        });
        
        // 一次性更新 DOM
        gallery.innerHTML = '';
        gallery.appendChild(content);
        
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
        gallery.innerHTML = `<div class="col-12">
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">載入失敗</h4>
                <p>${error.message || '載入作品時發生錯誤'}</p>
                <hr>
                <p class="mb-0">請稍後再試，或聯繫管理員</p>
            </div>
        </div>`;
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