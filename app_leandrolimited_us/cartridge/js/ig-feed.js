'use strict';

function initializeEvents() {

	function getSocialFeed(){
        var ig = $('#ig-feed'),
            count = 12,
			token = SitePreferences.INSTAGRAM_TOKEN_ID,
			igURL = "https://graph.instagram.com/me/media?fields=username,caption,media_type,media_url,thumbnail_url,permalink&access_token=" + token + "&limit=" + count;
		$.ajax({
			url:igURL,
			type: 'GET',
			dataType: "jsonp",
			success: function(result){
				var post = result.data,
					html = "";
				$.each(post, function(i){
					var postLink = post[i].permalink,
						postType = post[i].media_type,
						postImage = post[i].media_url,
						postCaption = post[i].caption,
						postUser = post[i].username;
						if (postType === 'VIDEO') {
							postImage = post[i].thumbnail_url;
						}
						html = '<li class="ig-tile"><a href="'+postLink+'" target="_blank" title="View on Instagram"><div class="image-wrap"><img src="'+postImage+'" alt="@'+postUser+'"/></div><p class="post-caption">'+ postCaption+'" <span class="view-desc-link" href="#"><span>Read More</span></span></p></a></li>';
						$(ig).append(html);
                });

				setTiles();
                initSlick();
			},
			error: function(){
				html = "<li><p>An unknown error has occurred. Please refresh the page and try again.</p></li>";
				$(ig).append(html)
			}
		});
	}

    function setTiles(){
		var $img = $('#ig-feed .image-wrap');
		$img.height($img.outerWidth());
		$img.find('.img-adj').height($img.outerWidth());
	}

	getSocialFeed();

    $(window).smartresize(function(){
        setTiles();
    });

}

function initSlick() {
	if ($('#ig-feed.slick-initialized').length > 0) {
        $('#ig-feed').slick('unslick');
	};

    $('#ig-feed').slick({
		centerMode: true,
		accessibility: false,
		slidesToShow: 1,
		slidesToScroll: 1,
		mobileFirst: true,
    	responsive: [{
    			breakpoint: 480,
    			settings: {
    				slidesToShow: 2
    			}
    		},
    		{
    			breakpoint: 768,
    			settings: {
    				slidesToShow: 4
    			}
    		}
    	]
    })
}

exports.init = function init () {
	initializeEvents();
};
