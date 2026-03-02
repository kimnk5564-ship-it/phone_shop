const fs = require('fs');

const defaultPrices = {
    '아이폰_17_256g_skt_mv': '26', '아이폰_17_256g_skt_ch': '56', '아이폰_17_256g_kt_mv': '28', '아이폰_17_256g_kt_ch': '36', '아이폰_17_256g_lgu_mv': '8', '아이폰_17_256g_lgu_ch': '36',
    '아이폰_17_512g_skt_mv': '56', '아이폰_17_512g_skt_ch': '86', '아이폰_17_512g_kt_mv': '58', '아이폰_17_512g_kt_ch': '66', '아이폰_17_512g_lgu_mv': '38', '아이폰_17_512g_lgu_ch': '66',
    '아이폰_17_air_256g_skt_mv': '53', '아이폰_17_air_256g_skt_ch': '83', '아이폰_17_air_256g_kt_mv': '58', '아이폰_17_air_256g_kt_ch': '66', '아이폰_17_air_256g_lgu_mv': '38', '아이폰_17_air_256g_lgu_ch': '66',
    '아이폰_17_air_512g_skt_mv': '83', '아이폰_17_air_512g_skt_ch': '113', '아이폰_17_air_512g_kt_mv': '88', '아이폰_17_air_512g_kt_ch': '96', '아이폰_17_air_512g_lgu_mv': '68', '아이폰_17_air_512g_lgu_ch': '96',
    '아이폰_17_pro_256g_skt_mv': '105', '아이폰_17_pro_256g_skt_ch': '135', '아이폰_17_pro_256g_kt_mv': '108', '아이폰_17_pro_256g_kt_ch': '116', '아이폰_17_pro_256g_lgu_mv': '88', '아이폰_17_pro_256g_lgu_ch': '116',
    '아이폰_17_pro_512g_skt_mv': '135', '아이폰_17_pro_512g_skt_ch': '165', '아이폰_17_pro_512g_kt_mv': '138', '아이폰_17_pro_512g_kt_ch': '146', '아이폰_17_pro_512g_lgu_mv': '118', '아이폰_17_pro_512g_lgu_ch': '146',
    '아이폰_17_pro_max_256g_skt_mv': '158', '아이폰_17_pro_max_256g_skt_ch': '163', '아이폰_17_pro_max_256g_kt_mv': '122', '아이폰_17_pro_max_256g_kt_ch': '130', '아이폰_17_pro_max_256g_lgu_mv': '112', '아이폰_17_pro_max_256g_lgu_ch': '130',
    '아이폰_17_pro_max_512g_skt_mv': '문의', '아이폰_17_pro_max_512g_skt_ch': '문의', '아이폰_17_pro_max_512g_kt_mv': '문의', '아이폰_17_pro_max_512g_kt_ch': '문의', '아이폰_17_pro_max_512g_lgu_mv': '문의', '아이폰_17_pro_max_512g_lgu_ch': '문의',
    's26_512g_skt_mv': '62', 's26_512g_skt_ch': '67', 's26_512g_kt_mv': '44', 's26_512g_kt_ch': '50', 's26_512g_lgu_mv': '38', 's26_512g_lgu_ch': '49',
    's26+_512g_skt_mv': '82', 's26+_512g_skt_ch': '87', 's26+_512g_kt_mv': '64', 's26+_512g_kt_ch': '70', 's26+_512g_lgu_mv': '58', 's26+_512g_lgu_ch': '69',
    's26_ultra_512g_skt_mv': '116', 's26_ultra_512g_skt_ch': '121', 's26_ultra_512g_kt_mv': '96', 's26_ultra_512g_kt_ch': '103', 's26_ultra_512g_lgu_mv': '93', 's26_ultra_512g_lgu_ch': '104',
    'z플립7_256g_skt_mv': '29', 'z플립7_256g_skt_ch': '44', 'z플립7_256g_kt_mv': '27', 'z플립7_256g_kt_ch': '21', 'z플립7_256g_lgu_mv': '15', 'z플립7_256g_lgu_ch': '8',
    'z폴드7_256g_skt_mv': '125', 'z폴드7_256g_skt_ch': '135', 'z폴드7_256g_kt_mv': '126', 'z폴드7_256g_kt_ch': '120', 'z폴드7_256g_lgu_mv': '114', 'z폴드7_256g_lgu_ch': '109'
};

const carriers = ['skt_mv', 'skt_ch', 'kt_mv', 'kt_ch', 'lgu_mv', 'lgu_ch'];

let html = fs.readFileSync('prices.html', 'utf8');

let lines = html.split('\n');
let currentModel = '';

for (let i = 0; i < lines.length; i++) {
    // Detect model name
    let modelMatch = lines[i].match(/<td[^>]*model-name-cell[^>]*>(.*?)<\/td>/);
    if (modelMatch) {
        currentModel = modelMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
    }

    // Detect capacity
    let capMatch = lines[i].match(/<td[^>]*capacity-cell[^>]*>(.*?)<\/td>/);
    if (capMatch) {
        let capacity = capMatch[1].trim().toLowerCase();

        let carrierIndex = 0;
        let j = i + 1;
        while (carrierIndex < 6 && j < lines.length) {
            if (lines[j].includes('<td')) {
                let id = `${currentModel}_${capacity}_${carriers[carrierIndex]}`;
                let newPrice = defaultPrices[id];
                if (newPrice !== undefined) {
                    if (newPrice === '문의') {
                        lines[j] = lines[j].replace(/<td(.*?)>.*?<\/td>/, `<td class="highlight-error">문의</td>`);
                    } else {
                        let isHighlight = carriers[carrierIndex].endsWith('_mv') ? ' class="highlight-price"' : '';
                        lines[j] = lines[j].replace(/<td(.*?)>.*?<\/td>/, `<td${isHighlight}>${newPrice}</td>`);
                    }
                }
                carrierIndex++;
            }
            if (lines[j].includes('</tr>')) {
                break;
            }
            j++;
        }
    }
}

fs.writeFileSync('prices.html', lines.join('\n'), 'utf8');
console.log('Done');
