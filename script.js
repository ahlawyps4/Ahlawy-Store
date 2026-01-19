/* ============ AHLAWY STORE - FINAL SYSTEM v1.02 ============ */

// تعريف السلة وتحميلها من الذاكرة المحلية
let cart = JSON.parse(localStorage.getItem('ahlawy_cart')) || [];

// 1. دالة تحميل الألعاب (معدلة لتعمل على GitHub Pages)
async function loadGames() {
    // تحديد المسار الأساسي للمشروع على جيت هاب
    const repoName = '/Ahlawy-Store/';
    const isSubFolder = window.location.pathname.includes('/PS4/') || window.location.pathname.includes('/PS5/');
    
    // الحل السحري: استخدام المسار الكامل للملف لضمان وصول المتصفح إليه
    const jsonPath = window.location.origin + repoName + 'games.json';
    
    try {
        console.log("حاول جلب البيانات من:", jsonPath); // لمراقبة العملية
        const response = await fetch(jsonPath); 
        if (!response.ok) throw new Error("لم يتم العثور على ملف الألعاب");
        
        const games = await response.json();
        const container = document.getElementById('games-container');
        const currentPlatform = document.body.getAttribute('data-platform'); 

        if (!container) return;
        container.innerHTML = '';
        
        const filteredGames = games.filter(game => game.platform === currentPlatform);

        if (filteredGames.length === 0) {
            container.innerHTML = "<p style='text-align:center;'>لا توجد ألعاب حالياً</p>";
            return;
        }

        filteredGames.forEach(game => {
            // مسار الصور الكامل
            const imagePath = window.location.origin + repoName + game.img;
            
            container.innerHTML += `
                <div class="game-item">
                    <div class="game-media">
                        <img src="${imagePath}" alt="${game.title}" onerror="this.src='${window.location.origin + repoName}logo.png'">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button class="add-to-cart-btn" onclick="addToCart('${game.title.replace(/'/g, "\\"')}')">إضافة للسلة</button>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error("حدث خطأ:", error);
        document.getElementById('games-container').innerHTML = "<p>عذراً، حدث خطأ أثناء تحميل الألعاب.</p>";
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
                    <span style="font-size:12px; color:#fff; flex:1; text-align:right;">${item}</span>
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

// تشغيل جلب الألعاب فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadGames);