/* ============ AHLAWY STORE - FINAL REPAIR ============ */

let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];

// 1. دالة تحميل الألعاب (تم التأكد من المسارات)
async function loadGames() {
    console.log("جاري محاولة تحميل الألعاب..."); // للتأكد أن الدالة تعمل
    try {
        // الخروج من مجلد PS4 للوصول لملف games.json
        const response = await fetch('../games.json'); 
        
        if (!response.ok) throw new Error("فشل الوصول لملف JSON");
        
        const games = await response.json();
        const container = document.getElementById('games-container');
        const currentPlatform = document.body.getAttribute('data-platform');

        if (!container) {
            console.error("خطأ: لم يتم العثور على games-container");
            return;
        }

        container.innerHTML = '';
        
        // تصفية الألعاب
        const filteredGames = games.filter(game => game.platform === currentPlatform);
        console.log("عدد الألعاب التي تم العثور عليها:", filteredGames.length);

        if (filteredGames.length === 0) {
            container.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>لا توجد ألعاب لهذه المنصة حالياً.</p>";
            return;
        }

        filteredGames.forEach(game => {
            const card = `
                <div class="game-item">
                    <div class="game-media">
                        <img src="../${game.img}" alt="${game.title}" onerror="this.src='../logo.png'">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button class="add-to-cart-btn" onclick="addToCart('${game.title.replace(/'/g, "\\'")}')">إضافة للسلة</button>
                    </div>
                </div>`;
            container.innerHTML += card;
        });

        // تحديث واجهة السلة عند التحميل
        updateCartCount();
        updateCartList();

    } catch (error) {
        console.error("حدث خطأ فني:", error);
        document.getElementById('games-container').innerHTML = `<p style='text-align:center; color:red;'>حدث خطأ في تحميل الألعاب: ${error.message}</p>`;
    }
}

// 2. وظائف السلة
function toggleCart() {
    const cartSection = document.getElementById('cart-section');
    if (cartSection) {
        cartSection.classList.toggle('open');
    }
}

function addToCart(title) {
    cart.push(title);
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    updateCartCount();
    updateCartList();
    
    const cartSection = document.getElementById('cart-section');
    if (cartSection && !cartSection.classList.contains('open')) {
        cartSection.classList.add('open');
    }
}

function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) countElement.innerText = cart.length;
}

function updateCartList() {
    const listElement = document.getElementById('cart-list');
    if (listElement) {
        if (cart.length === 0) {
            listElement.innerHTML = '<li style="color:#888; text-align:center; padding:10px;">السلة فارغة</li>';
        } else {
            listElement.innerHTML = cart.map((item, index) => `
                <li style="display:flex; justify-content:space-between; align-items:center; background:#222; padding:8px; margin-bottom:8px; border-radius:5px;">
                    <span style="font-size:12px;">${item}</span>
                    <button onclick="removeFromCart(${index})" style="background:#ff4444; border:none; color:white; padding:2px 6px; border-radius:3px; cursor:pointer;">×</button>
                </li>
            `).join('');
        }
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('ahlawy_cart', JSON.stringify(cart));
    updateCartCount();
    updateCartList();
}

function clearCart() {
    if(confirm("هل تريد إفراغ السلة؟")) {
        cart = [];
        localStorage.removeItem('ahlawy_cart');
        updateCartCount();
        updateCartList();
    }
}

function sendWhatsApp() {
    if (cart.length === 0) return alert("السلة فارغة!");
    const message = "مرحباً أهلاوي ستور 🦅، أريد طلب الألعاب التالية:\n\n" + cart.map((t, i) => `${i+1}- ${t}`).join("\n");
    window.open(`https://wa.me/201021424781?text=${encodeURIComponent(message)}`);
}

// تشغيل التحميل عند فتح الصفحة مباشرة
document.addEventListener('DOMContentLoaded', loadGames);