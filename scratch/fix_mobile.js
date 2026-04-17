const fs = require('fs');
const path = require('path');

const files = ['pertemuan-1.html', 'pertemuan-2.html'];

for (const file of files) {
    const filePath = path.join('d:/Kuliah/LIDM', file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Fix Margin bottom CSS
    content = content.replace(/margin-bottom: 120px;/g, 'margin-bottom: 85px;');

    // 2. Bottom Navbar Padding
    content = content.replace(/pb-6 sm:pb-8/g, 'pb-3 sm:pb-5');
    content = content.replace(/py-2\.5 sm:py-3/g, 'py-2 sm:py-3');

    // 3. Card p-6 to p-4 md:p-6
    content = content.replace(/ p-6 /g, ' p-4 md:p-6 ');
    content = content.replace(/"p-6 /g, '"p-4 md:p-6 ');
    content = content.replace(/ p-6"/g, ' p-4 md:p-6"');

    // 4. Shrink header icons and text
    content = content.replace(/w-12 h-12 bg-/g, 'w-10 h-10 md:w-12 md:h-12 bg-');
    content = content.replace(/<span class="text-2xl">/g, '<span class="text-xl md:text-2xl">');
    content = content.replace(/text-xl text-primary/g, 'text-lg md:text-xl text-primary');

    // 5. General text size adjustments -> replace "text-text-main" without "text-sm" next to it?
    // Actually, the main issue is in "bg-cream rounded-xl p-6 border border-gold/10 space-y-4 text-text-main leading-relaxed"
    // Let's explicitly target that container's class string:
    content = content.replace(/text-text-main leading-relaxed/g, 'text-sm text-text-main leading-relaxed text-justify');
    
    // Clean up if it resulted in "text-sm text-sm"
    content = content.replace(/text-sm text-sm/g, 'text-sm');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
}
