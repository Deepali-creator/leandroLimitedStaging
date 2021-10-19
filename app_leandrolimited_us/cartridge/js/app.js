/**
 *    (c) 2009-2014 Demandware Inc.
 *    Subject to standard usage terms and conditions
 *    For all details and documentation:
 *    https://bitbucket.com/demandware/sitegenesis
 */

'use strict';

var countries = require('./countries'),
    dialog = require('./dialog'),
    minicart = require('./minicart'),
    page = require('./page'),
    rating = require('./rating'),
    searchplaceholder = require('./searchplaceholder'),
    searchsuggest = require('./searchsuggest'),
    tooltip = require('./tooltip'),
    util = require('./util'),
    validator = require('./validator'),
    tls = require('./tls'),
    consentTracking = require('./consentTracking');

// if jQuery has not been loaded, load from google cdn
if (!window.jQuery) {
    var s = document.createElement('script');
    s.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js');
    s.setAttribute('type', 'text/javascript');
    document.getElementsByTagName('head')[0].appendChild(s);
}

require('./jquery-ext')();
require('./cookieprivacy')();
consentTracking.init();
// require('./captcha')();

function initializeEvents() {
    var controlKeys = ['8', '13', '46', '45', '36', '35', '38', '37', '40', '39'];

    $('body')
        .on('keydown', 'textarea[data-character-limit]', function (e) {
            var text = $.trim($(this).val()),
                charsLimit = $(this).data('character-limit'),
                charsUsed = text.length;

            if ((charsUsed >= charsLimit) && (controlKeys.indexOf(e.which.toString()) < 0)) {
                e.preventDefault();
            }
        })
        .on('change keyup mouseup', 'textarea[data-character-limit]', function () {
            var text = $.trim($(this).val()),
                charsLimit = $(this).data('character-limit'),
                charsUsed = text.length,
                charsRemain = charsLimit - charsUsed;

            if (charsRemain < 0) {
                $(this).val(text.slice(0, charsRemain));
                charsRemain = 0;
            }

            $(this).next('div.char-count').find('.char-remain-count').html(charsRemain);
        });

    /**
     * initialize search suggestions, pending the value of the site preference(enhancedSearchSuggestions)
     * this will either init the legacy(false) or the beta versions(true) of the the search suggest feature.
     * */
    var $searchContainer = $('.header-search');
    searchsuggest.init($searchContainer, Resources.SIMPLE_SEARCH);

    // add show/hide navigation elements
    $('.secondary-navigation .toggle').click(function () {
        $(this).toggleClass('expanded').next('ul').toggle();
    });

    // add generic toggle functionality
    $('.toggle').next('.toggle-content').hide();
    $('.toggle').click(function () {
        $(this).toggleClass('expanded').next('.toggle-content').toggle();
    });

    // subscribe email box
    var $subscribeEmail = $('.subscribe-email');
    if ($subscribeEmail.length > 0)    {
        $subscribeEmail.focus(function () {
            var val = $(this.val());
            if (val.length > 0 && val !== Resources.SUBSCRIBE_EMAIL_DEFAULT) {
                return; // do not animate when contains non-default value
            }

            $(this).animate({color: '#999999'}, 500, 'linear', function () {
                $(this).val('').css('color', '#333333');
            });
        }).blur(function () {
            var val = $.trim($(this.val()));
            if (val.length > 0) {
                return; // do not animate when contains value
            }
            $(this).val(Resources.SUBSCRIBE_EMAIL_DEFAULT)
                .css('color', '#999999')
                .animate({color: '#333333'}, 500, 'linear');
        });
    }

    $('a.privacy-policy').on('click', function (e) {
        e.preventDefault();
        dialog.open({
            url: $(e.target).attr('href'),
            options: {
                height: 600
            }
        });
    });

    $('.consent-tracking-policy').on('click', function (e) {
        e.preventDefault();
        consentTracking.show();
    });

    // main menu toggle
    $('.menu-toggle').on('click', function () {
        $('body').toggleClass('menu-active');
    });

    // search toggle
    $('.search-toggle').on('click', function () {
        $('body').toggleClass('search-active');
        $('body').hasClass('search-active') ? $('#q').focus() : $('#q').blur();
    });

    if($('.pt_content').hasClass('brand')) {
        $(".level-1").find('.brand').addClass('active-cat');
    }else if($('.pt_content').hasClass('press')) {
        $(".level-1").find('.press').addClass('active-cat');
    }else if($('.pt_product-search-result').length) {
        $(".level-1").find('.shop').addClass('active-cat');
    }

    $(window).smartresize(function(){
        checkLayout();
    });

    checkLayout();

    function checkLayout() {
        const headerHeight = $('#header').outerHeight();
        const $nav = $('#navigation');
        if(window.matchMedia("(min-width: 60em)").matches){
            $('body').removeClass('menu-active search-active');
            $('.header-search').prependTo($('.header-utility'));
            $('.mobile-ref-wrap').appendTo($('.refinements'));
            $nav.css('top', '');
        }else{
            $('.header-search').appendTo($('.wrap--header'));
            $('.mobile-ref-wrap').appendTo($('.mobile-refs'));
            $nav.css('top', headerHeight);
        }
    }

    $('.menu-category li .menu-item-toggle').on('click', function (e) {
		e.preventDefault();
		var $parentLi = $(e.target).closest('li');
		$parentLi.siblings('li').removeClass('active').find('.menu-item-toggle').removeClass('fa-chevron-right active').addClass('fa-chevron-down');
		$parentLi.toggleClass('active');
		$(e.target).toggleClass('fa-chevron-right fa-chevron-down active');
    });

    $('.user-account').on('click', function (e) {
        if(window.matchMedia("(min-width: 60em)").matches){
            e.preventDefault();
        }
    });

     ///////////////////////////
    /// FAQ Accordion Menu  ///
    ///////////////////////////

    $('.faqs .faq-item__question').on('click', function (e) {
        e.preventDefault();
        $(this).parent().toggleClass('js-active');
    });

    $('.popup-video').magnificPopup({
        type: 'iframe',
        iframe: {
            patterns: {
                youtube: {
                    index: 'youtube.com/', // String that detects type of video (in this case YouTube). Simply via url.indexOf(index).

                    id: 'embed/', // String that splits URL in a two parts, second part should be %id%
                    // Or null - full URL will be returned
                    // Or a function that should return %id%, for example:
                    // id: function(url) { return 'parsed id'; }

                    src: 'https://www.youtube.com/embed/%id%?autoplay=1' // URL that will be set as a source for iframe.
                },
                vimeo: {
                    index: 'vimeo.com/',
                    id: '/',
                    src: '//player.vimeo.com/video/%id%?autoplay=1'
                }
            },

            srcAction: 'iframe_src', // Templating object key. First part defines CSS selector, second attribute. "iframe_src" means: find "iframe" and set attribute "src".
        },
        mainClass: 'mfp-fade',
        removalDelay: 160,
        preloader: false,
        fixedContentPos: false
    });

	// replace footer email sign up on submission with success/failure content asset
	$('#footer-email-signup').submit(function(e){
		e.preventDefault();
		var input=$(this).find('input[type=email]');
		if(input.valid()){
			var url = util.appendParamToURL(this.action,'emailaddress',input.val());
			var footerSignup = $(this);
			$.ajax({
				url: url,
				type: 'get',
				dataType: 'html'
			})
			.done(function (response) {
				footerSignup.html(response);
			});
		}
	});

	$('#dwfrm_infodelete_state,#dwfrm_inforequest_state').change(function(e){
		if("OTHER"===$(this).val()){
			$(this).parents("form").hide();
			$("#info-request-not-california").toggleClass("visually-hidden");
		}
	}).change();
	$('input[name="dwfrm_infodelete_request"]').change(function(e){
		$("#delete-request-confirm").removeClass("visually-hidden");
		if($('#dwfrm_infodelete_request-all').is(':checked')){
			$('#delete-request-confirm,#dwfrm_infodelete .delete-confirm,#dwfrm_infodelete .delete-cancel').show();
			$('button[name="dwfrm_infodelete_delete"]').attr('disabled','disabled');
		}else{
			$('#delete-request-confirm').hide();
			$('button[name="dwfrm_infodelete_delete"]').removeAttr('disabled');
		}
	}).change();
	$("#dwfrm_infodelete .delete-confirm").click(function(e){
		e.preventDefault();
		$('button[name="dwfrm_infodelete_delete"]').removeAttr('disabled');
		$("#dwfrm_infodelete .delete-confirm,#dwfrm_infodelete .delete-cancel").hide();
	});
	$("#dwfrm_infodelete .delete-cancel").click(function(e){
		e.preventDefault();
		window.location=window.location.href;
	});
}
/**
 * @private
 * @function
 * @description Adds class ('js') to html for css targeting and loads js specific styles.
 */
function initializeDom() {
    // add class to html for css targeting
    $('html').addClass('js');
    if (SitePreferences.LISTING_INFINITE_SCROLL) {
        $('html').addClass('infinite-scroll');
    }
    // load js specific styles
    util.limitCharacters();
}

var pages = {
    account: require('./pages/account'),
    cart: require('./pages/cart'),
    checkout: require('./pages/checkout'),
    compare: require('./pages/compare'),
    product: require('./pages/product'),
    registry: require('./pages/registry'),
    search: require('./pages/search'),
    storefront: require('./pages/storefront'),
    wishlist: require('./pages/wishlist'),
    storelocator: require('./pages/storelocator')
};

var app = {
    init: function () {
        if (document.cookie.length === 0) {
            $('<div/>').addClass('browser-compatibility-alert').append($('<p/>').addClass('browser-error').html(Resources.COOKIES_DISABLED)).appendTo('#browser-check');
        }
        initializeDom();
        initializeEvents();

        // init specific global components
        countries.init();
        tooltip.init();
        minicart.init();
        validator.init();
        rating.init();
        searchplaceholder.init();
        // execute page specific initializations
        $.extend(page, window.pageContext);
        var ns = page.ns;
        if (ns && pages[ns] && pages[ns].init) {
            pages[ns].init();
        }
        page.cookieBannerClose();
        page.cookieBannerCheckClose();

        // Check TLS status if indicated by site preference
        if (SitePreferences.CHECK_TLS === true) {
            tls.getUserAgent();
        }
    }
};

// general extension functions
(function () {
    String.format = function () {
        var s = arguments[0];
        var i, len = arguments.length - 1;
        for (i = 0; i < len; i++) {
            var reg = new RegExp('\\{' + i + '\\}', 'gm');
            s = s.replace(reg, arguments[i + 1]);
        }
        return s;
    };
})();


//Smart Resize
////////////////////////////////////////////////////////////////////////////////////////////////////////////
(function($,sr){
    // debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function (func, threshold, execAsap) {
    var timeout;
        return function debounced () {
            var obj = this, args = arguments;
                function delayed () {
                    if (!execAsap)
                        func.apply(obj, args);
                        timeout = null;
                };

            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);

                timeout = setTimeout(delayed, threshold || 500);
        };
    }
    // smartresize
    jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
}(jQuery,'smartresize'));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// initialize app
$(document).ready(function () {
    app.init();
});
