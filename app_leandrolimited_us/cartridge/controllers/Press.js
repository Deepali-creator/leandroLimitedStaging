'use strict';
var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

function show(){
    app.getView({ currentAction: 'Press-Show'
    }).render('Press/press');
}

exports.Show = guard.ensure(['get'], show);