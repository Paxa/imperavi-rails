/*
  Plugin Drag and drop Upload v1.0.1
  http://imperavi.com/ 
  Copyright 2012, Imperavi Ltd.
*/
(function($){
  
  "use strict";
  
  // Initialization  
  $.fn.dragupload = function(options)
  {    
    return this.each(function() {
      var obj = new Construct(this, options);
      obj.init();
    });
  };
  
  // Options and variables  
  function Construct(el, options) {

    this.opts = $.extend({
    
      url: false,
      success: false,
      preview: false,
      
      text: RLANG.drop_file_here,
      atext: RLANG.or_choose
      
    }, options);
    
    this.$el = $(el);
  }

  // Functionality
  Construct.prototype = {
    init: function () {
      if (!$.browser.opera && !$.browser.msie) {

        this.droparea = $('<div class="redactor_droparea"></div>');
        this.dropareabox = $('<div class="redactor_dropareabox">' + this.opts.text + '</div>');  
        this.dropalternative = $('<div class="redactor_dropalternative">' + this.opts.atext + '</div>');

        this.droparea.append(this.dropareabox);

        this.$el.before(this.droparea);
        this.$el.before(this.dropalternative);

        // drag over
        this.dropareabox.bind('dragover', $.proxy(function() { return this.ondrag(); }, this));

        // drag leave
        this.dropareabox.bind('dragleave', $.proxy(function() { return this.ondragleave(); }, this));

        var uploadProgress = $.proxy(function (e) {
          var percent = parseInt(e.loaded / e.total * 100, 10);
          this.dropareabox.text('Loading ' + percent + '%');
        }, this);

        var xhr = jQuery.ajaxSettings.xhr();

        if (xhr.upload) {
          xhr.upload.addEventListener('progress', uploadProgress, false);
        }
        
        var provider = function () { return xhr; };

        // drop
        this.dropareabox.get(0).ondrop = $.proxy(function(event) {
          event.preventDefault();
          this.dropareabox.removeClass('hover').addClass('drop');

          var fd = new FormData();
          for (var fnum = 0; fnum < event.dataTransfer.files.length; fnum += 1) {
            var file = event.dataTransfer.files[fnum];
            fd.append('images[' + (fnum + 1) + ']', file);
          }

          $.ajax({
            dataType: 'html',
            url: this.opts.url,
            data: fd,
            xhr: provider,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: $.proxy(function(data) {
              if (this.opts.success !== false) this.opts.success(data);
              if (this.opts.preview === true) this.dropareabox.html(data);
            }, this)
          });

        }, this);
      }
    },

    ondrag: function () {
      this.dropareabox.addClass('hover');
      return false;
    },

    ondragleave: function () {
      this.dropareabox.removeClass('hover');
      return false;
    }
  };
})(jQuery);