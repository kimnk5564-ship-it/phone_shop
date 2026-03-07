// admin-users.js
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('admin-users-table-body');
    if (!tableBody) return;

    function loadAllUsers() {
        db.collection('users').onSnapshot(snapshot => {
            tableBody.innerHTML = '';

            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #868e96;">가입된 회원이 없습니다.</td></tr>';
                return;
            }

            const users = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                users.push(data);
            });

            // Sort by createdAt descending in JS
            users.sort((a, b) => {
                const getMs = (val) => {
                    if (!val) return 0;
                    if (typeof val.toMillis === 'function') return val.toMillis();
                    if (typeof val.getTime === 'function') return val.getTime();
                    if (val instanceof Date) return val.getTime();
                    try { return new Date(val).getTime() || 0; } catch (e) { return 0; }
                };
                return getMs(b.createdAt) - getMs(a.createdAt);
            });

            users.forEach(data => {
                // Format Date
                let dateStr = '날짜 없음';
                if (data.createdAt) {
                    let d = null;
                    if (typeof data.createdAt.toDate === 'function') {
                        d = data.createdAt.toDate();
                    } else if (data.createdAt instanceof Date) {
                        d = data.createdAt;
                    } else if (typeof data.createdAt === 'string' || typeof data.createdAt === 'number') {
                        d = new Date(data.createdAt);
                    }
                    if (d && !isNaN(d.getTime())) {
                        dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    }
                }

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #eee';

                tr.innerHTML = `
                    <td style="padding: 12px 15px; color: #666; font-size: 0.9rem;">${dateStr}</td>
                    <td style="padding: 12px 15px; font-weight: bold; color: var(--primary-dark);">${escapeHTML(data.name || '이름 없음')}</td>
                    <td style="padding: 12px 15px; color: var(--text-dark);">${escapeHTML(data.username || '아이디 없음')}</td>
                    <td style="padding: 12px 15px; color: #888; font-size: 0.9rem;">${data.id}</td>
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

    function migrateLocalUsers() {
        if (localStorage.getItem('users_migrated_to_firestore') === 'true') return;

        try {
            const localUsersStr = localStorage.getItem('users');
            if (!localUsersStr) return;
            const localUsers = JSON.parse(localUsersStr);
            Object.keys(localUsers).forEach(username => {
                const u = localUsers[username];
                db.collection('users').doc('local_' + username).set({
                    email: username + '@phoneshop.local',
                    username: username,
                    name: u.name || username,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true }).catch(console.error);
            });
            localStorage.setItem('users_migrated_to_firestore', 'true');
            console.log('Migrated old local users to Firestore users collection successfully.');
        } catch (e) {
            console.error('Error migrating local users', e);
        }
    }

    // Initialize if admin
    firebase.auth().onAuthStateChanged((user) => {
        const currentUser = Auth.getCurrentUser();
        if (currentUser && currentUser.isAdmin) {
            migrateLocalUsers();
            loadAllUsers();
        }
    });
});
