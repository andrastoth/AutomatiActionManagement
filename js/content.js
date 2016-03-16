(function() {
    'use strict';
    var targetPath = null;
    /**
     * Try to run required action, based on settings array item
     * @param {object} f setting array item
     */
    var ActionInterval = function(f) {
        var counter = 0;
        var timeInt = setInterval(function() {
            var item = document.querySelector(f.selector);
            if (item) {
                if (f.event === 0) {
                    item.click();
                } else if (f.event === 1) {
                    item.parentNode.removeChild(item);
                }
                counter = f.repeat;
            }
            if (counter++ >= f.repeat) {
                clearInterval(timeInt);
            }
        }, f.timeout);
    };
    /**
     * Retrieve full DOM path of HTMLELement
     * @param {HTMLElement} el 
     * @return {string}
     */
    function getDomPath(el) {
        var path = [];
        while (el.nodeName.toLowerCase() !== 'html') {
            path.unshift(el.nodeName.concat(':nth-of-type(', ([].indexOf.call([].filter.call(el.parentNode.childNodes, function(f) {
                return el.nodeName == f.nodeName;
            }), el) + 1), ')').toLowerCase());
            el = el.parentNode;
        }
        path.unshift('html');
        return path.join(' > ').split(':nth-of-type(1)').join('');
    }
    /**
     * Send Message to background.js for context menu creation
     * @param {object} loc
     */
    function setContextMenu(loc) {
        chrome.extension.sendMessage({
            order: 'setContextMenu',
            location: loc
        }, null);
    }
    /**
     * Run Actions management
     */
    var startActionsManagement = function() {
        var obj = {
            protocol: window.location.protocol,
            host: window.location.host,
            pathname: window.location.pathname
        };
        chrome.storage.sync.get('isRunning', function(i) {
            if (i.isRunning) {
                chrome.storage.sync.get('settings', function(i) {
                    i.settings.filter(function(f) {
                        return f.host == obj.host;
                    }).forEach(function(f) {
                        if (f.state && obj.protocol.concat('//', obj.host, obj.pathname).indexOf(f.protocol.concat('//', f.host, f.pathname)) != -1) {
                            new ActionInterval(f);
                        }
                    });
                });
            }
        });
    };
    /**
     * Add EventListeners to window, window.document, chrome.extension
     */
    function init() {
        window.addEventListener('load', startActionsManagement, false);
        window.document.addEventListener('mousedown', function(e) {
            if (e.button == 2) {
                setContextMenu(window.location);
                targetPath = getDomPath(e.target);
            }
        }, false);
        /**
         * Recieve Message from background.js
         * And send response with obj parameter
         */
        chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.order == "SendInfoToAutomaticActionManagement") {
                var obj = {
                    protocol: window.location.protocol,
                    host: window.location.host,
                    pathname: window.location.pathname,
                    selector: targetPath,
                    event: 0,
                    repeat: 30,
                    timeout: 300,
                    state: true
                };
                sendResponse(obj);
            }
        });
    }
    return {
        Init: function() {
            init();
        }
    };
})().Init();