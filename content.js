document.addEventListener('DOMContentLoaded', () => {
    const linksUnclickable = sessionStorage.getItem('linksUnclickable') === 'true';
    if (linksUnclickable) {
        toggleLinks(linksUnclickable);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getLinksUnclickable') {
        const linksUnclickable = sessionStorage.getItem('linksUnclickable') === 'true';
        sendResponse({ linksUnclickable });
    } else if (message.action === 'setLinksUnclickable') {
        sessionStorage.setItem('linksUnclickable', message.value);
        toggleLinks(message.value);
    }
});

function toggleLinks(makeUnclickable) {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.style.pointerEvents = makeUnclickable ? 'none' : 'auto';
    });
}

document.addEventListener('click', (event) => {
    let clickCount = 0;
    let clickTimeout;

    document.addEventListener('click', (e) => {
        clickCount++;
        clearTimeout(clickTimeout);

        clickTimeout = setTimeout(() => {
            clickCount = 0;
        }, 300);

        if (clickCount === 3) {
            const element = e.target;
            const computedStyles = window.getComputedStyle(element);
            const allowedProperties = [
                'color', 'border', 'background-color', 'font', 'font-size', 'font-family', 'font-weight', 'font-style', 'width', 'height'
            ];
            const propInfo = ['https://www.w3schools.com/cssref/pr_text_color.php', 'https://www.w3schools.com/css/css_border.asp', 'https://www.w3schools.com/cssref/pr_background-color.php', 'https://www.w3schools.com/css/css_font.asp', 'https://www.w3schools.com/css/css_font_size.asp', 'https://www.w3schools.com/cssref/pr_font_font-family.php', 'https://www.w3schools.com/cssref/pr_font_weight.php', 'https://www.w3schools.com/css/css_font_style.asp', 'https://www.w3schools.com/cssref/pr_dim_width.php', 'https://www.w3schools.com/cssref/pr_dim_height.php']

            let cssText = '';
            if (element.className) {
                cssText += `<div style="font-size: 1.2em; font-weight: bold; font-style: italic;">${element.className}</div><br>`;
            }
            for (let i = 0; i < computedStyles.length; i++) {
                const property = computedStyles[i];
                if (allowedProperties.includes(property)) {
                    const index = allowedProperties.indexOf(property);
                    const url = propInfo[index];
                    cssText += `  <span style="font-weight: bold; color: rgb(0, 255, 0); font-style: italic;" contenteditable="false"><a href="${url}" target="_blank">${property}</a></span>: <span contenteditable="true">${computedStyles.getPropertyValue(property)}</span>;<br>`;
                }
            }

            const cssEditor = document.createElement('div');
            cssEditor.innerHTML = cssText;
            cssEditor.contentEditable = true;
            cssEditor.style.position = 'fixed';
            cssEditor.style.zIndex = '9999';
            cssEditor.style.backgroundColor = '#000';
            cssEditor.style.color = '#fff';
            cssEditor.style.border = '1px solid #fff';
            cssEditor.style.padding = '10px';
            cssEditor.style.width = '400px';
            cssEditor.style.height = '300px';
            cssEditor.style.overflow = 'auto';
            cssEditor.style.whiteSpace = 'pre-wrap';
            cssEditor.style.fontFamily = 'monospace';

            const applyButton = document.createElement('button');
            applyButton.innerText = 'Apply Changes';
            applyButton.style.position = 'fixed';
            applyButton.style.zIndex = '9999';
            applyButton.style.backgroundColor = '#000';
            applyButton.style.color = '#fff';
            applyButton.style.border = '2px dashed #000';
            applyButton.style.padding = '5px 10px';
            applyButton.style.cursor = 'pointer';
            applyButton.style.fontFamily = 'monospace';

            const warningMessage = document.createElement('div');
            warningMessage.style.position = 'fixed';
            warningMessage.style.zIndex = '9999';
            warningMessage.style.backgroundColor = '#ff0000';
            warningMessage.style.color = '#fff';
            warningMessage.style.padding = '5px 10px';
            warningMessage.style.display = 'none';
            warningMessage.innerText = 'Invalid CSS syntax! Fix them before continuing.';
            document.body.appendChild(warningMessage);

            // Adjust position to ensure it's within the window view
            let top = e.clientY;
            let left = e.clientX;
            const editorHeight = 300;
            const editorPadding = 10;
            const buttonHeight = 30;
            const warningHeight = 40; // Approximate height of the warning message

            if (top + editorHeight + editorPadding + buttonHeight + warningHeight > window.innerHeight) {
                top = window.innerHeight - (editorHeight + editorPadding + buttonHeight + warningHeight);
            }
            if (left + 400 > window.innerWidth) {
                left = window.innerWidth - 410; // 400 for width + 10 for padding
            }
            cssEditor.style.top = `${top}px`;
            cssEditor.style.left = `${left}px`;

            let buttonTop = top + editorHeight + editorPadding;
            applyButton.style.top = `${buttonTop}px`;
            applyButton.style.left = `${left}px`;

            const closeEditor = () => {
                cssEditor.remove();
                applyButton.remove();
                warningMessage.remove();
                document.removeEventListener('click', outsideClickListener);
            };

            applyButton.addEventListener('click', () => {
                const spans = cssEditor.querySelectorAll('span[contenteditable="true"]');
                let isValid = true;
                spans.forEach(span => {
                    const property = span.previousElementSibling.innerText.trim();
                    const value = span.innerText.trim().replace(';', '');
                    if (CSS.supports(property, value)) {
                        element.style[property] = value;
                        span.style.border = ''; // Reset border if previously marked as invalid
                    } else {
                        isValid = false;
                        span.style.border = '1px solid red'; // Highlight invalid line
                    }
                });
                if (isValid) {
                    closeEditor();
                } else {
                    warningMessage.style.top = `${buttonTop + buttonHeight}px`;
                    warningMessage.style.left = `${left}px`;
                    warningMessage.style.display = 'block';
                }
            });

            const outsideClickListener = (event) => {
                if (!cssEditor.contains(event.target) && !applyButton.contains(event.target)) {
                    closeEditor();
                }
            };

            document.addEventListener('click', outsideClickListener);

            document.body.appendChild(cssEditor);
            document.body.appendChild(applyButton);
            cssEditor.focus();
        }
    });
});