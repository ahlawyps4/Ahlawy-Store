/* ============ AHLAWY STORE ENGINE - v6.0 (PERFORMANCE OPTIMIZED) ============ */

let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];
const STORE_PHONE = "201018251103";

// 1. تسجيل الـ Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const isGitHub = window.location.hostname.includes('github.io');
        const swUrl = isGitHub ? '/Ahlawy-Store/sw.js' : './sw.js';
        const scope = isGitHub ? '/Ahlawy-Store/' : './';

        navigator.serviceWorker.register(swUrl, { scope: scope })
            .then(reg => {
                navigator.serviceWorker.addEventListener('message', event => {
                    if (event.data.type === 'CACHE_PROGRESS') updateProgressBar(event.data.progress);
                });
            }).catch(err => console.log('SW Error'));
    });
}

// 2. دعم الـ AppCache (لـ PS4)
if (window.applicationCache) {
    window.applicationCache.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            updateProgressBar(progress);
        }
    }, false);
}

function updateProgressBar(progress) {
    const container = document.getElementById('cache-progress-container');
    const fill = document.getElementById('progress-bar-fill');
    const percent = document.getElementById('percent-val');
    const status = document.getElementById('status-msg');

    if (container && fill && percent) {
        container.style.display = 'block';
        fill.style.width = progress + '%';
        percent.innerText = progress;
        if (progress === 100) {
            status.innerHTML = "✅ تم حفظ المتجر بنجاح! تصفح الآن بدون إنترنت.";
            setTimeout(() => { container.style.display = 'none'; }, 5000);
        }
    }
}

// 3. تحميل الألعاب (تم التعديل لمنع التعليق)
async function loadGames() {
    const isSubFolder = window.location.pathname.includes('/PS4/') || window.location.pathname.includes('/PS5/');
    const jsonPath = isSubFolder ? '../games.json' : './games.json';
    const baseAssetPath = isSubFolder ? '../' : './';

    try {
        const response = await fetch(jsonPath);
        const games = await response.json();
        const container = document.getElementById('games-container');
        const platform = document.body.getAttribute('data-platform');

        if (!container || !platform) return;

        // تصفية الألعاب
        const filteredGames = games.filter(g => g.platform === platform);
        
        // بناء المحتوى في الذاكرة أولاً (Batch Processing)
        let allGamesHTML = ''; 

        for (let i = 0; i < filteredGames.length; i++) {
            const game = filteredGames[i];
            const finalImgUrl = baseAssetPath + game.img;
            const isInCart = cart.includes(game.title);
            
            // إضافة loading="lazy" لتقليل استهلاك الرام
            allGamesHTML += `
                <div class="game-item">
                    <div class="game-media">
                        <img src="${finalImgUrl}" alt="${game.title}" loading="lazy" onerror="this.src='${baseAssetPath}logo.png';">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button class="add-to-cart-btn ${isInCart ? 'already-added' : ''}" 
                                onclick="addToCart('${game.title.replace(/'/g, "\\")}')" ${isInCart ? 'disabled' : ''}>
                            ${isInCart ? 'تمت الإضافة 🦅' : 'إضافة للسلة'}
                        </button>
                    </div>
                </div>`;
        }

        // حقن كل الألعاب (476 لعبة) في عملية واحدة فقط
        container.innerHTML = allGamesHTML;

    } catch (err) { 
        console.error("Load Error", err); 
    }
}

// 4. تحسين البحث ليكون خفيفاً على المعالج
function filterGames() {
    const searchTerm = document.getElementById('game-search').value.toLowerCase();
    const items = document.getElementsByClassName('game-item');
    
    for (let i = 0; i < items.length; i++) {
        const title = items[i].getElementsByTagName('h3')[0].innerText.toLowerCase();
        // إخفاء/إظهار بدون إعادة بناء الصفحة
        items[i].style.display = title.indexOf(searchTerm) > -1 ? "" : "none";
    }
}

// --- وظائف السلة (Cart Functions) ---
function addToCart(gameTitle) {
    if (!cart.includes(gameTitle)) {
        cart.push(gameTitle);
        saveAndRefresh();
        updateButtonsState();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveAndRefresh();
    updateButtonsState();
}

function saveAndRefresh() {
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    updateUI();
}

function updateButtonsState() {
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    buttons.forEach(btn => {
        // استخراج اسم اللعبة من الـ onclick
        const titleMatch = btn.getAttribute('onclick').match(/'([^']+)'/);
        if (titleMatch && cart.includes(titleMatch[1])) {
            btn.innerText = "تمت الإضافة 🦅";
            btn.classList.add('already-added');
            btn.disabled = true;
        } else {
            btn.innerText = "إضافة للسلة";
            btn.classList.remove('already-added');
            btn.disabled = false;
        }
    });
}

function updateUI() {
    const count = document.getElementById('cart-count');
    const list = document.getElementById('cart-list');
    if (count) count.innerText = cart.length;
    if (list) {
        list.innerHTML = cart.map((item, i) => `
            <li style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #333; color:white;">
                <span style="font-size:13px;">${item}</span>
                <button onclick="removeFromCart(${i})" class="remove-btn" style="color:#ff4d4d; background:none; border:none; cursor:pointer;">حذف</button>
            </li>
        `).join('');
    }
}

function generateOrderQR() {
    if (cart.length === 0) return alert("السلة فارغة!");
    const msg = "Order Ahlawy Store:\n" + cart.map((t, i) => `${i+1}-${t}`).join("\n");
    const whatsappUrl = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(msg)}`;
    const qrcodeElement = document.getElementById("qrcode");
    
    if (qrcodeElement) {
        qrcodeElement.innerHTML = ""; 
        document.getElementById('qr-container').style.display = "block"; 
        new QRCode(qrcodeElement, { text: whatsappUrl, width: 250, height: 250 });
        window.currentWhatsappUrl = whatsappUrl;
    }
}

function sendWhatsAppDirect() { if (window.currentWhatsappUrl) window.open(window.currentWhatsappUrl, '_blank'); }
function toggleCart() { document.getElementById('cart-section')?.classList.toggle('open'); }

// التشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    updateUI();
    document.getElementById('game-search')?.addEventListener('input', filterGames);
});