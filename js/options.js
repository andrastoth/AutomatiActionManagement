(function() {
    'use strict';
    var popupWindow = function(html, sel) {
        var pWin = null;
        if (html) {
            var tmp = document.createElement('div');
            tmp.innerHTML = html;
            pWin = tmp.children[0];
        } else {
            pWin = document.querySelector(sel);
        }

        function init(parentSelector) {
            document.querySelector(parentSelector).appendChild(pWin);
            pWin.addEventListener('keyup', keyupFunction);
        }

        function remove() {
            (pWin.parentElement || pWin.parentNode).removeChild(pWin);
        }

        function show() {
            pWin.style.display = 'block';
            setTimeout(function() {
                pWin.style.opacity = 1;
            }, 0);
        }

        function hide() {
            pWin.style.opacity = 0;
            setTimeout(function() {
                pWin.style.display = 'none';
            }, 500);
        }

        function keyupFunction(e) {
            if (e.which === 27) {
                hide();
            }
        }

        function addEvent(selector, type, fn) {
            pWin.querySelector(selector).addEventListener(type, fn, 120);
        }

        function setValue(selector, val) {
            pWin.querySelector(selector).value = val;
        }

        function getValue(selector, val) {
            return pWin.querySelector(selector).value;
        }
        return {
            Init: function(parentSelector) {
                init(parentSelector);
                return this;
            },
            Remove: function() {
                remove();
            },
            Show: function() {
                show();
                return this;
            },
            Hide: function() {
                hide();
                return this;
            },
            AddEvent: function(selector, type, fn) {
                addEvent(selector, type, fn);
                return this;
            },
            SetValue: function(selector, val) {
                setValue(selector, val);
                return this;
            },
            GetValue: function(selector, val) {
                return getValue(selector, val);
            }
        }
    };
    var save = document.querySelector('#save'),
        fileName = document.getElementById('save-name'),
        overlay = document.querySelector('.input-popup-overlay'),
        tbl = document.querySelector('#settings-table tbody'),
        addRow = document.querySelector('#add'),
        lastClickedInput = null,
        popup = new popupWindow(null, '.input-popup-overlay').Init('body');
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
     * Add EventListeners
     * Load settings
     */
    function init() {
        addRow.on('click', addNewRow);
        save.on('click', saveSettings);
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
        tbl.on('click', 'tr td input', function(e) {
            if (this.parentElement.nextElementSibling.nextElementSibling.children[0].selectedIndex === 2) {
                lastClickedInput = this;
                var fname = this.value ? this.value : new Date().getTime().toString(16).concat('.js');
                popup.Show().SetValue('#save-name', fname);
                getFileContent(fname);
            };
        });
        popup.AddEvent('#save-file', 'click', function() {
            lastClickedInput.value = popup.GetValue('#save-name');
            popup.Hide();
            saveFileContent({
                name: popup.GetValue('#save-name'),
                content: popup.GetValue('#save-data')
            });
        });
        popup.AddEvent('#close', 'click', function() {
            popup.Hide();
        });
        loadSettings();
    }

    function getFileContent(fname) {
        var file = null;
        chrome.storage.sync.get('scriptFiles', function(i) {
            file = i.scriptFiles.find(function(f) {
                return f.name == fname
            });
            popup.SetValue('#save-data', file ? file.content : '');
        });
    }

    function saveFileContent(obj) {
        var file = null;
        chrome.storage.sync.get('scriptFiles', function(i) {
            var file = i.scriptFiles.find(function(f) {
                return f.name == obj.name;
            });
            if (file) {
                file.content = obj.content;
            } else {
                i.scriptFiles.push(obj);
            }
            chrome.storage.sync.set({
                'scriptFiles': i.scriptFiles
            }, null);
        });
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
    function addNewRow() {
        var row = document.createElement('tr');
        row.setAttribute('data-enabled', false);
        row.innerHTML = [
            '<td><input type="text" value=""></td>',
            '<td><input type="text" value=""></td>',
            '<td><select><option selected>DOM loaded</option><option>Window loaded</option></select></td>',
            '<td><select><option selected>click</option><option>remove</option><option>inject</option></select></td>',
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
        tbl.innerHTML = '';
        chrome.storage.sync.get('settings', function(i) {
            var settings = i.settings;
            settings.sort(function(a, b) {
                return a.host == b.host ? 0 : +(a.host > b.host) || -1;
            }).forEach(function(rw) {
                var row = document.createElement('tr');
                row.setAttribute('data-enabled', rw.state);
                row.innerHTML = [
                    '<td><input type="text" value="' + [rw.protocol, rw.host].join('//').concat(rw.pathname) + '"></td>',
                    '<td><input type="text" value="' + rw.selector + '"></td>',
                    '<td><select><option ' + (rw.when === 0 ? 'selected' : '') + '>DOM loaded</option><option  ' + (rw.when === 1 ? 'selected' : '') + '>Window loaded</option></select></td>',
                    '<td><select><option ' + (rw.event === 0 ? 'selected' : '') + '>click</option><option  ' + (rw.event === 1 ? 'selected' : '') + '>remove</option><option ' + (rw.event === 2 ? 'selected' : '') + '>inject</option></select></td>',
                    '<td><input type="number" min="1" max="1000" value="' + rw.repeat + '"></td>',
                    '<td><input type="number" min="1" max="1000" value="' + rw.timeout + '"></td>',
                    '<td><img title="turn ' + (!rw.state ? 'on' : 'off') + '" class="img-' + (!rw.state ? 'on' : 'off') + '"></td>',
                    '<td><img title="remove row" class="img-delete"></td>'].join('\n');
                tbl.appendChild(row);
            });
        });
    }
    /**
     * Create settings array, save settings to chrome storage
     */
    function saveSettings() {
        var settings = [];
        var scripts = [];
        var rows = document.querySelectorAll('#settings-table tbody tr');
        [].forEach.call(rows, function(row) {
            if (isValidURL(row.children[0].children[0].value) && (row.children[3].children[0].selectedIndex == 2 || isValidSelector(row.children[1].children[0].value))) {
                var lnk = document.createElement('a');
                lnk.href = row.children[0].children[0].value;
                settings.push({
                    protocol: lnk.protocol,
                    host: lnk.host,
                    pathname: lnk.pathname,
                    selector: row.children[1].children[0].value,
                    when: row.children[2].children[0].selectedIndex,
                    event: row.children[3].children[0].selectedIndex,
                    repeat: Number(row.children[4].children[0].value),
                    timeout: Number(row.children[5].children[0].value),
                    state: row.dataset.enabled == 'true' ? true : false
                });
            }
        });
        chrome.storage.sync.get('scriptFiles', function(i) {
            scripts = i.scriptFiles.filter(function(f) {
                return settings.find(function(s) {
                    return s.event === 2 && s.selector == f.name;
                });
            });
            chrome.storage.sync.set({
                'settings': settings,
                'scriptFiles': scripts
            }, function() {
                loadSettings();
            });
        });
    }

    function getValue(callback, valName) {
        chrome.storage.sync.get(valName, callback);
    }
    return {
        Init: function() {
            init();
        }
    };
})().Init();