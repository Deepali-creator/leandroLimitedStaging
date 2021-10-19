'use strict';
var igFeed = require('../ig-feed');

exports.init = function () {
    $(".level-1 > li > a:contains('Home')").addClass('active-cat');
    //Init IG Feed
    igFeed.init();
};
