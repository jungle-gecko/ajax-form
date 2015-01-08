+function ($) {
	
	var AjaxForm = function (element, options)
	{
		var myAjaxForm = this;
		var $form = $(element);
		myAjaxForm.options = $.extend(true, {}, $.fn.ajaxform.defaults, options);
		
		$form.addClass('ajax-form');
		
		$form.find('.ajax-form_submit').click(function() {
			$form.submit();
		});
	
		$form.prepend(
				'	<div class="ajax-form_valid_box hidden">' +
				'		<div class="alert alert-success alert-dismissible">' +
				'			<span class="glyphicon glyphicon-ok"></span>' +
				'			<span class="alert-text ajax-form_valid_message"></span>' +
				'		</div>' +
				'	</div>' +
				'	<div class="ajax-form_error_box hidden">' +
				'		<div class="alert alert-danger alert-dismissible">' +
				'			<span class="glyphicon glyphicon-exclamation-sign"></span>' +
				'			<span class="alert-text ajax-form_error_message"></span>' +
				'		</div>' +
				'	</div>'
		);
		$form.find('.ajax-form_valid_box, .ajax-form_error_box').hide().removeClass('hidden');
		
		$form.submit(function(event) {
			event.preventDefault();
	
			$form.find('.ajax-form_valid_box:visible').slideUp('fast', function() {
				$form.find('.ajax-form_valid_message').empty();
			});
			$form.find('.ajax-form_error_box:visible').slideUp('fast', function() {
				$form.find('.ajax-form_error_message').empty();
			});
	
			$form.find('.ajax-form_submit').powerLoadingButton('Loading...', function() {

				var data = $form.serialize();
		    	if (data.indexOf('_token') == -1 && myAjaxForm.options.csrf != '') {
		    		data += '&_token=' + myAjaxForm.options.csrf;
		    	}
		    	
				$.ajax({
					type: $form.attr('method') || 'post',
					url: $form.attr('action'),
					data: data,
					dataType: "json",
					timeout: 5000,
					success: function(result)
					{
						if (result.code == 0) {
							if (result.message instanceof Array)
							{
								$form.find('.ajax-form_valid_message').html(result.message.join('<br />'));
							}
							else
							{
								$form.find('.ajax-form_valid_message').html(result.message);
							}
							$form.find('.ajax-form_valid_box').slideDown();
							
							$form[0].reset();
		
							if(typeof myAjaxForm.options.callback === "function") {
								if (typeof result.callback_vars != 'undefined') {
									myAjaxForm.options.callback(result.callback_vars);
								}
								else {
									myAjaxForm.options.callback();
								}	
							}
						}
						else {
							if (result.message instanceof Array)
							{
								$form.find('.ajax-form_error_message').html(result.message.join('<br />'));	
							}
							else
							{
								$form.find('.ajax-form_error_message').html(result.message);
							}
							$form.find('.ajax-form_error_box').slideDown();
						}
		
						$form.find('.ajax-form_submit').powerSubmitButton('Sign In');
					},
			        error: function(request, status, err)
			        {
		            	$form.find('.ajax-form_error_message').html("Unexpected error (" + err + "). Please try again later.");
						$form.find('.ajax-form_error_box').slideDown();
		
						$form.find('.ajax-form_submit').powerSubmitButton('Sign In');
			        }
				});
				
			});
		});
	};
	
	AjaxForm.prototype.serialize = function()
	{
	    var o = {};
	    var a = this.serializeArray();
	    $.each(a, function() {
	        if (o[this.name] !== undefined) {
	            if (!o[this.name].push) {
	                o[this.name] = [o[this.name]];
	            }
	            o[this.name].push(this.value || '');
	        } else {
	            o[this.name] = this.value || '';
	        }
	    });
	    return o;
	};

	$.fn.ajaxform = function (options = {}) {
		return new AjaxForm(this, options);
	};
	
	$.fn.ajaxform.defaults = {
		csrf: '',
		callback: function() {}
	};

}(jQuery);