document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('custom-spinwheel');
    const spinBtn = document.getElementById('custom-spin-btn');
    const resultText = document.getElementById('spin-result');
    
    if (!canvas || !spinBtn) return;

    const ctx = canvas.getContext('2d');
    
    // Konfigurasi Segmen 1-8 sesuai permintaan
    const segments = [
        "Kelompok 1", "Kelompok 2", "Kelompok 3", "Kelompok 4", 
        "Kelompok 5", "Kelompok 6", "Kelompok 7", "Kelompok 8"
    ];
    
    // Palet warna elegan sesuai tema aplikasi (Gold, Hijau Accent, Cokelat, Gold Terang)
    const colors = [
        '#D4A017', '#2E7D32', '#7B3F00', '#F5D060', 
        '#D4A017', '#2E7D32', '#7B3F00', '#F5D060'
    ];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX;
    const items = segments.length;
    const arc = (Math.PI * 2) / items;
    
    let currentRotation = 0;
    let isSpinning = false;

    // Fungsi Render Roda Gila
    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 24px Montserrat, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';

        for (let i = 0; i < items; i++) {
            const angle = i * arc;
            
            // Gambar juring pizza
            ctx.beginPath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
            ctx.lineTo(centerX, centerY);
            ctx.fill();
            
            // Garis putih sebagai pemisah antar juring
            ctx.save();
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#FDF8F0'; 
            ctx.stroke();
            ctx.restore();

            // Teks Label Kelompok
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + arc / 2);
            ctx.fillStyle = '#FFFFFF';
            // Berikan bayangan agas teks terbaca jelas di atas warna terang maupun gelap
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillText(segments[i], radius - 35, 0);
            ctx.restore();
        }
    }

    drawWheel(); // Initial draw

    // Logic Putaran Roda
    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        isSpinning = true;

        // Reset hasil teks
        resultText.style.opacity = '0';
        resultText.style.transform = 'scale(0.9)';
        
        // Tentukan jumlah rotasi penuh acak dan sisa sudut acak
        const spins = Math.floor(Math.random() * 5) + 5; // Minimal 5 rotasi (kencang dulu)
        const randomDegree = Math.floor(Math.random() * 360);
        const totalDegree = (spins * 360) + randomDegree;
        
        currentRotation += totalDegree;
        
        // Jalankan transisi putaran via CSS yang didefinisikan di HTML
        canvas.style.transform = `rotate(${currentRotation}deg)`;
        
        // Analisis setelah animasi selesai (4000ms cocok dengan durasi CSS class string)
        setTimeout(() => {
            const normalizedRotation = currentRotation % 360;
            
            // Jarum pointer ada di sisi atas roda (12 o'clock atau setara sudut 270 derajat default draw)
            // Rumus menentukan juring yang ditunjuk pointer di atas setelah rotasi:
            let pointedAngle = (270 - normalizedRotation + 360) % 360;
            let winningIndex = Math.floor(pointedAngle / (360 / items));
            
            // Tampilkan hasil
            resultText.innerHTML = `🎯 Pilihan Jatuh Pada:  <span class="text-primary font-black ml-1">${segments[winningIndex]}</span>!`;
            resultText.style.opacity = '1';
            resultText.style.transform = 'scale(1)';
            
            isSpinning = false;
        }, 4000);
    });
});
