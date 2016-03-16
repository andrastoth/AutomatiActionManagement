(function() {
    'use strict';
    
    var enable = document.getElementById('enable');
    var settings = document.getElementById('settings');
    
    /**
     * Add EventListener to enable button 
     * when event is triggered: change extension state
     */
    enable.addEventListener('click', function() {
        if (enable.classList.contains('btn-default')) {
            setState(true);
        } else {
            setState(false);
        }
    }, false);
    /**
     * Add EventListener to settings button 
     * when event is triggered: Open options.html in a new tab
     * if tab is already opened, set tab to active
     */
    settings.addEventListener('click', function() {
        var url = chrome.extension.getURL('options.html');
        chrome.tabs.query({
            url: url
        }, function(tabs) {
            if (tabs.length) {
                chrome.tabs.update(tabs[0].id, {
                    active: true
                });
            } else {
                chrome.tabs.create({
                    url: url
                });
            }
        });
    }, false);
    /**
     * Change extension state isRunning
     * @param {bool} state 
     */
    function setState(state) {
        /**
         * Change button text and button class based on 'state'
         */
        enable.classList.add(!state ? 'btn-default' : 'btn-green');
        enable.classList.remove(!state ? 'btn-green' : 'btn-default');
        enable.children[0].innerText = enable.children[0].innerText.replace(state ? 'Stopped' : 'Running', state ? 'Running' : 'Stopped');
        /**
         * Save state to chrome storage
         * @param  {bool} 'state'
         */
        chrome.storage.sync.set({
            'isRunning': state
        }, null);
        /**
         * Change browserAction icon url-path based on state
         */
        chrome.browserAction.setIcon({
            path: 'css/images/icon' + (state ? '48.png' : '-gray-48.png')
        });
    }
    /**
     * Read isRuning bool from storage
     * and set state
     */
    function getState() {
        chrome.storage.sync.get('isRunning', function(i) {
            setState(i.isRunning);
        });
    }
    return {
        GetState: function() {
            getState();
        }
    };
})().GetState();