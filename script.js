/* ============ AHLAWY STORE ENGINE - v2.2 (FINAL) ============ */

// 1. إدارة السلة (جلب البيانات المخزنة)
let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];

// 2. دالة جلب الألعاب من ملف JSON
async function loadGames() {
    // تحديد المسارات الذكية لضمان عمل الموقع داخل المجلدات (PS4/PS5)
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

        // تصفية الألعاب حسب القسم (PS4 أو PS5)
        const filtered = games.filter(g => g.platform === platform);

        if (filtered.length === 0) {
            container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>قريباً.. أحدث الألعاب</p>";
            return;
        }

        filtered.forEach(game => {
            // المسار الصحيح للصورة
            const imgUrl = baseAssetPath + game.img;
            
            container.innerHTML += `
                <div class="game-item">
                    <div class="game-media">
                        <img src="${imgUrl}" alt="${game.title}" onerror="this.src='${baseAssetPath}logo.png'">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button class="add-to-cart-btn" onclick="addToCart('${game.title.replace(/'/g, "\\")}')">إضافة للسلة</button>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("خطأ في التحميل:", err);
    }
}

// 3. وظائف السلة
function addToCart(gameTitle) {
    cart.push(gameTitle);
    saveAndRefresh();
    // فتح السلة تلقائياً عند إضافة لعبة
    document.getElementById('cart-section').classList.add('open');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    updateUI();
}

function updateUI() {
    const count = document.getElementById('cart-count');
    const list = document.getElementById('cart-list');
    if (count) count.innerText = cart.length;
    if (list) {
        list.innerHTML = cart.map((item, i) => `
            <li style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #333; color:white;">
                <span style="font-size:13px; text-align:right;">${item}</span>
                <button onclick="removeFromCart(${i})" style="color:#ff4d4d; background:none; border:none; cursor:pointer; font-weight:bold; padding:5px;">حذف</button>
            </li>
        `).join('');
    }
}

function toggleCart() {
    const cartSection = document.getElementById('cart-section');
    if (cartSection) cartSection.classList.toggle('open');
}

// 4. إرسال الطلب واتساب
function sendWhatsApp() {
    if (cart.length === 0) {
        alert("السلة فارغة! أضف بعض الألعاب أولاً.");
        return;
    }
    const msg = "طلب جديد من أهلاوي ستور 🦅:\n" + cart.map((t, i) => `${i+1}- ${t}`).join("\n");
    window.open(`https://wa.me/201021424781?text=${encodeURIComponent(msg)}`);
}

// تشغيل الدوال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    updateUI();
});