'use strict';

var util = require('./util');

var page = {
    title: '',
    type: '',
    params: util.getQueryStringParams(window.location.search.substr(1)),
    redirect: function (newURL) {
        setTimeout(function () {
            window.location.href = newURL;
        }, 0);
    },
    refresh: function () {
        setTimeout(function () {
            window.location.assign(window.location.href);
        }, 500);
    },
    cookieBannerClose:  function () {
        $( ".policy-warning a.close-button" ).on( "click", function( event ) {
            event.preventDefault();
            $.cookie('CookieBannerClosed', 'YES', { path: '/' });
            $('.policy-warning').hide();
        });
    },
    cookieBannerCheckClose:  function () {
        if ($.cookie('CookieBannerClosed')) {
            $('.policy-warning').hide();
        } else {
            $('.policy-warning').addClass('nocookie').show();
        }
    }
};

module.exports = page;
