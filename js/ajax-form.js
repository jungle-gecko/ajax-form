+function ($) {
	
	var AjaxForm = function (element, options)
	{
		var myAjaxForm = this;
		this.options = $.extend(true, {}, $.fn.ajaxform.defaults, options);
		myAjaxForm.$form = $(element);
		
		// Token CSRF
		myAjaxForm.csrfValue = '';
		if (this.options.csrf.url != '')
		{
			$.ajax({
				type: 'get',
				url: this.options.csrf.url,
				dataType: "text",
				timeout: 60000,
				success: function(result)
				{
					myAjaxForm.csrfValue = result;
				},
        		        error: function(request, status, err)
        		        {
        		        	console.log('Error building Ajax Form!')
        		        }
			});
		}
		
		myAjaxForm.$form.addClass('ajax-form');
		
		myAjaxForm.$form.find('.ajax-form_submit').click(function() {
			myAjaxForm.$form.submit();
		});
		
		myAjaxForm.$form.find('.ajax-form_valid_box').remove();
		myAjaxForm.$form.find('.ajax-form_error_box').remove();
		myAjaxForm.$form.prepend(
				'<div class="container-fluid">' +
				'	<div class="ajax-form_valid_box hidden">' +
				'		<div class="alert alert-success alert-dismissible">' +
				'			<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
				'			<span class="glyphicon glyphicon-ok"></span>' +
				'			<span class="alert-text ajax-form_valid_message"></span>' +
				'		</div>' +
				'	</div>' +
				'	<div class="ajax-form_error_box hidden">' +
				'		<div class="alert alert-danger alert-dismissible">' +
				'			<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
				'			<span class="glyphicon glyphicon-exclamation-sign"></span>' +
				'			<span class="alert-text ajax-form_error_message"></span>' +
				'		</div>' +
				'	</div>' +
				'</div>'
		);
	
		myAjaxForm.$form.find('.ajax-form_valid_box, .ajax-form_error_box').hide().removeClass('hidden');
		
		myAjaxForm.$form.find('button.close').click(function() {
			myAjaxForm.clearAlert($(this).parent().parent());
		});
		
		myAjaxForm.$form.submit(function(event) {
			event.preventDefault();
	
			myAjaxForm.clearAlerts(function() {
	
        			var submitHTML = myAjaxForm.$form.find('.ajax-form_submit').html();
        			myAjaxForm.$form.find('.ajax-form_submit').powerLoadingButton(myAjaxForm.options.loadingText, function() {
        
        			var data = myAjaxForm.$form.serialize();
        		    	if (myAjaxForm.csrfValue != '') {
        		    		data += '&' + myAjaxForm.options.csrf.token + '=' + myAjaxForm.csrfValue;
        		    	}
        		    	
    				$.ajax({
    					type: myAjaxForm.$form.attr('method') || 'post',
    					url: myAjaxForm.$form.attr('action'),
    					data: data,
    					dataType: "json",
    					timeout: 60000,
    					success: function(result)
    					{
    						if (result.code == 0) {
    							if (result.message instanceof Array)
    							{
    								myAjaxForm.$form.find('.ajax-form_valid_message').html(result.message.join('<br />'));
    							}
    							else
    							{
    								myAjaxForm.$form.find('.ajax-form_valid_message').html(result.message);
    							}
    							myAjaxForm.$form.find('.ajax-form_valid_box').slideDown();
    							
    							myAjaxForm.$form[0].reset();
    		
    							if(typeof myAjaxForm.options.callback === "function") {
    								if (typeof result.callback_vars !== 'undefined') {
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
    								myAjaxForm.$form.find('.ajax-form_error_message').html(result.message.join('<br />'));	
    							}
    							else
    							{
    								myAjaxForm.$form.find('.ajax-form_error_message').html(result.message);
    							}
    							if (typeof result.errors !== 'undefined')
    							{
    								for (var property in result.errors) {
    								    if (result.errors.hasOwnProperty(property)) {
    								    	for (var i = 0; i < result.errors[property].length; i++)
    							    		{
    									    	myAjaxForm.$form.find('.ajax-form_error_message').append('<br/> &bull; ' + result.errors[property][i]);
    							    		}
    								    }
    								}
    							}
    							myAjaxForm.$form.find('.ajax-form_error_box').slideDown();
    						}
    		
    						myAjaxForm.$form.find('.ajax-form_submit').powerSubmitButton(submitHTML);
    					},
        			        error: function(request, status, err)
        			        {
                		            	myAjaxForm.$form.find('.ajax-form_error_message').html("Erreur inattendue (" + err + "). Veuillez réessayer plus tard.");
                						myAjaxForm.$form.find('.ajax-form_error_box').slideDown();
                		
                						myAjaxForm.$form.find('.ajax-form_submit').powerSubmitButton(submitHTML);
                			        }
        				});
        			});
			});
		});
	};
	
	AjaxForm.prototype.clearAlerts = function(callback)
	{
		var myAjaxForm = this;
		
		myAjaxForm.$form.find('.ajax-form_valid_box, .ajax-form_error_box').slideUp('fast', function() {
			myAjaxForm.$form.find('.ajax-form_valid_message, .ajax-form_error_message').empty();

			if (typeof callback === "function") {
				callback();
			}
		});
	};
	
	AjaxForm.prototype.clearAlert = function($alert)
	{
		$alert.slideUp('fast', function() {
			$alert.find('.ajax-form_valid_message, .ajax-form_error_message').empty();
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

	$.fn.ajaxform = function (options) {
		return new AjaxForm(this, options);
	};
	
	$.fn.ajaxform.defaults = {
		csrf: {
			url: '',
			token: '_token'
		},
		loadingText: 'Loading...',
		callback: function() {}
	};

}(jQuery);