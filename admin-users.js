// admin-users.js
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('admin-users-table-body');
    if (!tableBody) return;

    function loadAllUsers() {
        db.collection('users').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            tableBody.innerHTML = '';

            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #868e96;">가입된 회원이 없습니다.</td></tr>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();

                // Format Date
                let dateStr = '날짜 없음';
                if (data.createdAt) {
                    const d = data.createdAt.toDate();
                    dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                }

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #eee';

                tr.innerHTML = `
                    <td style="padding: 12px 15px; color: #666; font-size: 0.9rem;">${dateStr}</td>
                    <td style="padding: 12px 15px; font-weight: bold; color: var(--primary-dark);">${escapeHTML(data.name || '이름 없음')}</td>
                    <td style="padding: 12px 15px; color: var(--text-dark);">${escapeHTML(data.username || '아이디 없음')}</td>
                    <td style="padding: 12px 15px; color: #888; font-size: 0.9rem;">${doc.id}</td>
                `;
                tableBody.appendChild(tr);
            });
        }, error => {
            console.error("Error loading all users:", error);
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: red;">데이터를 불러오는 데 실패했습니다.</td></tr>';
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
            loadAllUsers();
        }
    });
});
