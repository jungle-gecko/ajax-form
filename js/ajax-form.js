+function ($) {
	
	var ajaxFormScriptURL = $("script[src]").last().attr("src").split('?')[0].split('/').slice(0, -2).join('/')+'/';
	
	var AjaxForm = function (element, options)
	{
		var myAjaxForm = this;
		
		myAjaxForm.options = $.extend(true, {}, $.fn.ajaxform.defaults, options);
		myAjaxForm.$form = $(element);
		
		myAjaxForm.$form.addClass('ajax-form');
		
		myAjaxForm.$form.find('.ajax-form_submit').click(function() {
			myAjaxForm.$form.submit();
		});
		
		myAjaxForm.$form.find('.ajax-form_success_box').remove();
		myAjaxForm.$form.find('.ajax-form_error_box').remove();
		myAjaxForm.$form.prepend(
				'<div class="container-fluid">' +
				'	<div class="ajax-form_success_box hidden">' +
				'		<div class="alert alert-success alert-dismissible">' +
				'			<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
				'			<span class="glyphicon glyphicon-ok"></span>' +
				'			<span class="alert-text ajax-form_success_message"></span>' +
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
	
		myAjaxForm.$form.find('.ajax-form_success_box, .ajax-form_error_box').hide().removeClass('hidden');
		
		myAjaxForm.$form.find('button.close').click(function() {
			myAjaxForm.clearAlert($(this).parent().parent());
		});
		
		myAjaxForm.$form.submit(function(event) {

			event.stopPropagation();
			event.preventDefault();
			
			$.when(myAjaxForm.clearAlerts()).then(function()
			{
				var data = myAjaxForm.$form.serialize();
					
				var submission = $.ajax({
					type: myAjaxForm.$form.attr('method') || 'post',
					url: myAjaxForm.$form.attr('action'),
					data: data,
					dataType: "json",
					timeout: myAjaxForm.options.timeout
				})
				.done(function(result, status, jqXHR)
				{
					if (typeof result.code !== 'undefined' && result.code === 0)
					{
						myAjaxForm.showAlert('success', jqXHR);
						
						if (myAjaxForm.options.resetOnSuccess == true) 
						{
							myAjaxForm.$form[0].reset();
						}
	
						if (typeof myAjaxForm.options.callback === "function")
						{
							if (typeof result.callback_vars !== 'undefined')
							{
								myAjaxForm.options.callback(result.callback_vars);
							}
							else
							{
								myAjaxForm.options.callback();
							}	
						}
					}
					else
					{
						myAjaxForm.showAlert('error', jqXHR);
					}
				})
				.fail(function(jqXHR, status, errorThrown)
				{
					myAjaxForm.showAlert('error', jqXHR);
				});
			});
		});
	};
	
	AjaxForm.prototype.loadJSONResource = function(resource)
	{
		var resourceContent = null;
		$.ajax({
			async: false,
			url: resource,
			dataType: "json",
			success: function(result) {
				resourceContent = result;
			},
			error: function(request, status, err) {
				console.error("Unable to load '" + resource + "'");
			}
		});
		return resourceContent;
	};
	
	AjaxForm.prototype.getLocalizedText = function(key, params)
	{
		var myAjaxForm = this;
		
		if (myAjaxForm.localizedTexts == null) {
			myAjaxForm.localizedTexts = myAjaxForm.loadJSONResource(ajaxFormScriptURL + 'locales/' + myAjaxForm.options.locale + '/ajax-form-texts.json');
		}
		var text = myAjaxForm.localizedTexts[key];
		if (text !== 'undefined' && text != null && params != null && params instanceof Array) {
			for (var i = 0; i < params.length; i++) {
				text = text.replace('{' + i + '}', params[i]);
			}
		}
		return text;
	}
	
	AjaxForm.prototype.showAlert = function(type, jqXHR)
	{
		var myAjaxForm = this;
		var message = '';
		
		var content = jqXHR.responseJSON;
		
		// In case of content directly at the root
		if (typeof content === 'string')
		{
			message = content;
		}
		else if (content instanceof Array)
		{
			message = content.join('<br />');
		}
		else if (content instanceof Object)
		{
			for (var property in content) 
			{
				if (content.hasOwnProperty(property))
				{
					for (var i = 0; i < content[property].length; i++)
					{
						message += '<br/> &bull; ' + content[property][i];
					}
				}
			}
		}

		// In case of code + message objects
		if (typeof content !== 'undefined' && typeof content.code !== 'undefined' && typeof content.message !== 'undefined')
		{
			if (typeof content.message === 'string')
			{
				message = content.message;
			}
			else if (content.message instanceof Array)
			{
				message = content.message.join('<br />');
			}
		}
		
		// In case of errors array
		if (typeof content !== 'undefined' && typeof content.errors !== 'undefined')
		{
			for (var property in result.errors) 
			{
				if (result.errors.hasOwnProperty(property))
				{
					for (var i = 0; i < result.errors[property].length; i++)
					{
						message += '<br/> &bull; ' + result.errors[property][i];
					}
				}
			}
		}
		
		// In case of message still empty
		if (message == '' || message == 'undefined' )
		{
			message = myAjaxForm.getLocalizedText(type, [jqXHR.statusText]);
		}
		
		myAjaxForm.$form.find('.ajax-form_' + type + '_message').html(message);
		myAjaxForm.$form.find('.ajax-form_' + type + '_box').slideDown();
	};
	
	AjaxForm.prototype.clearAlerts = function()
	{
		var myAjaxForm = this;
		
		$.when(
			myAjaxForm.$form.find('.ajax-form_success_box, .ajax-form_error_box').slideUp('fast')
		).then(function()
		{
			myAjaxForm.$form.find('.ajax-form_success_message, .ajax-form_error_message').empty();
		});
	};
	
	AjaxForm.prototype.clearAlert = function($alert)
	{
		$.when(
			$alert.slideUp('fast')
		).then(function()
		{
			$alert.find('.ajax-form_success_message, .ajax-form_error_message').empty();
		});
	};
	
	AjaxForm.prototype.serialize = function()
	{
	    var o = {};
	    var a = this.serializeArray();
	    $.each(a, function()
	    {
	        if (o[this.name] !== undefined)
	        {
	            if (!o[this.name].push)
	            {
	                o[this.name] = [o[this.name]];
	            }
	            o[this.name].push(this.value || '');
	        } else {
	            o[this.name] = this.value || '';
	        }
	    });
	    return o;
	};

	$.fn.ajaxform = function (options)
	{
		return new AjaxForm(this, options);
	};
	
	$.fn.ajaxform.defaults = {
		timeout: 60000,
		locale: 'en',
		resetOnSuccess: true,
		callback: function() {}
	};

}(jQuery);