chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "getAuthToken") {
        chrome.tabs.executeScript({
            code: 'localStorage.getItem("authToken");'
        }, function(selection) {
            const authToken = selection[0];
            sendResponse(authToken);
        });
        return true;  // Will respond asynchronously.
    }
});