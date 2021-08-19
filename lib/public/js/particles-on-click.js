'use strict';

// Adapted from https://codepen.io/deanwagman/pen/EjLBdQ

// Little Canvas things
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d');

// Set Canvas to be window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configuration, Play with these
const config = {
  particleNumber: 30,
  maxParticleSize: 20,
  maxSpeed: 40,
  colorVariation: 50
};

// Colors
const colorPalette = {
    bg: { r: 0, g: 0, b: 0, a: 0 },
    matter: [
      { r: 36, g: 18, b: 42 }, // darkPRPL
      { r: 78, g: 36, b: 42 }, // rockDust
      { r: 252, g: 178, b: 96 }, // solorFlare
      { r: 253, g: 238, b: 152 } // totesASun
    ]
};

// Some Variables hanging out
let particles = [];
let drawBg;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Draws the background for the canvas, because space
drawBg = (ctx, color) => {

    ctx.fillStyle = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

// Particle Constructor
const Particle = function (x, y) {
    // X Coordinate
    this.x = x || Math.round(Math.random() * canvas.width);
    // Y Coordinate
    this.y = y || Math.round(Math.random() * canvas.height);
    // Radius of the space dust
    this.r = Math.ceil(Math.random() * config.maxParticleSize);
    // Color of the rock, given some randomness
    this.c = colorVariation(colorPalette.matter[Math.floor(Math.random() * colorPalette.matter.length)],true );
    // Speed of which the rock travels
    this.s = Math.pow(Math.ceil(Math.random() * config.maxSpeed), .7);
    // Direction the Rock flies
    this.d = Math.round(Math.random() * 360);
};

// Provides some nice color variation
// Accepts an rgba object
// returns a modified rgba object or a rgba string if true is passed in for argument 2
const colorVariation = function (color, returnString) {

    var r,g,b,a, variation;
    r = Math.round(((Math.random() * config.colorVariation) - (config.colorVariation/2)) + color.r);
    g = Math.round(((Math.random() * config.colorVariation) - (config.colorVariation/2)) + color.g);
    b = Math.round(((Math.random() * config.colorVariation) - (config.colorVariation/2)) + color.b);
    a = Math.random() + .5;
    if (returnString) {
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    } else {
        return {r,g,b,a};
    }
};

// Used to find the rocks next point in space, accounting for speed and direction
const updateParticleModel = function (p) {

    var a = 180 - (p.d + 90); // find the 3rd angle
    p.d > 0 && p.d < 180 ? p.x += p.s * Math.sin(p.d) / Math.sin(p.s) : p.x -= p.s * Math.sin(p.d) / Math.sin(p.s);
    p.d > 90 && p.d < 270 ? p.y += p.s * Math.sin(a) / Math.sin(p.s) : p.y -= p.s * Math.sin(a) / Math.sin(p.s);
    return p;
};

const tacoImg = document.createElement('img');
tacoImg.src = '/public/taco.png';

// Just the function that physically draws the particles
// Physically? sure why not, physically.
const drawParticle = function (x, y, r, c) {

    const size = r * 2;

    // ctx.globalCompositeOperation = 'copy'; // copy pixel-to-pixel source image
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(tacoImg, x, y, size, size);
    // ctx.globalCompositeOperation = 'source-over';
    // ctx.globalCompositeOperation = 'multiply'; // multiply it by color
    // ctx.fillStyle = c;
    // ctx.fillStyle = '#ff0000';
    // ctx.fillRect(x, y, size, size);
    // ctx.globalCompositeOperation = 'destination-atop'; // restore transparency
    // ctx.drawImage(tacoImg, x, y, size, size);
    // ctx.globalCompositeOperation = 'source-over';
};

// Remove particles that aren't on the canvas
const cleanUpArray = function () {
    particles = particles.filter((p) => {
      return (p.x > -100 && p.y > -100);
    });
};

const initParticles = function (numParticles, x, y) {

    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(x, y));
    }

    particles.forEach((p) => {

        drawParticle(p.x, p.y, p.r, p.c);
    });
};

// That thing
window.requestAnimFrame = (() => {

  return window.requestAnimationFrame ||
     window.webkitRequestAnimationFrame ||
     window.mozRequestAnimationFrame ||
     function(callback) {
        window.setTimeout(callback, 1000 / 60);
     };
})();

// Our Frame function
const frame = () => {
  // Draw background first
  drawBg(ctx, colorPalette.bg);
  // Update Particle models to new position
  particles.map((p) => {
    return updateParticleModel(p);
  });
  // Draw em'
  particles.forEach((p) => {

        drawParticle(p.x, p.y, p.r, p.c);
  });
  // Play the same song? Ok!
  window.requestAnimFrame(frame);
};

// First Frame
frame();

// First particle explosion
initParticles(config.particleNumber);

exports.genParticles = (x, y) => {

    cleanUpArray();
    initParticles(config.particleNumber, x, y);
};
