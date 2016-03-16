(function() {
    'use strict';
    /**
     * Check string is a valid selector
     * @param  {string}  selector  
     * @return {Boolean}       
     */
    function isValidSelector(selector) {
        try {
            document.querySelector(selector);
        } catch (error) {
            return false;
        }
        return true;
    }
    /**
     * Check string is a valid URL
     * @param  {string}  str
     * @return {Boolean} 
     */
    function isValidURL(str) {
        var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        return regex.test(str);
    }
    /**
     * Create settings array, save settings to chrome storage
     */
    function saveSettings() {
        var settings = [];
        var rows = document.querySelectorAll('#settings-table tbody tr');
        [].forEach.call(rows, function(row) {
            if (isValidURL(row.children[0].children[0].value) && isValidSelector(row.children[1].children[0].value)) {
                var lnk = document.createElement('a');
                lnk.href = row.children[0].children[0].value;
                settings.push({
                    protocol: lnk.protocol,
                    host: lnk.host,
                    pathname: lnk.pathname,
                    selector: row.children[1].children[0].value,
                    event: row.children[2].children[0].selectedIndex === undefined ? 0 : row.children[2].children[0].selectedIndex,
                    repeat: row.children[3].children[0].value,
                    timeout: row.children[4].children[0].value,
                    state: row.dataset.enabled == 'true' ? true : false
                });
            }
        });
        chrome.storage.sync.set({
            'settings': settings
        }, function() {
            loadSettings();
        });
    }
    /**
     * Add EventListeners
     * Load settings
     */
    function init() {
        var tbl = document.querySelector('#settings-table tbody');
        document.querySelector('#add').on('click', addRow);
        tbl.on('click', '.img-on, .img-off', function() {
            if (this.classList.contains("img-off")) {
                this.className = "img-on";
                this.title = "turn on";
                this.parentElement.parentElement.setAttribute('data-enabled', false);
            } else {
                this.className = "img-off";
                this.title = "turn off";
                this.parentElement.parentElement.setAttribute('data-enabled', true);
            }
        });
        tbl.on('click', '.img-delete', function() {
            removeRow(this.parentNode.parentNode);
        });
        document.getElementById('save').on('click', function() {
            saveSettings();
        });
        loadSettings();
    }
    /**
     * remove row from '#settings-table' table
     * @param  {HTML Table Row} row
     */
    function removeRow(row) {
        row.classList.add('remove-item');
        setTimeout(function() {
            row.parentNode.removeChild(row);
        }, 200);
    }
    /**
     * Add new row to '#settings-table' table with defaults
     */
    function addRow() {
        var tbl = document.querySelector('#settings-table tbody');
        var row = document.createElement('tr');
        row.setAttribute('data-enabled', false);
        row.innerHTML = [
            '<td><input type="text" value=""></td>', 
            '<td><input type="text" value=""></td>', 
            '<td><select><option>click</option><option>remove</option></select></td>', 
            '<td><input type="number" min="1" max="1000" value="30"></td>', 
            '<td><input type="number" min="1" max="1000" value="300"></td>', 
            '<td><img title="turn on" class="img-on"></td>', 
            '<td><img title="remove row" class="img-delete"></td>'].join('\n');
        tbl.appendChild(row);
    }
    /**
     * Load settings from chrome storage 
     * build '#settings-table' table from settings array
     */
    function loadSettings() {
        var tbl = document.querySelector('#settings-table tbody');
        tbl.innerHTML = '';
        chrome.storage.sync.get('settings', function(i) {
            var settings = i.settings;
            settings.forEach(function(rw) {
                var row = document.createElement('tr');
                row.setAttribute('data-enabled', rw.state);
                row.innerHTML = [
                    '<td><input type="text" value="' + [rw.protocol, rw.host].join('//').concat(rw.pathname) + '"></td>', 
                    '<td><input type="text" value="' + rw.selector + '"></td>', 
                    '<td><select><option ' + (rw.event === 0 ? 'selected' : '') + '>click</option><option  ' + (rw.event === 1 ? 'selected' : '') + '>remove</option></select></td>', 
                    '<td><input type="number" min="1" max="1000" value="' + rw.repeat + '"></td>', 
                    '<td><input type="number" min="1" max="1000" value="' + rw.timeout + '"></td>', 
                    '<td><img title="turn ' + (!rw.state ? 'on' : 'off') + '" class="img-' + (!rw.state ? 'on' : 'off') + '"></td>',
                    '<td><img title="remove row" class="img-delete"></td>'].join('\n');
                tbl.appendChild(row);
            });
        });
    }
    return {
        Init: function() {
            init();
        }
    };
})().Init();