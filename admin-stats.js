// admin-stats.js
document.addEventListener('DOMContentLoaded', () => {
    const statsContainer = document.getElementById('admin-location-stats');
    if (!statsContainer) return;

    function loadLocationStats() {
        db.collection('stats').doc('location_clicks').onSnapshot(doc => {
            statsContainer.innerHTML = '';

            if (!doc.exists) {
                statsContainer.innerHTML = '<div style="color: #666; padding: 10px;">아직 집계된 클릭 데이터가 없습니다.</div>';
                return;
            }

            const data = doc.data();
            const sortedLocations = Object.entries(data).sort((a, b) => b[1] - a[1]); // Sort by clicks descending

            if (sortedLocations.length === 0) {
                statsContainer.innerHTML = '<div style="color: #666; padding: 10px;">아직 집계된 클릭 데이터가 없습니다.</div>';
                return;
            }

            let maxClicks = sortedLocations[0][1]; // Highest click count for progress bar scaling

            let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';

            sortedLocations.forEach(([location, clicks], index) => {
                let percentage = Math.max(5, (clicks / maxClicks) * 100);
                let rankTrophy = index === 0 ? '🏆' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : ''));

                html += `
                    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold;">
                            <span style="color: var(--primary-dark);">${rankTrophy} ${escapeHTML(location)}</span>
                            <span style="color: var(--primary-color); font-size: 1.1rem;">${clicks}회 클릭</span>
                        </div>
                        <div style="width: 100%; height: 10px; background: #e9ecef; border-radius: 5px; overflow: hidden;">
                            <div style="height: 100%; width: ${percentage}%; background: ${index === 0 ? '#ff6b6b' : 'var(--primary-color)'}; border-radius: 5px; transition: width 1s ease-in-out;"></div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            statsContainer.innerHTML = html;

        }, error => {
            console.error("Error loading location stats:", error);
            statsContainer.innerHTML = '<div style="color: red; padding: 10px;">통계 데이터를 불러오는 데 실패했습니다.</div>';
        });
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
    }

    // Initialize if admin
    firebase.auth().onAuthStateChanged((user) => {
        const currentUser = Auth.getCurrentUser();
        if (currentUser && currentUser.isAdmin) {
            loadLocationStats();
        }
    });
});
