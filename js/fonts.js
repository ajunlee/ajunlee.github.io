const fonts = [
    { name: 'Roboto', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' },
    { name: 'Open Sans', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap' },
    { name: 'Arial', url: '' },
    { name: 'Noto Sans TC', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap' },
    { name: 'Noto Serif TC', url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&display=swap' },
    { name: 'ZCOOL KuaiLe', url: 'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap' },
    { name: 'ZCOOL QingKe HuangYou', url: 'https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&display=swap' }
];

function populateFontSelector() {
    const fontSelector = document.getElementById('fontSelector');
    fonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font.name;
        option.textContent = font.name;
        fontSelector.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', populateFontSelector);