'use strict';

var ajax = require('./ajax'),
	dialog = require('./dialog'),
	util = require('./util'),
	validator = require('./validator');

var sendToFriend = {
	init: function () {
		$('#send-to-friend-dialog')
			.on('click', '.preview-button, .send-button, .edit-button', function (e) {
				e.preventDefault();
				var $form = $('#send-to-friend-form')
				$form.validate();
				if (!$form.valid()) {
					return false;
				}
				var requestType = $form.find('#request-type');
				if (requestType.length > 0) {
					requestType.remove();
				}
				$('<input/>').attr({
					id: 'request-type',
					type: 'hidden',
					name: $(this).attr('name'),
					value: $(this).attr('value')
				}).appendTo($form);
				dialog.replace({
					url: $form.attr('action'),
					data: $form.serialize(),
					callback: function () {
						validator.init();
						util.limitCharacters();
					}
				});
			})
			.on('click', '.cancel-button, .close-button', function (e) {
				e.preventDefault();
				dialog.close();
			});
	},
	initializeDialog: function (eventDelegate) {
		$(eventDelegate).on('click', '.send-to-friend', function (e) {
			e.preventDefault();
			var url = this.href;
			var data = util.getQueryStringParams($('.pdpForm').serialize());
			if (data.cartAction) {
				delete data.cartAction;
			}
			url = util.appendParamsToUrl(this.href, data);
			//url = this.protocol + '//' + this.hostname + ((url.charAt(0) === '/') ? url : ('/' + url));

			dialog.open({
				target: '#send-to-friend-dialog',
				url: url,
				options: {
					width: 480,
					title: this.title
				},
				callback: function () {
					sendToFriend.init();
					validator.init();
					util.limitCharacters();
				}
			});
		});
	}
};

module.exports = sendToFriend;
