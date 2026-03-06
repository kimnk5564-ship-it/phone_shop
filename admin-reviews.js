// admin-reviews.js
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('admin-reviews-table-body');
    if (!tableBody) return;

    function loadAllReviews() {
        db.collection('reviews').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
            tableBody.innerHTML = '';

            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #868e96;">등록된 후기가 없습니다.</td></tr>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();

                // Format Date
                let dateStr = '날짜 없음';
                if (data.timestamp) {
                    const d = data.timestamp.toDate();
                    dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                }

                // Format Stars
                const stars = '★'.repeat(data.rating || 5) + '☆'.repeat(5 - (data.rating || 5));

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #eee';

                tr.innerHTML = `
                    <td style="padding: 12px 15px; color: #666; font-size: 0.9rem;">${dateStr}</td>
                    <td style="padding: 12px 15px; font-weight: bold; color: var(--primary-dark);">${escapeHTML(data.name || '익명')}</td>
                    <td style="padding: 12px 15px; font-size: 0.9rem;">
                        <span style="display: block; color: var(--text-dark);">${escapeHTML(data.model || '기종 모름')}</span>
                        <span style="display: block; color: #888; font-size: 0.8rem;">${escapeHTML(data.location || '지점 모름')}</span>
                    </td>
                    <td style="padding: 12px 15px;">
                        <div style="color: #ffc107; font-size: 0.8rem; margin-bottom: 2px;">${stars}</div>
                        <div style="font-size: 0.95rem; color: #444; line-height: 1.4;">${escapeHTML(data.content || '')}</div>
                    </td>
                    <td style="padding: 12px 15px; text-align: center;">
                        <button onclick="deleteAdminReview('${doc.id}')" style="background: #ff6b6b; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">삭제</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }, error => {
            console.error("Error loading all reviews:", error);
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">데이터를 불러오는 데 실패했습니다.</td></tr>';
        });
    }

    // Global delete function
    window.deleteAdminReview = async function (id) {
        if (!confirm('정말 이 후기를 삭제하시겠습니까? (복구 불가)')) return;

        try {
            await db.collection('reviews').doc(id).delete();
            // Snapshot listener will automatically update the table
        } catch (error) {
            console.error("Error deleting review:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

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
            loadAllReviews();
        }
    });
});
