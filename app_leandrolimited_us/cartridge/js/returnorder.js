'use strict';

module.exports = function () {
	$('#order-items-form').on('submit', function(e) {
		e.preventDefault();
		var location = $(this).attr('action');
		
		var postdata    = $(this).serialize();
		
			postdata += '&format=ajax'
		
        $.ajax({
            url     : Urls.addRMAtoOrder,
            type	: "POST",
            dataType: "json",
            data    : postdata,
            success : function( data ) {
                        if ( data.url.toString().length > 0 ) {
                        	var collectpluswindow = window.open(data.url.toString(), "Collect Plus");
                        }
                        if ( data.rmano.toString().length > 0 ) {
                        	var html = $('<span>RMA ' + data.rmano.toString() + ' was successfully submitted</span>');
                        	$('.return-rma-message').html(html);
                        	$("html, body").animate({ scrollTop: 0 }, 800);
                        }
                      },
            error   : function( xhr, err ) {
                        alert('Error');     
                      }
        });    
        return false;
	});
	
	function checkReturnFormValidity() {
		var active = true;
		
		var checkedar = $('.line-item-return input:checked');
		for (var i = 0; i < checkedar.length; i++) {
			var checkbox = checkedar[i];
			var returnquantity = $(checkbox).closest('tr').find('.line-item-returnqty input').val();
			var quantity = $(checkbox).closest('tr').find('.line-item-quantity')[0].lastChild.nodeValue;
			if (Number(quantity) < Number(returnquantity) || returnquantity.length==0) {
				active = false;
				break;
			}
		}
		if (checkedar.length === 0) {
			active = false;
		}
		
		if (active) {
			$('button#return-items').prop("disabled",false);
			$('.return-reason-action').removeClass('inactive');
		} else {
			$('button#return-items').prop("disabled",true);
			$('.return-reason-action').addClass('inactive');
		}
	}
	
	$('.line-item-return').on('change', function(e) {
		checkReturnFormValidity();
	});
	$('.line-item-returnqty').on('keyup', function(e) {
		checkReturnFormValidity();
	});
	if ($('form#order-items-form').length > 0) {
		checkReturnFormValidity();
	}
	
};
