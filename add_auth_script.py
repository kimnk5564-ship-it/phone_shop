import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if auth script already exists
    if 'firebase-auth-compat.js' in content:
        continue
        
    # Find the injection point: right before firebase-firestore-compat.js or firebase-init.js
    replace_str = '<script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore-compat.js"></script>'
    auth_script = '<script src="https://www.gstatic.com/firebasejs/10.8.1/firebase-auth-compat.js"></script>\n    '
    
    if replace_str in content:
        content = content.replace(replace_str, auth_script + replace_str)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
