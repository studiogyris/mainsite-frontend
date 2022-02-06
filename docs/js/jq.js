$(document).ready(function(){
	var mute = $('#mute-video');

	mute.click(function(event) {
		event.preventDefault();
		if( $("video").prop('muted') )
		    {
		        $("video").prop('muted', false);
		        mute.text('DISABLE SOUND');
		    }
		    else {
		    	$("video").prop('muted', true);
		    	mute.text('ENABLE SOUND');
		    }
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
		if (document.getElementById('mint-amount').disabled) return;
		var value = parseInt(number.val());
		if (value > 1) {
			number.val(value - 1);
		} else {
			return;
		}
	});
	more.click(function(event) {
		if (document.getElementById('mint-amount').disabled) return;
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
    $('a[href*="#"]').click(function() {
        $page.animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, 600);
        return false;
    });
});
