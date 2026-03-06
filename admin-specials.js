// admin-specials.js
document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('admin-specials-list');
    const form = document.getElementById('add-special-form');
    const modal = document.getElementById('add-special-modal');

    if (!listContainer || !form) return;

    let specialItems = [];

    // Load Specials
    function loadSpecials() {
        db.collection('specials').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            specialItems = [];
            listContainer.innerHTML = '';

            if (snapshot.empty) {
                listContainer.innerHTML = '<div style="text-align: center; color: #868e96; padding: 20px;">등록된 특가 상품이 없습니다.</div>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                specialItems.push(data);

                const itemDiv = document.createElement('div');
                itemDiv.style.cssText = "background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;";

                let opacity = data.active ? '1' : '0.5';

                itemDiv.innerHTML = `
                    <div style="flex: 1; opacity: ${opacity};">
                        <span style="background: var(--accent); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; margin-right: 10px;">${escapeHTML(data.badge)}</span>
                        <strong style="font-size: 1.1rem; color: var(--primary-dark);">${escapeHTML(data.name)}</strong>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
                            <span style="text-decoration: line-through; margin-right: 10px;">${escapeHTML(data.originPrice)}</span>
                            <strong style="color: var(--text-dark);">${escapeHTML(data.salePrice)}</strong>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="toggleSpecialActive('${doc.id}', ${!data.active})" style="background: ${data.active ? '#f1f3f5' : '#10b981'}; color: ${data.active ? '#333' : 'white'}; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                            ${data.active ? '숨기기' : '보이기'}
                        </button>
                        <button onclick="deleteSpecial('${doc.id}')" style="background: #ff6b6b; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">삭제</button>
                    </div>
                `;
                listContainer.appendChild(itemDiv);
            });
        }, error => {
            console.error("Error loading specials:", error);
            listContainer.innerHTML = '<div style="color: red; padding: 10px;">데이터를 불러오는 데 실패했습니다.</div>';
        });
    }

    // Add Special
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const badge = document.getElementById('special_badge').value.trim();
        const name = document.getElementById('special_name').value.trim();
        const originPrice = document.getElementById('special_origin').value.trim();
        const salePrice = document.getElementById('special_sale').value.trim();
        const benefits = document.getElementById('special_benefits').value.trim().split('\n').map(b => b.trim()).filter(b => b.length > 0);

        try {
            await db.collection('specials').add({
                badge,
                name,
                originPrice,
                salePrice,
                benefits,
                active: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            form.reset();
            modal.style.display = 'none';
        } catch (error) {
            console.error("Error adding special:", error);
            alert("상품 추가 중 오류가 발생했습니다.");
        }
    });

    // Make functions global for inline onclick
    window.toggleSpecialActive = async function (id, newState) {
        try {
            await db.collection('specials').doc(id).update({ active: newState });
        } catch (error) {
            console.error("Error updating special:", error);
        }
    };

    window.deleteSpecial = async function (id) {
        if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;
        try {
            await db.collection('specials').doc(id).delete();
        } catch (error) {
            console.error("Error deleting special:", error);
        }
    };

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
    }

    // Init
    firebase.auth().onAuthStateChanged((user) => {
        const currentUser = Auth.getCurrentUser();
        if (currentUser && currentUser.isAdmin) {
            loadSpecials();
        }
    });
});
