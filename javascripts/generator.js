(function(window) {
  $.fn.serializeObject = function() {
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

  var Generator = {
    _currentDataURL: '',
    _dirty: false,
    loadBackgroundImage: function() {
      for (var i = 1; i < 65; i++) {
        $('#background-loader .controls').append('<label class="radio" data-value="'+i+'">'+
            '<input type="radio" name="background-image" value="'+i+'" checked="checked">'+
            '<span class="background-image-container" data-source="'+i+'"><img/></span>'+
          '</label>');
      }
    },

    init: function() {
      // Modernizr warning
      if (!Modernizr.canvas || ! Modernizr.canvastext || !Modernizr.fontface) {
        $('#page-header').append('<div class="alert"><strong>Warning!</strong> Your browser doesn\'t support canvas and facefont. Please consider to use a more modern browser such as Mozilla Firefox or Google Chrome.</div>');
      }

      this.loadBackgroundImage();
      for (var i = 1; i <= 6; i++) {
        var container = $('#background-loader .controls .radio[data-value="'+i+'"]');
        container.addClass('visible');
        if (container.find('img').prop('src') === '') {
          container.find('img').prop('src', 'images/background/' + i + '.png');
        }
      }
      $('#pager').pagination({
        total_pages: 11,
        current_page: 1,
        callback: function(event, page) {
          event.preventDefault();
          $('#background-loader .controls .radio.visible').removeClass('visible');
          for (var i = 1 + (page - 1) * 6; i <= 6 + (page - 1) * 6; i++) {
            var container = $('#background-loader .controls .radio[data-value="'+i+'"]');
            container.addClass('visible');
            if (container.find('img').prop('src') === '') {
              container.find('img').prop('src', 'images/background/' + i + '.png');
            }
          }
          return false;
        }
      });

      // Fork selector
      for (var i = 0 ; i < 5; i++) {
        var clone = $('#leaders').clone();
        clone.prop('id', 'leaders' + i);
        clone.appendTo($('#leaders-container'));
      }

      // Fork second selector
      for (var j = 0 ; j < 8; j++) {
        var clone = $('#leaders').clone();
        clone.prop('id', 'functional-leaders' + j);
        clone.prop('name', 'functional-leaders');
        clone.appendTo($('#functional-leaders-container'));
      }
      
      var self = this;
      $('form').change(function() {
        self._dirty = true;
        self.submit();
      });

      $('#upload').click(function() {
        if (self._uploading)
          return;

        $('#upload').removeClass('btn-primary')
                    .removeClass('btn-link')
                    .removeClass('btn-danger')
                    .prop('download', '')
                    .prop('href', '#');
        var img;
        $('#upload').text('uploading...');
        self._uploading = true;
        try {
          img = self._currentDataURL.split(',')[1];
        } catch(e) {
          img = self._currentDataURL.split(',')[1];
        }
        $.ajax({
            url: 'https://api.imgur.com/3/image',
            type: 'POST',
            beforeSend: function($xhr) {
              $xhr.setRequestHeader('Authorization', 'Client-ID e13864a62bbe306');
            },
            data: {
              image: img
            },
            dataType: 'json'
        }).success(function(data) {
          //console.log('post done!', data); //data would be like:
          /*{
              data:{
                  id: "pinMEoq",
                  deletehash: "EgxuoPAyCCfd5FP",
                  link:"http://i.imgur.com/pinMEoq.png"
              },
              success:true,
              status:200
            }
          */
          $('#upload').text(data.link);
          $('#upload').prop('download', 'pad.png');
          $('#upload').prop('href', data.link);
        }).error(function() {
          $('#upload').removeClass('btn-link').addClass('btn-danger');
          alert('Could not reach api.imgur.com. Sorry :(');
        });
      });

      $('#download').hide();
      if (false && Modernizr.adownload) {
        $('#download').click(function(evt) {
          console.log(self._currentDataURL);
          window.href = self._currentDataURL;
        });
        $('#downloader').show();
      } else {
        $('#downloader').hide();
      }

      $('form').submit(function(evt) {
        evt.preventDefault();
        // Or by really submit
        if (self._dirty)
          self.submit();
        return false;
      });
    },

    submit: function() {
      var self = this;
      $('#download').hide();
      $('#upload').hide();
      $('#upload').text('Upload image to imgur..');
      $('#upload').removeClass('btn-link').removeClass('btn-danger').addClass('btn-primary');
      $('#previewImage').prop('src', 'resource/ajax-loader.gif');
      if (Modernizr.canvas && Modernizr.canvastext) {
        window.renderClient($('form').serializeObject(), function(result) {
          if (!result)
            return;
          self._currentDataURL = result;
          $('#previewImage').prop('src', result);
          $('#download').show();
          $('#upload').show();
        });
      } else {
        $.post('/form', $('form').serializeObject(),
        function(result){
          self._currentDataURL = result;
          $('#previewImage').prop('src', result);
        });
      }
    }
  };

  Generator.init();
}(this));