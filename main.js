// 作品資料結構
class WorkItem {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.desc = data.desc;
        this.category = data.category;
        this.image = data.image;
        this.link = data.link;
    }
}

// 載入作品資料
async function loadWorks() {
    try {
        const response = await fetch('data/works.json');
        const data = await response.json();
        return data.works.map(work => new WorkItem(work));
    } catch (error) {
        console.error('Error loading works:', error);
        return [];
    }
}

// 建立作品卡片
function createWorkCard(work) {
    return `
        <div class="col-md-4 col-sm-6">
            <div class="work-card">
                <img src="${work.image}" alt="${work.title}">
                <div class="card-body">
                    <span class="category">${work.category}</span>
                    <h5 class="card-title">${work.title}</h5>
                    <p class="card-text">${work.desc}</p>
                    ${work.link ? `<a href="${work.link}" class="btn-view" target="_blank">查看作品</a>` : ''}
                </div>
            </div>
        </div>
    `;
}

// 顯示作品
async function displayWorks() {
    const works = await loadWorks();
    const gallery = document.querySelector('.gallery');
    
    // 按分類組織作品
    const categorizedWorks = {};
    works.forEach(work => {
        if (!categorizedWorks[work.category]) {
            categorizedWorks[work.category] = [];
        }
        categorizedWorks[work.category].push(work);
    });
    
    // 顯示每個分類的作品
    Object.entries(categorizedWorks).forEach(([category, works]) => {
        if (works.length > 0) {
            const categoryTitle = document.createElement('h2');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = category;
            gallery.appendChild(categoryTitle);
            
            const row = document.createElement('div');
            row.className = 'row';
            works.forEach(work => {
                row.innerHTML += createWorkCard(work);
            });
            gallery.appendChild(row);
        }
    });
}

// 當頁面載入完成時執行
document.addEventListener('DOMContentLoaded', displayWorks); 