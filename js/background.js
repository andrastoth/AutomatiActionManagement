(function() {
    'use strict';
    /**
     * Remove all added context menu item
     */
    chrome.tabs.onActivated.addListener(function(tabId, changeInfo, tab) {
        chrome.contextMenus.removeAll(null);
    });
    chrome.runtime.onInstalled.addListener(function(object) {
        chrome.storage.sync.set({
            'settings': [],
            'isRunning': true
        }, null);
    });
    /**
     * Recieve Message from extension
     * Set Context menu filtered by location
     * Add click handler
     */
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.order == 'setContextMenu') {
            chrome.contextMenus.removeAll(function() {
                if (['chrome:', 'chrome-extension:'].indexOf(request.location.protocol) === -1 && ['chrome'].filter(function(f) {
                        return request.location.host.indexOf(f) === -1;
                    }).length) {
                    chrome.contextMenus.create({
                        "title": "Add to AAM",
                        "contexts": ["page", "frame", "link", "image", "video", "audio"],
                        "onclick": clickHandler
                    });
                }
            });
        }
    });
    /**
     * Send message to tab where click is occurred
     * @param  {int} info
     * @param  {tab} tab
     * Recieve message from tab, and add obj to settings
     */
    function clickHandler(info, tab) {
        chrome.tabs.sendMessage(tab.id, {
            order: "SendInfoToAutomaticActionManagement"
        }, function(obj) {
            chrome.storage.sync.get('settings', function(i) {
                var settings = i.settings;
                settings.push(obj);
                chrome.storage.sync.set({
                    'settings': settings
                }, null);
            });
        });
    }
})();