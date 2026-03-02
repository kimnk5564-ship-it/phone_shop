const fs = require('fs');

const html_files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

html_files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    if (content.includes('firebase-auth-compat.js')) {
        return;
    }

    const replace_str = '<script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore-compat.js"></script>';
    const auth_script = '<script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-auth-compat.js"></script>\n    ';

    if (content.includes(replace_str)) {
        content = content.replace(replace_str, auth_script + replace_str);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        // Look for firebase-init.js if firestore is not there
        const init_str = '<script src="firebase-init.js"></script>';
        if (content.includes(init_str)) {
            content = content.replace(init_str, auth_script + init_str);
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
});
