'use strict';

function sliderInit(elem, options) {
    var _slider = $(elem),
    defaultResponsive = [
        {
            breakpoint: 768,
            settings: {
                infinite: false,
                slidesToShow: 1,
                slidesToScroll: 1,
                dots: false,
                arrows: true,
                centerMode: false,
                arrows: true
            }
        }
    ];

    if ($(_slider).hasClass('slick-initialized')) {
        $(_slider).slick('unslick');
    } else if (_slider.hasClass('product-slider')) {
        var productTile = require('./product-tile');
        productTile.init();
    }

    // set default options value
    if (Object.keys(options).length === 0 || typeof(options) === undefined) {
        options = {
            infinite: false,
            variableWidth: false,
            arrows: true,
            dots: false,
            slidesToShow: 3,
            slidesToScroll: 1,
            centerMode: true,
            mobileFirst: true,
            responsive: defaultResponsive
        };
    } else {
        // if options is available
        // set default breakpoint if not available in options
        if (!options.hasOwnProperty('responsive')) { //eslint-disable-line
            options.responsive = defaultResponsive;
        }
    }

    $(_slider).slick(options);
    $(_slider).addClass('slider-active');

}

exports.init = function(elem, options={}) {
    sliderInit(elem, options);
}
