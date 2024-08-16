chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getLinksUnclickable') {
        const linksUnclickable = sessionStorage.getItem('linksUnclickable') === 'true';
        sendResponse({ linksUnclickable });
    } else if (message.action === 'setLinksUnclickable') {
        sessionStorage.setItem('linksUnclickable', message.value);
    }
});