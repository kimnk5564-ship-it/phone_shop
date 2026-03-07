document.addEventListener('DOMContentLoaded', () => {

    // 1. Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');

    // Function to apply theme
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                applyTheme('light');
            } else {
                applyTheme('dark');
            }
        });
    }

    // 2. Scroll Reveal Animations
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });

    // 3. Real-time Toast Notifications
    const toastContainer = document.getElementById('toast-container');
    const messages = [
        "🔥 방금 서울 영등포점에서 아이폰 17 PRO 개통 완료!",
        "🚀 10분 전 하남점에서 Z플립7 상담이 진행되었습니다.",
        "🎉 경기도 성남점 S26 울트라 재고 소량 입고!",
        "⭐ 김*호 고객님 외 24명이 오늘 성지 할인을 받았습니다.",
        "🔥 경기도 광명점에서 Z플립7 특가 알림 발생!"
    ];

    function showToast() {
        if (!toastContainer) return;

        const msg = messages[Math.floor(Math.random() * messages.length)];
        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.innerHTML = `<span>💬</span> <span>${msg}</span>`;

        toastContainer.appendChild(toast);

        // Trigger reflow for animation
        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400); // Wait for transition out
        }, 3500); // Time to show on screen
    }

    // Show first toast after 3 seconds, then periodically
    if (toastContainer) {
        setTimeout(() => {
            showToast();
            setInterval(showToast, Math.random() * 8000 + 10000); // Every 10-18 seconds
        }, 3000);
    }

    // 4. Update Header Nav on Scroll (Optional but good for UX)
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                navbar.style.padding = '0';
            } else {
                navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.05)';
            }
        });
    }
});
