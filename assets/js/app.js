/* ===================================================
   LIDM — Etnomatematika Fort Willem I
   Main JavaScript
   =================================================== */

document.addEventListener('DOMContentLoaded', function () {

    // ===== SIDEBAR TOGGLE =====
    const sidebar         = document.getElementById('sidebar');
    const sidebarOverlay  = document.getElementById('sidebarOverlay');
    const hamburgerBtn    = document.getElementById('hamburgerBtn');

    function openSidebar() {
        if (sidebar)        sidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
    }
    function closeSidebar() {
        if (sidebar)        sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    if (hamburgerBtn)    hamburgerBtn.addEventListener('click', openSidebar);
    if (sidebarOverlay)  sidebarOverlay.addEventListener('click', closeSidebar);

    // Close sidebar when a link is clicked (mobile)
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth < 1024) closeSidebar();
        });
    });

    // ===== ACTIVE SIDEBAR LINK =====
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    sidebarLinks.forEach(function (link) {
        const href = link.getAttribute('href');
        if (href && (href === currentPage || href.includes(currentPage))) {
            link.classList.add('active');
        }
    });

    // ===== FLIP CARD =====
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(function (card) {
        card.addEventListener('click', function () {
            card.classList.toggle('flipped');
        });
    });

    // ===== QUIZ LOGIC =====
    const quizOptions = document.querySelectorAll('.quiz-option');
    quizOptions.forEach(function (option) {
        option.addEventListener('click', function () {
            const group = option.closest('.quiz-group');
            if (!group) return;

            // Deselect all in group
            group.querySelectorAll('.quiz-option').forEach(function (opt) {
                opt.classList.remove('selected');
            });

            // Select clicked
            option.classList.add('selected');
        });
    });

    // ===== CHECK ANSWER BUTTON =====
    const checkBtns = document.querySelectorAll('.check-answer-btn');
    checkBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const group = btn.closest('.quiz-group');
            if (!group) return;

            const selected = group.querySelector('.quiz-option.selected');
            if (!selected) {
                alert('Pilih salah satu jawaban terlebih dahulu!');
                return;
            }

            const isCorrect = selected.dataset.correct === 'true';
            const feedback  = group.querySelector('.quiz-feedback');

            // Reset all
            group.querySelectorAll('.quiz-option').forEach(function (opt) {
                opt.classList.remove('correct', 'wrong');
            });

            if (isCorrect) {
                selected.classList.add('correct');
                if (feedback) {
                    feedback.textContent = '✅ Jawaban Benar!';
                    feedback.style.color = '#2E7D32';
                }
            } else {
                selected.classList.add('wrong');
                // Highlight correct answer
                group.querySelectorAll('.quiz-option').forEach(function (opt) {
                    if (opt.dataset.correct === 'true') opt.classList.add('correct');
                });
                if (feedback) {
                    feedback.textContent = '❌ Jawaban Kurang Tepat. Coba lagi!';
                    feedback.style.color = '#E53935';
                }
            }
        });
    });

    // ===== FADE IN ANIMATION ON SCROLL =====
    const fadeEls = document.querySelectorAll('.fade-on-scroll');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        fadeEls.forEach(function (el) { observer.observe(el); });
    }

    // ===== ZIGZAG SVG LINES (for menu.html) =====
    function drawZigzagLines() {
        var wrapper = document.getElementById('zzWrapper');
        var svg     = document.getElementById('zzSvg');
        if (!wrapper || !svg) return;

        var nodes    = Array.from(wrapper.querySelectorAll('.zz-node'));
        var wrapRect = wrapper.getBoundingClientRect();
        var W        = wrapRect.width;
        var totalH   = wrapRect.height;

        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + totalH);
        svg.style.height = totalH + 'px';

        while (svg.firstChild) svg.removeChild(svg.firstChild);

        var NS = 'http://www.w3.org/2000/svg';
        nodes.forEach(function (node, i) {
            if (i >= nodes.length - 1) return;
            var r1 = node.getBoundingClientRect();
            var r2 = nodes[i + 1].getBoundingClientRect();
            var x1 = r1.left - wrapRect.left + r1.width  / 2;
            var y1 = r1.top  - wrapRect.top  + r1.height / 2;
            var x2 = r2.left - wrapRect.left + r2.width  / 2;
            var y2 = r2.top  - wrapRect.top  + r2.height / 2;

            var line = document.createElementNS(NS, 'line');
            line.setAttribute('x1', x1.toFixed(1));
            line.setAttribute('y1', y1.toFixed(1));
            line.setAttribute('x2', x2.toFixed(1));
            line.setAttribute('y2', y2.toFixed(1));
            line.setAttribute('stroke', '#D4A017');
            line.setAttribute('stroke-width', '6');
            line.setAttribute('stroke-dasharray', '12 8');
            line.setAttribute('stroke-linecap', 'round');
            line.setAttribute('opacity', '0.6');
            svg.appendChild(line);
        });
    }

    drawZigzagLines();
    setTimeout(drawZigzagLines, 300);

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(drawZigzagLines, 60);
    });

});
