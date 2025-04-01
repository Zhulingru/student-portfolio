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
        // 獲取當前頁面的基礎路徑
        const basePath = window.location.pathname.includes('student-portfolio') ? '/student-portfolio' : '';
        const response = await fetch(`${basePath}/data/works.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Loaded data:', data); // 添加除錯訊息
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
    try {
        console.log('Starting to display works...'); // 添加除錯訊息
        const works = await loadWorks();
        console.log('Loaded works:', works); // 添加除錯訊息
        
        const gallery = document.querySelector('.gallery');
        if (!gallery) {
            console.error('Gallery element not found!'); // 添加除錯訊息
            return;
        }
        
        if (!works || works.length === 0) {
            gallery.innerHTML = '<div class="col-12"><p class="text-center">無法載入作品資料</p></div>';
            return;
        }
        
        // 清空現有內容
        gallery.innerHTML = '';
        
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
        
        console.log('Display completed!'); // 添加除錯訊息
    } catch (error) {
        console.error('Error in displayWorks:', error); // 添加除錯訊息
        const gallery = document.querySelector('.gallery');
        if (gallery) {
            gallery.innerHTML = '<div class="col-12"><p class="text-center">載入作品時發生錯誤</p></div>';
        }
    }
}

// 當頁面載入完成時執行
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded'); // 添加除錯訊息
    displayWorks();
}); 