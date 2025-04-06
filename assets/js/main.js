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

// 加載作品數據
async function loadWorks() {
    try {
        // 添加時間戳參數來防止快取
        const timestamp = new Date().getTime();
        
        // 獲取正確的基礎路徑
        const basePath = window.location.pathname.includes('student-portfolio') 
            ? '/student-portfolio' 
            : '';
            
        // 使用完整路徑
        const response = await fetch(`${basePath}/data/works.json?t=${timestamp}`);
        
        if (!response.ok) {
            console.error('Response not OK:', response.status, response.statusText);
            throw new Error('載入失敗');
        }
        
        const data = await response.json();
        console.log('Loaded data:', data);
        
        if (!data || !Array.isArray(data.works)) {
            console.error('Invalid data format:', data);
            throw new Error('數據格式錯誤');
        }
        
        return data.works;
    } catch (error) {
        console.error('Error loading works:', error);
        throw error;
    }
}

// 渲染作品卡片
function renderWorkCard(work) {
    // 使用作品 ID 作為頁面參數
    const workDetailUrl = `work-detail.html?id=${work.id}&title=${encodeURIComponent(work.title)}&desc=${encodeURIComponent(work.desc)}`;
    
    // 使用純 CSS 背景作為預設圖片
    return `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${work.title}</h5>
                <p class="card-text">${work.desc}</p>
                <a href="${workDetailUrl}" class="btn btn-primary">查看作品</a>
            </div>
        </div>
    `;
}

// 建立分類區塊
function createCategorySection(category, works) {
    // 將中文分類名稱轉換為英文 ID
    const categoryToId = {
        'Scratch動畫': 'scratch-animation',
        'Scratch遊戲': 'scratch-game',
        'CodeSpark遊戲': 'codespark-game',
        'MakeCode Arcade': 'makecode-arcade',
        'CoSpaces': 'cospaces',
        'micro:bit': 'microbit',
        '生活科技': 'living-tech',
        '專案分享': 'project-share',
        'AI科技': 'ai-tech'
    };

    const sectionId = categoryToId[category] || category.toLowerCase().replace(/\s+/g, '-');
    
    return `
        <div class="category-section" id="${sectionId}">
            <h2 class="category-title">${category}</h2>
            <div class="category-content">
                ${works.map(work => renderWorkCard(work)).join('')}
            </div>
        </div>
    `;
}

// 顯示作品
async function displayWorks() {
    const gallery = document.querySelector('.gallery');
    if (!gallery) {
        console.error('找不到 gallery 元素');
        return;
    }

    try {
        // 顯示載入中的提示
        gallery.innerHTML = '<div class="text-center">載入中...</div>';
        
        // 加載作品數據
        const works = await loadWorks();
        console.log('Works loaded:', works); // 添加日誌
        
        if (!works || works.length === 0) {
            gallery.innerHTML = '<div class="text-center">目前沒有作品</div>';
            return;
        }
        
        // 按分類組織作品
        const categorizedWorks = {};
        works.forEach(work => {
            const category = work.category || '其他';
            if (!categorizedWorks[category]) {
                categorizedWorks[category] = [];
            }
            categorizedWorks[category].push(work);
        });
        
        console.log('Categorized works:', categorizedWorks); // 添加日誌
        
        // 創建所有分類區塊的 HTML
        const categorySections = Object.entries(categorizedWorks)
            .map(([category, categoryWorks]) => createCategorySection(category, categoryWorks))
            .join('');
        
        // 更新頁面
        gallery.innerHTML = `<div class="category-grid">${categorySections}</div>`;
        
        // 處理錨點導航
        if (window.location.hash) {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    } catch (error) {
        console.error('Error displaying works:', error);
        gallery.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">載入失敗</h4>
                <p>${error.message}</p>
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
document.addEventListener('DOMContentLoaded', displayWorks); 