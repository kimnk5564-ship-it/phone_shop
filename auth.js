// auth.js - LocalStorage based mock authentication
// Uses 'users' key for user accounts and 'currentUser' for active session

const Auth = {
    // Register a new user
    register: function(username, password, name) {
        let users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[username]) {
            return { success: false, message: '이미 존재하는 아이디입니다.' };
        }
        users[username] = { password: password, name: name };
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true, message: '회원가입이 완료되었습니다.' };
    },

    // Login a user
    login: function(username, password) {
        let users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[username] && users[username].password === password) {
            let sessionData = { username: username, name: users[username].name };
            localStorage.setItem('currentUser', JSON.stringify(sessionData));
            return { success: true, user: sessionData };
        }
        return { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
    },

    // Logout
    logout: function() {
        localStorage.removeItem('currentUser');
    },

    // Get current logged in user
    getCurrentUser: function() {
        let user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    // Initialize UI based on auth state
    // Call this on every page load
    initUI: function() {
        let user = this.getCurrentUser();
        // Update header login button
        let loginBtns = document.querySelectorAll('.login-btn');
        loginBtns.forEach(btn => {
            if (user) {
                btn.textContent = '로그아웃';
                btn.href = '#';
                btn.onclick = (e) => {
                    e.preventDefault();
                    this.logout();
                    window.location.reload();
                };
            } else {
                btn.textContent = '로그인/회원가입';
                btn.href = 'login.html';
                btn.onclick = null;
            }
        });
    }
};

// Auto-initialize UI when script loads
document.addEventListener('DOMContentLoaded', () => {
    Auth.initUI();
});
