// special.js
document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('specials-list-container');
    if (!listContainer) return;

    // Load live special deals
    function loadLiveSpecials() {
        db.collection('specials').where('active', '==', true).onSnapshot(snapshot => {
            listContainer.innerHTML = ''; // Clear loading or default static content

            if (snapshot.empty) {
                listContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #868e96;">현재 진행 중인 특가 상품이 없습니다. 시세표를 확인해주세요.</div>';
                return;
            }

            // JavaScript sorting to bypass the Firebase Composite Index requirement
            const deals = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                deals.push(data);
            });

            deals.sort((a, b) => {
                const dateA = a.createdAt ? a.createdAt.toMillis() : 0;
                const dateB = b.createdAt ? b.createdAt.toMillis() : 0;
                return dateB - dateA;
            });

            deals.forEach(data => {

                // Build benefit list
                let benefitsHtml = '';
                if (data.benefits && Array.isArray(data.benefits)) {
                    data.benefits.forEach(b => {
                        benefitsHtml += `<li>${escapeHTML(b)}</li>`;
                    });
                }

                // Temporary generic image selector based on name
                let type = 'galaxy'; // default
                if (data.name.toLowerCase().includes('iphone') || data.name.includes('아이폰')) {
                    type = 'iphone';
                }

                const itemDiv = document.createElement('div');
                itemDiv.className = 'card';
                itemDiv.innerHTML = `
                    <div class="card-badge">${escapeHTML(data.badge)}</div>
                    <h3>${escapeHTML(data.name)}</h3>
                    <p class="price-origin">${escapeHTML(data.originPrice)}</p>
                    <p class="price-sale">행사가 <span>${escapeHTML(data.salePrice)}</span></p>
                    <ul class="benefit-list">
                        ${benefitsHtml}
                    </ul>
                    <a href="index.html#location" class="cta-button" style="padding: 0.8rem 2rem; font-size: 1.1rem; width: 100%; justify-content: center;">지금 바로 문의하기</a>
                `;
                listContainer.appendChild(itemDiv);
            });
        }, error => {
            console.error("Error loading live specials:", error);
            // On error, let the existing static HTML show or show an error
            listContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: red;">특가 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</div>';
        });
    }

    // Security wrapper for injected HTML
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
    }

    loadLiveSpecials();

    // Countdown Timer Logic (To Midnight)
    const countdownEl = document.getElementById('countdown-clock');
    if (countdownEl) {
        let lastTime = 0;
        function updateCountdown(timestamp) {
            if (!lastTime || timestamp - lastTime >= 1000) {
                lastTime = timestamp;
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setHours(24, 0, 0, 0); // Next midnight

                const diffMs = tomorrow - now;

                const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diffMs % (1000 * 60)) / 1000);

                const formattedH = String(h).padStart(2, '0');
                const formattedM = String(m).padStart(2, '0');
                const formattedS = String(s).padStart(2, '0');

                countdownEl.textContent = `${formattedH}:${formattedM}:${formattedS}`;
            }
            requestAnimationFrame(updateCountdown);
        }

        requestAnimationFrame(updateCountdown);
    }
});
