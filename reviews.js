// reviews.js
document.addEventListener('DOMContentLoaded', () => {
    const reviewsContainer = document.getElementById('reviews-container');
    const writeBtn = document.getElementById('write-review-btn');
    const reviewModal = document.getElementById('review-modal');
    const closeBtn = document.getElementById('close-review-modal');
    const reviewForm = document.getElementById('review-form');
    const starRating = document.getElementById('star-rating');
    const stars = starRating.querySelectorAll('.star');
    const ratingInput = document.getElementById('review-rating');
    const totalReviewsCount = document.getElementById('total-reviews-count');

    let currentUser = null;
    let isAdmin = false;

    // Check Auth State
    firebase.auth().onAuthStateChanged((user) => {
        currentUser = user;
        // Check admin state from Auth module
        const authUser = Auth.getCurrentUser();
        isAdmin = authUser ? authUser.isAdmin : false;
        loadReviews();
    });

    // Write Review Button Click
    writeBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert('후기 작성은 로그인 후 이용 가능합니다.');
            window.location.href = 'login.html';
            return;
        }
        reviewModal.classList.add('active');
    });

    // Close Modal
    closeBtn.addEventListener('click', () => {
        reviewModal.classList.remove('active');
        reviewForm.reset();
        stars.forEach(s => s.classList.remove('active'));
        ratingInput.value = '';
    });

    // Close Modal on clicking outside
    reviewModal.addEventListener('click', (e) => {
        if (e.target === reviewModal) {
            closeBtn.click();
        }
    });

    // Star Rating Logic
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value');
            ratingInput.value = value;

            // Highlight stars
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= parseInt(value)) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Handle Form Submission
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!ratingInput.value) {
            alert('평점을 선택해주세요.');
            return;
        }

        const model = document.getElementById('review-model').value;
        const location = document.getElementById('review-location').value;
        const content = document.getElementById('review-content').value;
        const submitBtn = document.getElementById('submit-review-btn');

        submitBtn.disabled = true;
        submitBtn.textContent = '등록 중...';

        try {
            await db.collection('reviews').add({
                authorUid: currentUser.uid,
                authorEmail: currentUser.email,
                authorName: currentUser.displayName || currentUser.email.split('@')[0],
                rating: parseInt(ratingInput.value),
                model: model,
                location: location,
                content: content,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert('소중한 후기가 등록되었습니다! 감사합니다.');
            closeBtn.click();
            loadReviews(); // Reload the list
        } catch (error) {
            console.error("Error adding review: ", error);
            alert('후기 등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '등록하기';
        }
    });

    // Load Reviews
    async function loadReviews() {
        if (!reviewsContainer) return;

        try {
            const snapshot = await db.collection('reviews').orderBy('timestamp', 'desc').get();
            reviewsContainer.innerHTML = ''; // Clear loading state

            totalReviewsCount.textContent = snapshot.size;

            if (snapshot.empty) {
                reviewsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: #868e96;">아직 등록된 후기가 없습니다. 첫 번째 후기의 주인공이 되어주세요!</div>';
                return;
            }

            snapshot.forEach(doc => {
                const review = doc.data();
                const reviewElement = createReviewElement(doc.id, review);
                reviewsContainer.appendChild(reviewElement);
            });

        } catch (error) {
            console.error("Error loading reviews: ", error);
            reviewsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: #ff6b6b;">후기를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.</div>';
        }
    }

    // Create Review Card DOM Element
    function createReviewElement(docId, review) {
        const div = document.createElement('div');
        div.className = 'review-card';
        div.setAttribute('data-id', docId);

        // Date formatting safely
        let dateStr = '';
        if (review.timestamp) {
            const date = review.timestamp.toDate();
            dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        } else {
            dateStr = '방금 전';
        }

        // Mask name for privacy (e.g., 홍*동)
        let displayName = review.authorName;
        if (displayName.length > 1) {
            displayName = displayName.substring(0, 1) + '*' + displayName.substring(2);
        } else {
            displayName = displayName + '*';
        }

        // Stars str
        const starsStr = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

        let html = `
            <div class="review-header" style="margin-bottom: 1rem; border-bottom: none; padding-bottom: 0;">
                <div class="reviewer-info">
                    <div class="review-stars" style="color: #ffc107;">${starsStr}</div>
                    <h4 style="margin-top: 5px;">${displayName} 고객님</h4>
                </div>
                <span class="review-date">${dateStr}</span>
            </div>
            <p class="review-text" style="font-style: normal; margin-bottom: 1.5rem;">${escapeHTML(review.content)}</p>
            <div class="review-footer" style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #f8f9fa;">
                <span class="review-model" style="color: #495057;">📱 ${escapeHTML(review.model)}</span>
                <span class="review-location" style="color: #495057;">📍 ${escapeHTML(review.location)}</span>
            </div>
        `;

        // Admin Delete Button
        if (isAdmin) {
            html += `<button class="admin-delete-btn" onclick="deleteReview('${docId}')">X 삭제</button>`;
        }

        div.innerHTML = html;
        return div;
    }

    // Security: Basic HTML escaping to prevent XSS
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});

// Global function for inline onclick handler
async function deleteReview(docId) {
    if (!confirm('정말 이 후기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
        await db.collection('reviews').doc(docId).delete();
        alert('후기가 성공적으로 삭제되었습니다.');
        // Refresh the page or reloading element
        location.reload();
    } catch (error) {
        console.error("Error deleting review: ", error);
        alert('삭제 중 오류가 발생했습니다.');
    }
}
