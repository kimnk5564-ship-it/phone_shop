// admin-banner.js
document.addEventListener('DOMContentLoaded', () => {
    const bannerForm = document.getElementById('admin-banner-form');
    if (!bannerForm) return;

    const badgeInput = document.getElementById('banner_badge');
    const titleInput = document.getElementById('banner_title');
    const catchphraseInput = document.getElementById('banner_catchphrase');
    const subtitleInput = document.getElementById('banner_subtitle');
    const noticeActiveInput = document.getElementById('notice_active');
    const noticeTextInput = document.getElementById('notice_text');
    const saveBtn = document.getElementById('save-banner-btn');

    // Default Fallback Values
    const defaultBanner = {
        badge: '전국 최저가 보장',
        title: '아이폰 17 성지\n바로 이곳입니다',
        catchphrase: '가장 저렴하게, 가장 확실하게!',
        subtitle: '행사폰은 투명한 가격과 정직한 약속으로 고객님의 합리적인 통신 생활을 지원합니다. 지금 바로 오늘의 특가를 확인해보세요.',
        notice_active: false,
        notice_text: ''
    };

    // Load Existing Data
    function loadBannerData() {
        db.collection('contents').doc('main_banner').get().then((doc) => {
            const data = doc.exists ? doc.data() : defaultBanner;

            badgeInput.value = data.badge || '';
            // Convert \n back to literal newline for textarea/inputs
            titleInput.value = (data.title || '').replace(/<br>/g, '\n');
            catchphraseInput.value = data.catchphrase || '';
            subtitleInput.value = (data.subtitle || '').replace(/<br>/g, '\n');
            noticeActiveInput.checked = data.notice_active || false;
            noticeTextInput.value = data.notice_text || '';
        }).catch((error) => {
            console.error("Error loading banner data:", error);
        });
    }

    // Call load on Auth ready if admin
    firebase.auth().onAuthStateChanged((user) => {
        const currentUser = Auth.getCurrentUser();
        if (currentUser && currentUser.isAdmin) {
            loadBannerData();
        }
    });

    // Handle Save
    bannerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const originalText = saveBtn.textContent;
        saveBtn.textContent = '저장 중...';
        saveBtn.disabled = true;

        try {
            await db.collection('contents').doc('main_banner').set({
                badge: badgeInput.value.trim(),
                title: titleInput.value.trim().replace(/\n/g, '<br>'), // Store newlines as <br>
                catchphrase: catchphraseInput.value.trim(),
                subtitle: subtitleInput.value.trim().replace(/\n/g, '<br>'),
                notice_active: noticeActiveInput.checked,
                notice_text: noticeTextInput.value.trim(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert('메인 배너 및 공지사항이 성공적으로 저장되었습니다!\n새로고침 하시면 즉시 반영됩니다.');
        } catch (error) {
            console.error("Error saving banner data:", error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    });
});
