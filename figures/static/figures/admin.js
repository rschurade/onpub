(function($) {
    $(document).ready(function() {
        var $fieldRow = $('.form-row.image');
        
        // Only run on change form pages and only if an image has been uploaded already
        if (!$('body').is('.change-form') || !$('p.file-upload', $fieldRow).has('a').length) return;
        
        $('table textarea').attr('rows', 2).after('<p class="help"><strong>rectangle:</strong> x1,y1,x2,y2 — <strong>circle:</strong> x,y,r — <strong>polygon:</strong> x1,y1,x2,y2,…,xn,yn</p>');
        
        var $fieldset = $('fieldset#imagemap'),
            $image = $fieldset.find('img'),
            canvas = document.getElementById('imagemap-canvas'),
            $canvas = $(canvas),
            ctx = canvas.getContext && canvas.getContext('2d'),
            $coordsHelper = $fieldset.find('.coords-helper'),
            mapName = $image.attr('usemap'),
            mouseOverImage = false,
            focusInShapeField = false;
        
        if (ctx) {
            var img = new Image();
            $(img).bind('load', function() {
                ctx.drawImage(img, 0, 0);
                ctx.fillStyle = "rgba(255,255,255,0.5)";
                ctx.fillRect(0,0,1000,1000);
                ctx.fillStyle = "rgba(65,118,144,0.5)";
                var $areas = $('map[name="' + mapName.substr(1) + '"]').find('area');
                $areas.each(function(i, area) {
                    var h = 360/$areas.length * i,
                        fillColor = "hsla(" + h + ",100%,50%,0.5)";
                    ctx.fillStyle = fillColor;
                    var $area = $(area),
                        coords = $area.attr('coords').split(',');
                    if ($area.attr('shape') == 'rect') {
                        ctx.fillRect(coords[0], coords[1], coords[2]-coords[0], coords[3]-coords[1]);
                    } else if ($area.attr('shape') == 'circle') {
                        ctx.beginPath();
                        ctx.arc(coords[0], coords[1], coords[2], 0, Math.PI*2);
                        ctx.closePath();
                        ctx.fill();
                    } else if ($area.attr('shape') == 'poly') {
                        ctx.beginPath();
                        ctx.moveTo(coords[0], coords[1]);
                        for (var j=0, len=coords.length; j<len; j=j+2) {
                            ctx.lineTo(coords[j], coords[j+1]);
                        }
                        ctx.fill();
                        ctx.closePath();
                    }
                    var $colorIndicator = $('<div class="color"> </div>');
                    $colorIndicator.css('background-color', fillColor);
                    $('#imagemapareas-' + i + ' td.shape').append($colorIndicator);
                });
                $image.hide();
            });
            img.src = $image.attr('src');
            
            $canvas.click(function(e) {
                if (focusInShapeField) {
                    ctx.fillStyle = "rgb(255,255,255)";
                    ctx.fillRect(e.offsetX-3, e.offsetY-3, 7, 7);
                    ctx.fillStyle = "rgb(0,0,0)";
                    ctx.fillRect(e.offsetX-2, e.offsetY-2, 5, 5);
                }
            });
        }
        
        
        $image.add($canvas).mousemove(function(e) {
            $coordsHelper.text(e.offsetX + ',' + e.offsetY);
        }).mouseover(function(e) {
            mouseOverImage = true;
        }).mouseout(function(e) {
            mouseOverImage = false;
            $coordsHelper.text(' ');
        }).mousedown(function(e) {
            if (focusInShapeField) {
                e.preventDefault();
                e.stopPropagation();
                
                var $field = $(':focus'),
                    value = $field.val();
                if (value.length && value.charAt(value.length-1) != ',') value += ',';
                $field.val(value + $coordsHelper.text());
                
                return false;
            }
        });
        
        $('[name^="imagemapareas-"][name$="-coords"]').live('focus', function() {
            focusInShapeField = true;
            $canvas.addClass('active');
        }).live('blur', function() {
            focusInShapeField = false;
            $canvas.removeClass('active');
        });
        
        $('select[name$="-shape"]').live('change', function() {
            $(this).closest('tr').find('td.coords textarea').focus();
        });
        
    });
})(jQuery || django.jQuery);