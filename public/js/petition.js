"use strict";

(function() {

    $(document)
        .ready(function() {
            $('section').children().addClass('fadeIn');
            setTimeout(function() {
                var canvas = $('#signature');
                if (canvas.length > 0) {
                    var login = $('.indi-address').length;
                    var ctx = canvas[0].getContext('2d');
                    var scaleY = 100 / canvas.height();
                    var scaleX = 500 / canvas.width();
                    var cOt = $(canvas).offset().top;
                    var cOl = $(canvas).offset().left;
                    var brake = true;
                    var dbl = false;
                    var signInput = $('[name="signature"]');
                    var xBuff, yBuff, x, y;
                    ctx.scale(scaleX, scaleY);

                    if (login) {
                        $(window).scroll(function(e) {
                            cOt = canvas.offset().top - $(e.target).scrollTop();
                        })
                    }

                    $('[name="petition-submit"]')
                        .on('mousedown', function() {
                            signInput.val(canvas[0].toDataURL())
                        })

                    canvas
                        .on('mousedown', function(e) {
                        xBuff = e.clientX - cOl;
                        yBuff = e.clientY - cOt;
                        ctx.beginPath();
                        ctx.moveTo(xBuff, yBuff);
                        brake = false;
                    })
                        .on('mousemove', function(e) {
                            if (!brake) {
                                x = e.clientX - cOl;
                                y = e.clientY - cOt;
                                ctx.lineTo(x, y);
                                ctx.stroke();
                                xBuff = x;
                                yBuff = y;
                            }
                        })
                        .on('dblclick', function() {
                            ctx.clearRect(0, 0, 500, 100)
                        })
                        .on('touchstart', function(e) {
                            e.preventDefault();
                            canvas[0].dispatchEvent(new MouseEvent('mousedown', {
                              clientX: e.touches[0].clientX,
                              clientY: e.touches[0].clientY
                          }))
                        })
                        .on('touchmove', function(e) {
                            e.preventDefault();
                            canvas[0].dispatchEvent(new MouseEvent('mousemove', {
                              clientX: e.touches[0].clientX,
                              clientY: e.touches[0].clientY
                            }));
                        })
                        .on('touchend', function(e) {
                            dbl ? canvas.trigger('dblclick') : dbl = true;
                            setTimeout(function() {
                                dbl = false
                            }, 200)
                        })

                    $(document)
                        .on('mouseup', function() {
                            console.log('happen');
                            ctx.closePath();
                            brake = true;
                        })
                        .on('touchend', function() {
                            canvas.trigger('mouseup')
                        })

                }
            } ,800)
        })
        .on('click', '.navAnimTrig', function(e) {
            $('section').children().addClass('fadeOut')
        })

})();
