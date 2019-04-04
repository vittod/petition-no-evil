"use strict";

(function() {

    var canvas = $('#signature');
    var ctx = canvas[0].getContext('2d');
    var cOt = $(canvas).offset().top;
    var cOl = $(canvas).offset().left;
    var brake = true;
    var signInput = $('[name="signature"]');
    var xBuff, yBuff, x, y;

    $('[name="petition-submit"]').on('mousedown', () => signInput.val(canvas[0].toDataURL()) )

    canvas.on('mousedown', (e) => {
        xBuff = e.clientX - cOl;
        yBuff = e.clientY - cOt;
        ctx.beginPath();
        ctx.moveTo(xBuff, yBuff);
        brake = false;
    }).on('dblclick', () => ctx.clearRect(0, 0, 500, 100))

    $(document).on('mouseup', () => {
        ctx.closePath();
        brake = true;
    })

    canvas.on('mousemove', (e) => {
        if (!brake) {
            x = e.clientX - cOl;
            y = e.clientY - cOt;
            ctx.lineTo(x, y);
            ctx.stroke();
            xBuff = x;
            yBuff = y;
        }
    })

})();
