// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var loadComplete = false;

$(document).ready(function () {
	
	$( "#btnGo" ).click(function() {
		if($('#txtURL').val() && $('#txtURL').val().indexOf("youtube") >= 0) {
			setUrl();
		}
		else if($('#txtURL').val() ) {
			setUrl2();
		}
		else {
			$('#txtURL').focus();
		}
	});
	$(window).resize(function() {
		if(loadComplete)
			resizeYouTubePlayer();
	});
	$("input[type='text']").on("click", function () {
		$(this).select();
	});
});

function resizeYouTubePlayer() {
	var webview = document.querySelector('webview');
	var width = ($(window).width() - 25);
	var height = ($(window).height() - 45);

    webview.style.width = width + 'px';
    webview.style.height = height + 'px';
}

function setUrl2() {
	loadComplete = false;
	var codYoutube = '';
	var url = $('#txtURL').val();
	codYoutube = getURLParameter('v', url);

	document.querySelector('webview').addEventListener("loadstop", function() {
		loadComplete = true;
        resizeYouTubePlayer();
	});
	
    document.querySelector('webview').setUserAgentOverride('Mozilla/5.0 (Linux; U; Android 2.2; en-gb; GT-P1000 Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
	document.querySelector('webview').src = url;
}

function setUrl() {
	loadComplete = false;
	var codYoutube = '';
	var url = $('#txtURL').val(); //'http://www.youtube.com/watch?v=i8jIiGu4tVM'
	codYoutube = getURLParameter('v', url);

	document.querySelector('webview').addEventListener("loadstop", function() {
		loadComplete = true;
        resizeYouTubePlayer();
	});
	
	document.querySelector('webview').src = 'http://www.youtube.com/embed/' + codYoutube;
}

function getURLParameter(name, givenstring) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(givenstring)||[,null])[1]
    );
}