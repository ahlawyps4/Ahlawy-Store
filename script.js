/* ============ AHLAWY STORE - FINAL SYSTEM v1.02 ============ */

let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];

// 1. دالة تحميل الألعاب (معدلة لضمان العرض)
async function loadGames() {
    console.log("جاري تحميل البيانات من games.json..."); 
    try {
        // الخروج من مجلد PS4 للوصول للمجلد الرئيسي
        const response = await fetch('../games.json'); 
        
        if (!response.ok) throw new Error("لم يتم العثور على ملف games.json - تأكد من مكانه في المجلد الرئيسي");
        
        const games = await response.json();
        const container = document.getElementById('games-container');
        const currentPlatform = document.body.getAttribute('data-platform');

        if (!container) return;
        container.innerHTML = '';
        
        const filteredGames = games.filter(game => game.platform === currentPlatform);
        console.log("تم العثور على ألعاب لمنصة:", currentPlatform, filteredGames.length);

        if (filteredGames.length === 0) {
            container.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>لا توجد ألعاب حالياً لهذه المنصة.</p>";
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
                        <button class="add-to-cart-btn" onclick="addToCart('${game.title.replace(/'/g, "\\"')}')">إضافة للسلة</button>
                    </div>
                </div>`;
            container.innerHTML += card;
        });

        updateCartCount();
        updateCartList();

    } catch (error) {
        console.error("خطأ فني في التحميل:", error);
        if (document.getElementById('games-container')) {
            document.getElementById('games-container').innerHTML = `<p style='grid-column: 1/-1; text-align:center; color:red;'>فشل تحميل الألعاب: ${error.message}</p>`;
        }
    }
}

// 2. وظائف السلة واللوحة الجانبية
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
    
    // فتح السلة تلقائياً عند الإضافة
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
    const qrContainer = document.getElementById('qr-container');
    
    if (listElement) {
        if (cart.length === 0) {
            listElement.innerHTML = '<li style="color:#888; text-align:center; padding:10px;">السلة فارغة</li>';
            if (qrContainer) qrContainer.style.display = 'none';
        } else {
            listElement.innerHTML = cart.map((item, index) => `
                <li style="display:flex; justify-content:space-between; align-items:center; background:#222; padding:8px; margin-bottom:8px; border-radius:5px; border:1px solid #333;">
                    <span style="font-size:12px; color:#fff; text-align:right; flex:1; padding-right:5px;">${item}</span>
                    <button onclick="removeFromCart(${index})" style="background:#ff4444; border:none; color:white; padding:2px 6px; border-radius:3px; cursor:pointer; margin-right:10px;">×</button>
                </li>
            `).join('');
            
            // توليد الـ QR تلقائياً
            generateQR();
        }
    }
}

// 3. دالة توليد الـ QR Code
function generateQR() {
    const qrDiv = document.getElementById('qrcode');
    const qrContainer = document.getElementById('qr-container');
    
    if (cart.length > 0 && qrDiv) {
        qrDiv.innerHTML = ""; 
        qrContainer.style.display = 'block';
        
        const orderText = "طلب جديد من أهلاوي ستور 🦅:\n" + cart.map((t, i) => `${i+1}- ${t}`).join("\n");
        
        new QRCode(qrDiv, {
            text: orderText,
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
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

document.addEventListener('DOMContentLoaded', loadGames);