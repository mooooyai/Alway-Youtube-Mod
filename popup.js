// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var extId = 'inebahefdakoeblcobglemlkhpngmohm', // Chrome store extension ID
    devId = 'ofdfopldcgfckjckfpfdioihkokijjmi', // Development extension ID
    hasExt = false;

// parse parameter from url
function getUrlVars(url, variable) {
    var vars = {}, hash,
        hashes = url.slice(url.indexOf('?') + 1).split('&');

    for (var i = 0, len = hashes.length; i < len; i += 1) {
        hash = hashes[i].split('=');
        vars[hash[0]] = hash[1];
    }
    return vars[variable];
}

// parse video id from url
function parseId(url) {
    // http://stackoverflow.com/a/14701040
    var match = /^.*(youtube.com\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/.exec(url);

    if (match instanceof Array && match[2] !== undefined) {
        return match[2];
    } else {
        return false;
    }
}

// parse time from url
function parseTime(url) {
    var sec = 0,
        msk = [1, 60, 3600],
        pr1 = url.split(/\?t=|\#t=/), // XXhXXmXXs&some
        len = 0;

    if (pr1.length > 1) {

        var atm = pr1[1]
                .split(/\&|s/)[0] // XXhXXmXX
                .split(/h|m/).reverse(), // [s,?m,?h]
            len = atm.length;
    }

    if (!len) {
        return false;
    } else {
        for (var i = 0; i < len; i += 1) {
            sec += parseInt(atm[i]) * msk[i];
        }
        return sec;
    }
}

// load webview
function webview(obj, url, time) {

    url = url.replace(/^\s+|\s+$/g, ''); // remove newlines

    var videoId = parseId(url),
        listId = getUrlVars(url, 'list'),
        embedUrl = '';

    if (videoId) {
        embedUrl = 'http://www.youtube.com/embed/' + videoId + '?';

        if (typeof listId !== 'undefined') {
            embedUrl += 'list=' + listId;
        } else {
            embedUrl += 'autoplay=1';

            if (typeof time !== 'undefined' && time !== false) {
                embedUrl += '&start=' + time;
            }
        }

        obj.src = embedUrl;

        return true;
    } else {
        return false;
    }
}

function createWindow(url, time, showLinkExtension) {

    var left = (screen.width - 480);
    var top = (screen.height - 320);

    chrome.app.window.create('popup.html', {
        id: 'youtubepopup',
        'bounds': {
            'width': 480,
            'height': 320,
            'left': left,
            'top': top
        },
        minWidth: 335, resizable: true,
        minHeight: 223, alwaysOnTop: true
    }, function (appwindow) {

        appwindow.contentWindow.onload = function () {

            var webviewObj = appwindow.contentWindow.document.getElementById('videoWrapper'),
                inputObj = appwindow.contentWindow.document.getElementById('txtURL'),
                linkObj = appwindow.contentWindow.document.getElementById('btnInstallExtension'),
                goObj = appwindow.contentWindow.document.getElementById('btnGo'),
                timeout = null,
                clearHide = function () {
                    setTimeout(function () {
                        clearTimeout(timeout);
                    }, 50);
                };

            linkObj.onclick = function (event) {
                event.preventDefault();
                window.open('https://chrome.google.com/webstore/detail/inebahefdakoeblcobglemlkhpngmohm');
            };

            if (url !== '') {
                inputObj.value = url;
                goObj.click();
                webview(webviewObj, url, time);

            } else {
                detectChromeExtension(extId, 'scripts/script.js', linkObj);
                inputObj.focus();
            }
        };

    });
}

function detectChromeExtension(extensionId, accesibleResource, linkObj) {
    if (typeof (chrome) !== 'undefined') {
        var xmlHttp = new XMLHttpRequest(),
            testUrl = 'chrome-extension://' + extensionId + '/' + accesibleResource;
        xmlHttp.open('HEAD', testUrl, true);
        xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlHttp.timeout = 1000;

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    linkObj.style.display = 'none'
                } else {
                    linkObj.style.display = 'block'
                }
            }
        }
        xmlHttp.ontimeout = function () {
            linkObj.style.display = 'block'
        }
        xmlHttp.send();
    } else {
        linkObj.style.display = 'block'
    }
};


chrome.runtime.onMessageExternal.addListener(function (request, sender) {
    if (request.launch === undefined) {
        return;
    }

    if (sender.id === extId || sender.id === devId) {
        chrome.storage.local.set({ 'extension': true });
        hasExt = true;
    }

    if (request.time !== undefined) {
        createWindow(request.launch, request.time, true)
    } else {
        createWindow(request.launch, 0, true)
    }
});

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        chrome.storage.local.set({ 'extension': false });
    }
});

chrome.app.runtime.onLaunched.addListener(function () {

    chrome.storage.local.get('extension', function (saved) {
        if (typeof saved.extension === 'undefined') {
            chrome.storage.local.set({ 'extension': false });
        } else {
            hasExt = saved.extension;
        }
    });

    createWindow('', 0, false);
});