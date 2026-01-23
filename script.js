/* ============ AHLAWY STORE ENGINE - v4.0 (OFFLINE + PROGRESS BAR) ============ */

let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];
const STORE_PHONE = "201018251103";

// --- كود تسجيل الـ Service Worker مع استقبال نسبة التحميل ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // قمنا بتغيير المسار ليكون نسبي لضمان عمله في كل المجلدات
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('تم تفعيل نظام الأوفلاين 🦅');
                
                // الاستماع للرسائل القادمة من sw.js (النسبة المئوية)
                navigator.serviceWorker.addEventListener('message', event => {
                    if (event.data.type === 'CACHE_PROGRESS') {
                        updateProgressBar(event.data.progress);
                    }
                });
            })
            .catch(err => console.log('فشل تفعيل نظام الأوفلاين ❌', err));
    });
}

// دالة تحديث شريط التحميل في الواجهة
function updateProgressBar(progress) {
    const progressBarContainer = document.getElementById('cache-progress-container');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const percentVal = document.getElementById('percent-val');
    const statusMsg = document.getElementById('status-msg');

    if (progressBarContainer && progressBarFill && percentVal) {
        progressBarContainer.style.display = 'block'; // إظهار العداد
        progressBarFill.style.width = progress + '%';
        percentVal.innerText = progress;

        if (progress === 100) {
            statusMsg.innerHTML = "✅ تم حفظ المتجر! يمكنك الآن التصفح بدون إنترنت.";
            // إخفاء العداد بعد ثانيتين من الاكتمال
            setTimeout(() => {
                progressBarContainer.style.display = 'none';
            }, 3000);
        }
    }
}

async function loadGames() {
    const isSubFolder = window.location.pathname.includes('/PS4/') || window.location.pathname.includes('/PS5/');
    const jsonPath = isSubFolder ? '../games.json' : './games.json';
    const baseAssetPath = isSubFolder ? '../' : './';

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error("بيانات الألعاب غير موجودة");
        
        const games = await response.json();
        const container = document.getElementById('games-container');
        const platform = document.body.getAttribute('data-platform');

        if (!container || !platform) return;
        container.innerHTML = '';

        const filtered = games.filter(g => g.platform === platform);

        if (filtered.length === 0) {
            container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>قريباً.. أحدث الألعاب</p>";
            return;
        }

        filtered.forEach(game => {
            const imgUrl = baseAssetPath + game.img;
            const isInCart = cart.includes(game.title);
            
            container.innerHTML += `
                <div class="game-item">
                    <div class="game-media">
                        <img src="${imgUrl}" alt="${game.title}" onerror="this.src='${baseAssetPath}logo.png'">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button 
                            class="add-to-cart-btn ${isInCart ? 'already-added' : ''}" 
                            onclick="addToCart('${game.title.replace(/'/g, "\\")}')"
                            ${isInCart ? 'disabled' : ''}>
                            ${isInCart ? 'تمت الإضافة 🦅' : 'إضافة للسلة'}
                        </button>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

// --- باقي الدوال (addToCart, updateUI, إلخ) تبقى كما هي دون تغيير لضمان استقرار السلة ---

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
    const allButtons = document.querySelectorAll('.add-to-cart-btn');
    allButtons.forEach(btn => {
        const titleMatch = btn.getAttribute('onclick').match(/'([^']+)'/);
        if (titleMatch) {
            const gameTitle = titleMatch[1];
            if (cart.includes(gameTitle)) {
                btn.innerText = "تمت الإضافة 🦅";
                btn.classList.add('already-added');
                btn.disabled = true;
            } else {
                btn.innerText = "إضافة للسلة";
                btn.classList.remove('already-added');
                btn.disabled = false;
            }
        }
    });
}

function updateUI() {
    const count = document.getElementById('cart-count');
    const list = document.getElementById('cart-list');
    const qrContainer = document.getElementById('qr-container');
    
    if (count) count.innerText = cart.length;
    
    if (list) {
        list.innerHTML = cart.map((item, i) => `
            <li style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #333; color:white;">
                <span style="font-size:13px; text-align:right;">${item}</span>
                <button onclick="removeFromCart(${i})" class="remove-btn" style="color:#ff4d4d; background:none; border:none; cursor:pointer; padding: 5px;">حذف</button>
            </li>
        `).join('');
    }
    if (qrContainer) qrContainer.style.display = "none";
}

function generateOrderQR() {
    const qrContainer = document.getElementById('qr-container');
    const qrcodeElement = document.getElementById("qrcode");
    if (cart.length === 0) return alert("السلة فارغة!");
    
    const msg = "Order Ahlawy Store:\n" + cart.map((t, i) => `${i+1}-${t}`).join("\n");
    const whatsappUrl = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(msg)}`;

    qrcodeElement.innerHTML = ""; 
    qrContainer.style.display = "block"; 

    new QRCode(qrcodeElement, {
        text: whatsappUrl, 
        width: 250, 
        height: 250, 
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });
    window.currentWhatsappUrl = whatsappUrl;
}

function sendWhatsAppDirect() {
    if (window.currentWhatsappUrl) window.open(window.currentWhatsappUrl, '_blank');
}

function toggleCart() {
    const cartSection = document.getElementById('cart-section');
    if (cartSection) cartSection.classList.toggle('open');
}

document.addEventListener('click', (event) => {
    const cartSection = document.getElementById('cart-section');
    const cartTrigger = document.querySelector('.cart-trigger');
    
    if (cartSection && cartSection.classList.contains('open')) {
        const isClickInsideCart = cartSection.contains(event.target);
        const isClickOnTrigger = (cartTrigger && cartTrigger.contains(event.target));
        const isClickOnAddBtn = event.target.classList.contains('add-to-cart-btn');
        const isClickOnRemoveBtn = event.target.classList.contains('remove-btn');

        if (!isClickInsideCart && !isClickOnTrigger && !isClickOnAddBtn && !isClickOnRemoveBtn) {
            cartSection.classList.remove('open');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    updateUI();

    const searchInput = document.getElementById('game-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterGames);
    }
});

function filterGames() {
    const searchInput = document.getElementById('game-search');
    if(!searchInput) return;
    const searchTerm = searchInput.value.toLowerCase();
    const gameItems = document.querySelectorAll('.game-item');

    gameItems.forEach(item => {
        const gameTitle = item.querySelector('h3').innerText.toLowerCase();
        item.style.display = gameTitle.includes(searchTerm) ? "block" : "none";
    });
}