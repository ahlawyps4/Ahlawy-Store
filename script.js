async function loadGames() {
    try {
        // الخروج للمجلد الرئيسي لجلب ملف البيانات
        const response = await fetch('../games.json'); 
        const games = await response.json();
        const container = document.getElementById('games-container');
        const currentPlatform = document.body.getAttribute('data-platform');

        if (!container) return;
        container.innerHTML = '';

        // تصفية الألعاب بناءً على المنصة (PS4 أو PS5)
        const filteredGames = games.filter(game => game.platform === currentPlatform);

        filteredGames.forEach(game => {
            const card = `
                <div class="game-item">
                    <div class="game-media">
                        <img src="../${game.img}" alt="${game.title}" loading="lazy">
                    </div>
                    <div class="game-content">
                        <h3>${game.title}</h3>
                        <button class="add-to-cart-btn" onclick="addToCart('${game.title}')">إضافة للسلة</button>
                    </div>
                </div>`;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error("خطأ في تحميل الألعاب:", error);
        document.getElementById('games-container').innerHTML = "<p>عذراً، فشل تحميل الألعاب.</p>";
    }
}

// دالة مبسطة للإضافة للسلة
function addToCart(title) {
    alert("تم إضافة " + title + " إلى السلة");
    // هنا يمكنك إضافة منطق تحديث السلة والـ QR لاحقاً
}

document.addEventListener('DOMContentLoaded', loadGames);