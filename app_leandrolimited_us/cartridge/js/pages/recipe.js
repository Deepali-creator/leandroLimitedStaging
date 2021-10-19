'use strict';

var dialog = require('../dialog'),
	util = require('../util'),
	sendToFriend = require('../send-to-friend');


/**
 * @description Initialize event handlers on recipe detail page
 */
function initializeEvents() {
	var $recipeMain = $('.recipe-main');
	var thumbs = $('.thumbs-wrap');
	sendToFriend.initializeDialog($recipeMain);
	
	function thumbsInit(){
		var maxHeight = $('.recipe-primary-image').height();
		var thumbHeight = $('li.thumb').height();
		var thumbsHeight = thumbs.height();
		
		if(thumbs.length && (thumbs.height() >= 275)){
			thumbs.addClass('overflow');
			if(!$('.thumbNav').length){
				$("<a href='#' class='thumbNav prev-thumbs disabled' data-title='prev'><span><i class='fa fa-angle-up'></i></span></a><ul class='overflow-block'></ul><a href='#' class='thumbNav next-thumbs' data-title='next'><span><i class='fa fa-angle-down'></i></span></a>").prependTo(thumbs);
				thumbs.find('ul').contents().clone().appendTo('.overflow-block');
				checkPos();
			}
		}
		
		// Recipe Mobile Flexslider Init
		if($('#thumbnails .thumb').length){
			$('.recipe-main .recipe-col-1 #thumbnails ul').contents().clone().removeClass('selected').removeClass('thumb').appendTo('.recipe-col-1 .mobile-images-block ul.slides');
			
			if($('.recipe-video-button').length){
				$('.recipe-primary-image').find('a').clone(true).insertAfter('.mobile-images-block').addClass('videoLinkText small-mobile-only').html("<i class='fa fa-play-circle'></i> <span>"+Resources.VIEW_VIDEO+"</span>");
				$('.videoproducttext').find('img').remove();
			}
		} else {
			$('.recipe-col-1 .mobile-images-block ul').hide();
		};
		
		$('.mobile-images-block').flexslider({
			animation: "slide",
			animationLoop: false,
			directionNav: true,
			controlNav: false,
			slideshow: false,
			smoothHeight: true,
			start: function(){
				//console.log("flexslider inititialized");
				$('.recipe-image-container').addClass("mobile-thumbs-active");
			}
		});
	}
	
	function checkPos(){
		var maxHeight = $('.overflow').height();
		var thumbsWrap = thumbs.height(),
			blockPos = $('.overflow-block').position();
		var posTop = blockPos.top,
			posBtm  = blockPos.top + $('.overflow-block').height() ;

		if(posTop==0 || posTop >= 35){
			$('.prev-thumbs').addClass('disabled');
		}else{
			$('.prev-thumbs').removeClass('disabled');
		}	

		if(posBtm < maxHeight - 35){
			$('.next-thumbs').addClass('disabled');
		}else{
			$('.next-thumbs').removeClass('disabled');
		}
	}

	function checkHeight(){
		var max = $('.main-image').height();
		thumbs.height(max);
	};

	$(window).on('load', function(){
		thumbsInit();
	});

	$(window).smartresize(function(){
		//thumbsInit();
		if(thumbs.length && $('.overflow-block').length){
			checkHeight();
			checkPos();
		}
	});
	
	$('.thumbs-wrap').on('click', '.thumbNav', function(e){
		e.preventDefault();
		var maxHeight = $('.main-image').height();
		var thumbsWrap = thumbs.height(),
		blockPos = $('.overflow-block').position();
		var posTop = blockPos.top,
		posBtm  = blockPos.top + $('.overflow-block').height();
		if($(this).attr('data-title') == "prev"){
			posTop+=75;
			
			if (posTop > 35) {
				posTop = 0;
			}
			
			
			thumbs.find('.overflow-block').stop().animate({
			        top: posTop
			    }, 500).promise().done(checkPos);
		}else if($(this).attr('data-title') == "next"){
			posTop-=75;
			thumbs.find('.overflow-block').stop().animate({
		        top: posTop,
		        complete: checkPos()
		    }, 500).promise().done(checkPos);
		}
	});
	
	$('#thumbnails').on('click', '.thumb > a', function(e){
		e.preventDefault();
		var $imgSrc = $(this).find('img').attr("src"),
			$imgThumbs = $('.recipe-image-container').find('.recipe-thumbnails'),
			$mainImg = $('.recipe-image-container .recipe-primary-image').find('img');
		console.log("click");
		$imgThumbs.find('.selected').removeClass("selected");
		$(this).parent().addClass("selected");
		if($mainImg.attr("src") != $imgSrc){
			$mainImg.attr("src", $imgSrc);
		}
		
	})
	
	$('.refinement-submenu .submenu-close-button').on('click', function(e){
		e.preventDefault();
		$('.recipe-main .recipe-refinements').removeClass("isActive");
		$(this).parents('.recipe-refinement').removeClass("active");
	});

	$('.recipe-main .refinement-button, .recipe-main .refinement-image').on('click', function(e){
		e.preventDefault();

		if($('.recipe-main .recipe-refinements').hasClass("isActive")){
			//Submenu is ACTIVE//
			
			if($(this).parent().hasClass("active")){
				//De-activate current panel and submenu//
				$('.recipe-refinements').removeClass("isActive");
				$(this).parent().removeClass("active");
			}else{
				$('.recipe-refinements').find('.active').removeClass("active");
				$(this).parent().addClass("active");
			}
			
		}else{
			//Submenu is INACTIVE//
			//Activate submenu and current panel
			$('.recipe-main .recipe-refinements').addClass("isActive");
			$(this).parent().addClass("active");
		}
	});
	
	$('.recipe-video-button').on('click', function (e) {
		e.preventDefault();
		
		var vidUrl = $(this).data('url'),
			vidID;
		
		//Extract ID from standard URL
		vidID = vidUrl.split("v=")[1];
		//Extract ID from share URL
		vidID = vidID != undefined ? vidID : vidUrl.split("youtu.be/")[1];
		
		dialog.open({
			options : {
				width: 640,
				height: 420,
				closeOnEscape: true,
				dialogClass: 'recipe-video-dialog',
			},
			html : '<iframe width="100%" height="315" src="https://www.youtube.com/embed/' + vidID + '" frameborder="0" allowfullscreen"></iframe>',
			callback: function(){
				$('.recipe-video-dialog iframe').fadeIn();
			}
		});
	});
	
}

var recipe = {
	initializeEvents: initializeEvents,
	init: function () {
		initializeEvents();
	}
};

module.exports = recipe;
