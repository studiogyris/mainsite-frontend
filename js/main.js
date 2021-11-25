$(document).ready(function(){
	var mute = $('#mute-video');
	var video = $('#hero-video');

	mute.click(function(event) {
		event.preventDefault();
		if( video.prop('muted') )
		    {
		    	video.get(0).pause();
		    	video.get(0).currentTime = 0;
		    	video.fadeOut();
		        video.prop('muted', false);
		        video.get(0).play();
		        video.fadeIn();
		        mute.text('DISABLE SOUND');
		    }
		    else {
		    	video.prop('muted', true);
		    	mute.text('ENABLE SOUND');
		    }
		});
	return;
})

$(document).ready(function(){
	var play = $('#play-mobile-video');
	var video = $('#mobile-video');
	var replay = $('.mobile-video-ended');

	play.click(function(event) {
		event.preventDefault();
		replay.hide();
		if( video.prop('muted') )
		    {
		        video.prop('muted', false);
		        video.get(0).currentTime = 0;
		        video.get(0).play();
		        video.fadeIn();
		        play.text('CLOSE TEASER');
		    }
		    else {
		    	video.fadeOut();
		    	video.get(0).pause();
		    	video.get(0).currentTime = 0;
		    	video.prop('muted', true);
		    	play.text('WATCH TEASER');
		    }
		});
	return;
})

$(document).ready(function(){
	var video = $('#mobile-video');
	var replay = $('.mobile-video-ended');
	var play = $('#play-mobile-video');

	replay.find('.row').outerHeight(video.height());

	video.on('ended',function(){
	  video.prop('muted', true);
      video.hide();
      replay.fadeIn();
      play.text('WATCH TEASER');
    });
})

$(document).ready(function(){
	var video = $('#mobile-video');
	var replay = $('.mobile-video-ended');
	var replaybutton = $('#replay-video-button');
	var play = $('#play-mobile-video');

	replaybutton.click(function(event) {
		event.preventDefault();
		play.text('CLOSE TEASER');
		replay.hide();
		video.prop('muted', false);
		video.get(0).currentTime = 0;
		video.get(0).play();
		video.fadeIn();
		
		
	});
})

$(document).ready(function(){
	var button = $('.roadmap-control .btn');

	button.click(function(event) {
		event.preventDefault();
		button.removeClass('active');
		$(this).addClass('active');
		$('[class^="stage-"]').fadeOut();
		var row = '.' + $(this).data('stage');
		$(row).fadeIn();
	});
})

$(document).ready(function(){
	var number = $('.number-input input');
	var less = $('.less');
	var more = $('.more');


	less.click(function(event) {
		var value = parseInt(number.val());
		if (value > 1) {
			number.val(value - 1);
		} else {
			return;
		}
	});
	more.click(function(event) {
		var value = parseInt(number.val());
		number.val(value + 1);
	});
})

if (window.location.pathname.replace(/\//g, "")=="epf") {
	$(document).ready(function(){
		 $('.main-slider').slick({
		  autoplay: true,
	  	  autoplaySpeed: 2000,
		  slidesToShow: 1,
		  slidesToScroll: 1,
		  arrows: false,
		  dots:false,
		  fade: true,
		  asNavFor: '.nav-slider'
		});
		$('.nav-slider').slick({
		  slidesToShow: 3,
		  slidesToScroll: 1,
		  asNavFor: '.main-slider',
		  dots: false,
		  arrows:false,
		  centerMode: false,
		  focusOnSelect: true
		});

	});
}



$(document).ready(function(){
	var button = $('button.red-button');
	var info = $('.info-block');

	button.click(function(event) {
		event.preventDefault();
		info.show();
		setTimeout(function() {
	        info.hide();
	    }, 2000);
	});
});


$(document).ready(function(){
    var $page = $('html, body');
    $('a[href^="#"]').click(function() {
        $page.animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, 600);
        return false;
    });
});
