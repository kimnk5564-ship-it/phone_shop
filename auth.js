// auth.js - Firebase Authentication & Kakao Auth implementation


const Auth = {
    // We use a dummy domain to treat usernames as emails for Firebase
    _getEmailFromUsername: function (username) {
        return username.trim() + '@phoneshop.com';
    },

    // --- Kakao Login Bridge ---
    loginWithKakao: function () {
        try {
            if (typeof Kakao === 'undefined') {
                alert('카카오 로그인 스크립트를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.');
                return;
            }

            if (!Kakao.isInitialized()) {
                Kakao.init('17acc2b514f0416cc0393fffe4acfb20');
            }

            // In Kakao SDK v2, popup login is done via loginForm (or authorize for redirect)
            Kakao.Auth.loginForm({
                success: function (authObj) {
                    // Request user info
                    Kakao.API.request({
                        url: '/v2/user/me',
                        success: async function (res) {
                            const kakaoId = 'kakao_' + res.id;
                            const nickname = res.properties && res.properties.nickname ? res.properties.nickname : '카카오유저';
                            // Create a secure dummy password based on kakao ID for Firebase bridge
                            const dummyPassword = 'kakaoPhoneShopAuth!@#' + kakaoId;

                            const firebaseEmail = Auth._getEmailFromUsername(kakaoId);

                            try {
                                // Try to login if user already exists in Firebase
                                const userCredential = await firebase.auth().signInWithEmailAndPassword(firebaseEmail, dummyPassword);
                                Auth.updateActivityTime();
                                alert(nickname + '님, 환영합니다!');
                                window.location.href = 'index.html';
                            } catch (error) {
                                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                                    // User doesn't exist, register them silently
                                    try {
                                        const userCredential = await firebase.auth().createUserWithEmailAndPassword(firebaseEmail, dummyPassword);
                                        await userCredential.user.updateProfile({ displayName: nickname });

                                        // Save to Firestore
                                        await db.collection('users').doc(userCredential.user.uid).set({
                                            email: firebaseEmail,
                                            username: kakaoId,
                                            name: nickname,
                                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                        });

                                        // Update stats
                                        const statsRef = db.collection('stats').doc('users');
                                        const doc = await statsRef.get();
                                        if (doc.exists) {
                                            await statsRef.update({ count: firebase.firestore.FieldValue.increment(1) });
                                        } else {
                                            await statsRef.set({ count: 1 });
                                        }

                                        Auth.updateActivityTime();
                                        alert('카카오 간편가입이 완료되었습니다. 환영합니다!');
                                        window.location.href = 'index.html';
                                    } catch (regError) {
                                        console.error('Kakao Registration Bridge Error:', regError);
                                        alert('카카오 가입 연동 중 오류가 발생했습니다.');
                                    }
                                } else {
                                    console.error('Kakao Login Bridge Error:', error);
                                    alert('로그인 연동 중 오류가 발생했습니다.');
                                }
                            }
                        },
                        fail: function (error) {
                            console.error('Kakao user info error:', error);
                            alert('카카오 사용자 정보를 가져오지 못했습니다.');
                        }
                    });
                },
                fail: function (err) {
                    console.error('Kakao login popup error:', err);
                    alert('카카오 로그인을 취소하거나 오류가 발생했습니다.\n에러 내용: ' + JSON.stringify(err));
                }
            });
        } catch (error) {
            console.error('Kakao login initialization error:', error);
            alert('카카오 로그인 실행 중 오류가 발생했습니다.\n(원인: ' + error.message + ')\n카카오 디벨로퍼스 플랫폼 설정에 현재 도메인이 등록되어 있는지 확인해주세요!');
        }
    },

    // 1. Register a new user
    register: async function (username, password, name) {
        if (username.includes('@')) {
            return { success: false, message: '이 아이디는 사용할 수 없습니다.' };
        }

        try {
            const email = this._getEmailFromUsername(username);
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            // Update profile with name
            await user.updateProfile({ displayName: name });

            // Save user profile to Firestore for Admin Dashboard (Feature 4)
            try {
                await db.collection('users').doc(user.uid).set({
                    email: email,
                    username: username,
                    name: name,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (err) {
                console.error('Error saving user profile to users collection', err);
            }

            // Firebase Users Stats Increment
            try {
                const statsRef = db.collection('stats').doc('users');
                const doc = await statsRef.get();
                if (doc.exists) {
                    await statsRef.update({ count: firebase.firestore.FieldValue.increment(1) });
                } else {
                    await statsRef.set({ count: 1 });
                }
            } catch (err) {
                console.error('Error updating stats', err);
            }

            return { success: true, message: '회원가입이 완료되었습니다.' };
        } catch (error) {
            console.error("Firebase Registration Error", error);
            if (error.code === 'auth/email-already-in-use') {
                return { success: false, message: '이미 존재하는 아이디입니다.' };
            } else if (error.code === 'auth/weak-password') {
                return { success: false, message: '비밀번호는 6자리 이상이어야 합니다.' };
            }
            return { success: false, message: '회원가입 중 오류가 발생했습니다. (' + error.message + ')' };
        }
    },

    // 2. Login a user
    login: async function (username, password) {
        try {
            const email = this._getEmailFromUsername(username);
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Feature 4: Sync user to Firestore on login (for users registered before this feature)
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (!userDoc.exists) {
                    await db.collection('users').doc(user.uid).set({
                        email: email,
                        username: username,
                        name: user.displayName || (username === 'cjsdhlcjs97' ? '행사폰 어드민' : '회원'),
                        createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            } catch (err) {
                console.error('Error syncing user profile on login', err);
            }

            this.updateActivityTime();

            return { success: true, user: this.getCurrentUser() };
        } catch (error) {
            console.error("Firebase Login Error", error);

            let errMsg = '알 수 없는 오류가 발생했습니다.';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                errMsg = '아이디 또는 비밀번호가 일치하지 않습니다.';
            } else if (error.code === 'auth/too-many-requests') {
                errMsg = '비밀번호를 너무 많이 틀려 계정이 잠시 잠겼습니다. 나중에 다시 시도해주세요.';
            } else {
                errMsg = `로그인 실패 (${error.code})`;
            }

            return { success: false, message: errMsg };
        }
    },

    // 3. Logout
    logout: async function () {
        try {
            await firebase.auth().signOut();
            localStorage.removeItem('lastAuthActivity');
        } catch (error) {
            console.error("Logout Error", error);
        }
    },

    // 4. Get current logged in user (Synchronous getter based on cached state)
    // Note: Use onAuthStateChanged for real-time reactivity, this is best for quick checks
    getCurrentUser: function () {
        const fbUser = firebase.auth().currentUser;
        if (!fbUser) return null;

        const username = fbUser.email.split('@')[0];
        const isAdmin = (username === 'cjsdhlcjs97');

        return {
            username: username,
            name: fbUser.displayName || (isAdmin ? '행사폰 어드민' : '회원'),
            isAdmin: isAdmin
        };
    },

    // --- Auto-Logout Features ---
    updateActivityTime: function () {
        if (firebase.auth().currentUser) {
            localStorage.setItem('lastAuthActivity', Date.now().toString());
        }
    },

    initAutoLogout: function () {
        let lastUpdate = 0;
        const resetTimer = () => {
            const now = Date.now();
            if (now - lastUpdate > 5000) { // Throttle updates to max once every 5 seconds
                this.updateActivityTime();
                lastUpdate = now;
            }
        };

        // Track activities (Removed mousemove to prevent input lag on low-end devices)
        window.addEventListener('keydown', resetTimer, { passive: true });
        window.addEventListener('click', resetTimer, { passive: true });
        window.addEventListener('scroll', resetTimer, { passive: true });

        // Check inactivity every 1 minute
        setInterval(() => {
            const fbUser = firebase.auth().currentUser;
            if (fbUser) {
                const lastActivity = parseInt(localStorage.getItem('lastAuthActivity') || '0', 10);
                const currentTime = Date.now();
                const timeoutMs = 15 * 60 * 1000; // 15 minutes

                if (currentTime - lastActivity > timeoutMs && lastActivity > 0) {
                    this.logout().then(() => {
                        alert('장시간(15분) 움직임이 없어 자동으로 로그아웃되었습니다.');
                        if (!window.location.href.includes('login.html')) {
                            window.location.href = 'login.html';
                        } else {
                            window.location.reload();
                        }
                    });
                }
            }
        }, 60000);
    },

    // --- Dynamic UI Initialization ---
    initUI: function () {
        // We listen to Firebase Auth State changes instead of synchronous load
        firebase.auth().onAuthStateChanged((user) => {
            const currentUser = this.getCurrentUser();

            let loginBtns = document.querySelectorAll('.login-btn');
            let adminBtns = document.querySelectorAll('.admin-btn');
            let profileBtns = document.querySelectorAll('.profile-btn');

            adminBtns.forEach(btn => {
                if (currentUser && currentUser.isAdmin) {
                    btn.style.display = 'inline-block';
                } else {
                    btn.style.display = 'none';
                }
            });

            profileBtns.forEach(btn => {
                if (user) {
                    btn.style.display = 'inline-block';
                } else {
                    btn.style.display = 'none';
                }
            });

            loginBtns.forEach(btn => {
                if (user) {
                    btn.textContent = '로그아웃';
                    btn.href = '#';
                    btn.onclick = (e) => {
                        e.preventDefault();
                        this.logout().then(() => {
                            window.location.reload();
                        });
                    };
                } else {
                    btn.textContent = '로그인/회원가입';
                    btn.href = 'login.html';
                    btn.onclick = null;
                }
            });

            // Special handling for admin.html security redirect
            if (window.location.pathname.endsWith('admin.html')) {
                if (!currentUser || !currentUser.isAdmin) {
                    alert('관리자만 접근할 수 있는 페이지입니다.');
                    window.location.href = 'index.html';
                }
            }
        });
    }
};

// Auto-initialize UI and features when script loads
document.addEventListener('DOMContentLoaded', () => {
    // Give Firebase a tiny moment to initialize its state before checking auto logout
    setTimeout(() => {
        Auth.initUI();
        Auth.initAutoLogout();
    }, 100);
});
