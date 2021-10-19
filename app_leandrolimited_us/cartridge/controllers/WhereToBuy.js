'use strict';
var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

function show(){
    app.getView().render('checkout/WhereToBuy/WhereToBuy');
}

exports.Show = guard.ensure(['get'], show);