// price-dynamic.js
// Adds dynamic price loading from localStorage

document.addEventListener('DOMContentLoaded', () => {
    let currentModel = '';

    // 1. Assign auto-generated IDs
    document.querySelectorAll('table.price-table tbody').forEach(tbody => {
        let tbodyRows = tbody.querySelectorAll('tr');
        tbodyRows.forEach(tr => {
            let cells = Array.from(tr.querySelectorAll('td'));
            if (cells.length === 0) return;

            let capacityIndex = 0;
            if (cells.length === 8) {
                currentModel = cells[0].textContent.trim().replace(/\s+/g, '_').toLowerCase();
                capacityIndex = 1;
            } else if (cells.length === 7 && currentModel !== '') {
                capacityIndex = 0;
            } else {
                return; // Skip
            }

            let capacity = cells[capacityIndex].textContent.trim().toLowerCase();
            let priceCells = cells.slice(capacityIndex + 1);

            const carriers = ['skt_mv', 'skt_ch', 'kt_mv', 'kt_ch', 'lgu_mv', 'lgu_ch'];
            priceCells.forEach((td, i) => {
                if (i < carriers.length && td.textContent.trim() !== '') {
                    let id = `${currentModel}_${capacity}_${carriers[i]}`;
                    td.setAttribute('data-price-id', id);
                }
            });
        });
    });

    // 2. Load custom prices from Firestore in real-time
    const pricesRef = db.collection('prices').doc('current');
    pricesRef.onSnapshot((doc) => {
        if (doc.exists) {
            const savedPrices = doc.data();
            document.querySelectorAll('td[data-price-id]').forEach(td => {
                let id = td.getAttribute('data-price-id');
                if (savedPrices[id] !== undefined && savedPrices[id] !== '') {
                    if (savedPrices[id] === '문의') {
                        td.textContent = '문의';
                        td.className = 'highlight-error'; // Add error styling for '문의'
                    } else {
                        td.textContent = savedPrices[id];
                        if (td.classList.contains('highlight-error')) {
                            td.classList.remove('highlight-error');
                        }
                    }
                }
            });
        }
    });
});
