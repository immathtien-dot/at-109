
let canvas;
let xPos = 0;
let yPos = 0;
let easing = .005;

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0.0);
    canvas.style("z-index", -2);
    //background(225);
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}

function draw(){
    clear();

    xPos = xPos + (mouseX - xPos) * easing;
    yPos = yPos + (mouseY - yPos) * easing;

    drawThing (xPos, yPos);
}

function drawThing(_x, _y) {
    //draw eyeballs
    fill(225);
    ellipse(_x , _y, 30, 30);
    ellipse(_x - 20, _y + 5, 30, 30);

    //draw pupils
    fill(0);
    ellipse(_x + 10, _y, 5, 5);
    ellipse(_x - 10, _y + 5, 5, 5);
}