const fs = require('fs');

const html_files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'profile.html');

html_files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    if (content.includes('class="profile-btn"')) {
        return;
    }

    const adminLinkStr = '<a href="admin.html" class="admin-btn" style="display: none;">관리자 페이지</a>';
    const profileLinkStr = '<a href="profile.html" class="profile-btn" style="display: none;">내정보</a>';

    if (content.includes(adminLinkStr)) {
        content = content.replace(adminLinkStr, adminLinkStr + '\n                ' + profileLinkStr);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
        // Look for firebase-init.js if firestore is not there
        const init_str = '<script src="firebase-init.js"></script>';
        if (content.includes(init_str)) {
            content = content.replace(init_str, auth_script + init_str);
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
});
