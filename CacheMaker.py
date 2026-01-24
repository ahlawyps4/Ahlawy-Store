import os
from datetime import datetime

# الإعدادات
EXCLUDED_DIRS = {'.venv', '.git', 'noneed', '__pycache__', 'node_modules'}
EXCLUDED_EXTENSIONS = {
    '.bat', '.txt', '.exe', '.mp4', '.py', '.bak', '.zip',
    '.mp3', '.sh', '.h', '.c', '.o', '.ld', '.d', '.dockerignore', '.pyc'
}
# استبعاد sw.js و manifest.json لمنع التعارض مع كاش الـ PS4 القديم
EXCLUDED_FILES = {
    '.gitignore', 'COPYING', 'LICENSE', 'MAKEFILE', 'Makefile', 
    'README.md', 'dockerfile', '.gitinclude', 'sw.js', 'manifest.json'
}
OUTPUT_FILE = 'PSFree.manifest'

def create_manifest():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    manifest_path = os.path.join(root_dir, OUTPUT_FILE)
    
    # قوائم لتنظيم الترتيب
    core_files = []
    assets_files = []

    # البحث في كل المجلدات
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # استبعاد المجلدات غير المطلوبة
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        
        for filename in filenames:
            ext = os.path.splitext(filename)[1].lower()
            
            # الشروط: استبعاد الممنوعات
            if (ext in EXCLUDED_EXTENSIONS or 
                filename in EXCLUDED_FILES or 
                filename == OUTPUT_FILE):
                continue
            
            filepath = os.path.join(dirpath, filename)
            relpath = os.path.relpath(filepath, root_dir).replace(os.sep, '/')
            
            # وضع الملفات الأساسية في البداية لضمان عمل الواجهة أولاً
            if filename in ['index.html', 'style.css', 'script.js', 'games.json', 'qrcode.min.js']:
                core_files.append(relpath)
            else:
                assets_files.append(relpath)

    # ترتيب الصور أبجدياً لضمان الدقة
    assets_files.sort()

    with open(manifest_path, 'w', encoding='utf-8') as f:
        f.write("CACHE MANIFEST\n")
        f.write(f"# Version: {datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}\n")
        f.write("# Ahlawy Store - Total Files: " + str(len(core_files) + len(assets_files)) + "\n\n")
        
        f.write("CACHE:\n")
        
        # 1. كتابة الملفات الأساسية أولاً
        for file in core_files:
            f.write(f"{file}\n")
            
        # 2. كتابة الصور وبقية الملفات
        for file in assets_files:
            f.write(f"{file}\n")
        
        # 3. قسم الشبكة
        f.write("\nNETWORK:\n")
        f.write("*\n")
        f.write("https://wa.me/\n")
        f.write("https://api.whatsapp.com/\n")

    print(f"✅ تم إنشاء {OUTPUT_FILE} بنجاح!")
    print(f"📦 إجمالي الملفات المسجلة: {len(core_files) + len(assets_files)}")
    print(f"🚀 المانيفست الآن جاهز لمتصفح PS4.")

if __name__ == "__main__":
    create_manifest()