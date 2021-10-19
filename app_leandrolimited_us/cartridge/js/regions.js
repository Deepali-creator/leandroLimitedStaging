'use strict';

var dialog = require('./dialog');

/**
 * @function cookieprivacy	Used to display/control the scrim containing the cookie privacy code
 **/
module.exports = function () {
	if (!$.cookie('regionSelected')) {
        console.log("Region is not selected: No cookie");
        
        //Display Region Selector modal
        if (User.region !== undefined && User.region != 'GB') {
    		dialog.open({
    			url: Urls.regionSelect,
    			options: {
    				closeOnEscape: false,
    				dialogClass: 'no-close regions-dialog',
    				width: 600
    			}
    		});
    	}
    }
};
