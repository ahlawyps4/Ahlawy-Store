/* ============ AHLAWY STORE - SERVICE WORKER (PS4 + PROGRESS COUNTER) ============ */
const CACHE_NAME = 'ahlawy-v5'; // رفعنا الإصدار للتحديث الجديد

const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './games.json',
  './logo.png',
  './ps4.png',
  './ps5.png',
  './qrcode.min.js',
  './PS4/index.html',
  './PS5/index.html'
];

// 1. مرحلة التثبيت مع إرسال النسبة المئوية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      let downloaded = 0;
      console.log('بداية الحفظ لمتجر أهلاوي... 🦅');

      for (const url of assets) {
        try {
          await cache.add(url);
          downloaded++;
          
          // حساب النسبة المئوية
          const progress = Math.round((downloaded / assets.length) * 100);
          
          // إرسال النسبة لجميع النوافذ المفتوحة (الـ PS4 سيفهمها)
          const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
          clients.forEach(client => {
            client.postMessage({ type: 'CACHE_PROGRESS', progress: progress });
          });
          
        } catch (err) {
          console.error('فشل حفظ ملف معين ولكن سنستمر:', url);
        }
      }
    })
  );
  self.skipWaiting();
});

// 2. تفعيل الكاش الجديد ومسح القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. جلب الملفات (أوفلاين) وحفظ الصور الجديدة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request).then(networkResponse => {
        // إذا كانت صورة جديدة لم تكن في القائمة، احفظها تلقائياً
        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.url.match(/\.(jpg|jpeg|png)$/)) {
          return caches.match('./logo.png');
        }
      });
    })
  );
});