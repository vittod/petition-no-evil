

var canvas = $('#signature');
var dot = $('#canvas-dot');
var ctx = canvas[0].getContext('2d');
var ctxDot = dot[0].getContext('2d');
var cOt = $(canvas).offset().top;
var cOl = $(canvas).offset().left;
var brake = true;
var signInput = $('[name="signature"]');


canvas.on('mousedown', () => {
    brake = false;
});
$(document).on('mouseup', () => {
    brake = true;
})

canvas.on('mousemove', (e) => {
    if (!brake) {
        console.log('canvas X', e.clientX - cOl);
        console.log('canvas y', e.clientY - cOt);
        let x = e.clientX - cOl;
        let y = e.clientY - cOt;
        drawSignature(x, y);
    }
})

$('[name="petition-submit"]').on('mousedown', () => {
    signInput.val(canvas[0].toDataURL())
})


drawDot();

function drawDot() {
    ctxDot.beginPath();
    ctxDot.arc(1, 1, 1, 2 * 0, 2 * Math.PI);
    ctxDot.fill();
    // ctxDot.stroke();
    // ctxDot.closePath();
}

function drawSignature(x, y) {
    ctx.drawImage(dot[0], x, y, 2, 2)
}
