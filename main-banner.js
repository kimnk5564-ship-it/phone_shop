// main-banner.js
document.addEventListener('DOMContentLoaded', () => {
    const badgeEl = document.getElementById('hero-badge');
    const titleEl = document.getElementById('hero-title');
    const subtitleEl = document.getElementById('hero-subtitle');
    const noticeBar = document.getElementById('site-notice-bar');
    const noticeTextEl = document.getElementById('site-notice-text');

    if (!titleEl) return; // Only run on index

    function updateBanner() {
        db.collection('contents').doc('main_banner').get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();

                // Update Badge
                if (data.badge && badgeEl) badgeEl.innerHTML = data.badge;

                // Update Title & Catchphrase
                if (data.title && data.catchphrase && titleEl) {
                    titleEl.innerHTML = `
                    <span class="title-catchphrase" id="hero-catchphrase">${data.catchphrase}</span><br>
                    ${data.title}
                    `;
                }

                // Update Subtitle
                if (data.subtitle && subtitleEl) subtitleEl.innerHTML = data.subtitle;

                // Notice Bar Logic
                if (data.notice_active && noticeBar && noticeTextEl) {
                    noticeTextEl.textContent = data.notice_text;
                    noticeBar.style.display = 'block';
                } else if (noticeBar) {
                    noticeBar.style.display = 'none';
                }
            }
        }).catch((error) => {
            console.error("Error fetching main banner data:", error);
        });
    }

    // Call on load
    updateBanner();
});
