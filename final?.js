// var canvas = document.getElementById('canvas'),
//     ctx = canvas.getContext('2d'),
//     height = 400,
//     width = 400,
//     x = 200,
//     y = 0,
//     vy = 0,
//     ay = 0,
//     m = 0.1,    // Ball mass in kg
//     r = 10,     // Ball radius in cm, or pixels.
//     dt = 0.02,  // Time step.
//     e = -0.5,   // Coefficient of restitution ("bounciness")
//     rho = 1.2,  // Density of air. Try 1000 for water.
//     C_d = 0.47, // Coeffecient of drag for a ball
//     A = Math.PI * r * r / 10000 // Frontal area of the ball; divided by 10000 to compensate for the 1px = 1cm relation
//     ;

// ctx.fillStyle = 'red';

// function loop()
// { 
//     var fy = 0;
    
//     /* Weight force, which only affects the y-direction (because that's the direction gravity points). */
//     fy += m * 9.81;
    
//     /* Air resistance force; this would affect both x- and y-directions, but we're only looking at the y-axis in this example. */
//     fy += -1 * 0.5 * rho * C_d * A * vy * vy;
    
//     /* Verlet integration for the y-direction */
//     dy = vy * dt + (0.5 * avg_ay * dt * dt);
//      The following line is because the math assumes meters but we're assuming 1 cm per pixel, so we need to scale the results 
//     y += dy * 100;
//     new_ay = fy / m;
//     avg_ay = 0.5 * (new_ay + ay);
//     vy += avg_ay * dt;
    
//     /* Let's do very simple collision detection */
//     if (y + r > height && vy > 0)
//     {
//         /* This is a simplification of impulse-momentum collision response. e should be a negative number, which will change the velocity's direction. */
//         vy *= e; 
//         /* Move the ball back a little bit so it's not still "stuck" in the wall. */
//         y = height - r;                        
//     }
    
//     draw();
// }

// function draw()
// {
//     ctx.clearRect(0, 0, width, height);
//     ctx.beginPath();
//     ctx.arc(x, y, r, 0, Math.PI * 2, true);
//     ctx.fill();
//     ctx.closePath();
// }
   
// /* A real project should use requestAnimationFrame, and you should time the frame rate and pass a variable "dt" to your physics function. This is just a simple brute force method of getting it done. */
// setInterval(loop, dt * 1000);s


var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    height = 400,
    width = 400,
    stiffness = 0.5,
    b = -1,
    angularB = -7,
    dt = 0.02;

/* A more generic vector class could take an arbitrary number of elements, rather than just x, y, or z. This vector class is strictly 2D */
var V = function(x, y) {
    this.x = x;
    this.y = y;
};

V.prototype.add = function(v) {
    return new V(v.x + this.x, v.y + this.y);
};

V.prototype.subtract = function(v) {
    return new V(this.x - v.x, this.y - v.y);
};

V.prototype.scale = function(s) {
    return new V(this.x * s, this.y * s);
};

V.prototype.dot = function(v) {
    return (this.x * v.x + this.y * v.y);
};

/* Normally the vector cross product function returns a vector. But since we know that all our vectors will only be 2D (x and y only), any cross product we calculate will only have a z-component. Since we don't have a 3D vector class, let's just return the z-component as a scalar. We know that the x and y components will be zero. This is absolutely not the case for 3D. */
V.prototype.cross = function(v) {
    return (this.x * v.y - this.y * v.x);
};

V.prototype.rotate = function(angle, vector) {
    var x = this.x - vector.x;
    var y = this.y - vector.y;

    var x_prime = vector.x + ((x * Math.cos(angle)) - (y * Math.sin(angle)));
    var y_prime = vector.y + ((x * Math.sin(angle)) + (y * Math.cos(angle)));

    return new V(x_prime, y_prime);
};

/* Our simple rectangle class is defined by the coordinates of the top-left corner, the width, height, and mass. */
var Rect = function(x, y, w, h, m) {
    if (typeof(m) === 'undefined') {
        this.m = 1;
    }

    this.width = w;
    this.height = h;

    this.topLeft = new V(x, y);
    this.topRight = new V(x + w, y);
    this.bottomRight = new V(x + w, y + h);
    this.bottomLeft = new V(x, y + h);

    this.v = new V(0, 0);
    this.a = new V(0, 0);
    this.theta = 0;
    this.omega = 0;
    this.alpha = 0;
    this.J = this.m * (this.height*this.height + this.width*this.width) / 12000;
};

/* The Rect class only defines the four corners of the rectangle, but sometimes we need the center point so we can calulate that by finding the diagonal and cutting it in half. */
Rect.prototype.center = function() {
    var diagonal = this.bottomRight.subtract(this.topLeft);
    var midpoint = this.topLeft.add(diagonal.scale(0.5));
    return midpoint;
};

/* To rotate a rectangle we'll update both its angle and rotate all four of the corners */
Rect.prototype.rotate = function(angle) {
    this.theta += angle;
    var center = this.center();

    this.topLeft = this.topLeft.rotate(angle, center);
    this.topRight = this.topRight.rotate(angle, center);
    this.bottomRight = this.bottomRight.rotate(angle, center);
    this.bottomLeft = this.bottomLeft.rotate(angle, center);

    return this;
};

/* Simply translate all four corners */
Rect.prototype.move = function(v) {
    this.topLeft = this.topLeft.add(v);
    this.topRight = this.topRight.add(v);
    this.bottomRight = this.bottomRight.add(v);
    this.bottomLeft = this.bottomLeft.add(v);

    return this;
}

var rect = new Rect(200, 0, 100, 50);
rect.v = new V(0, 2);
var spring = new V(200, 0);

ctx.strokeStyle = 'black';

var loop = function() {
    var f = new V(0, 0);
    var torque = 0;

    /* Start Velocity Verlet by performing the translation */
    var dr = rect.v.scale(dt).add(rect.a.scale(0.5 * dt * dt));
    rect.move(dr.scale(100));

    /* Add Gravity */
    f = f.add(new V(0, rect.m * 9.81));

    /* Add damping */
    f = f.add( rect.v.scale(b) );
    
    /* Add Spring; we calculate this separately so we can calculate a torque. */
    var springForce = rect.topLeft.subtract(spring).scale(-1 * stiffness);
    /* This vector is the distance from the end of the spring to the box's center point */
    var r = rect.center().subtract(rect.topLeft);
    /* The cross product informs us of the box's tendency to rotate. */
    var rxf = r.cross(springForce);

    torque += -1 * rxf;
    f = f.add(springForce);

    /* Finish Velocity Verlet */
    var new_a = f.scale(rect.m);
    var dv = rect.a.add(new_a).scale(0.5 * dt);
    rect.v = rect.v.add(dv);
    
    /* Do rotation; let's just use Euler for contrast */
    torque += rect.omega * angularB; // Angular damping
    rect.alpha = torque / rect.J;
    rect.omega += rect.alpha * dt;
    var deltaTheta = rect.omega * dt;
    rect.rotate(deltaTheta);

    draw();
};

var draw = function() {
    ctx.strokeStyle = 'black';
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(rect.topLeft.x, rect.topLeft.y);
    ctx.rotate(rect.theta);
    ctx.strokeRect(0, 0, rect.width, rect.height);
    ctx.restore();
    
    ctx.strokeStyle = '#cccccc';
    ctx.beginPath();
    ctx.moveTo(spring.x,spring.y);
    ctx.lineTo(rect.topLeft.x, rect.topLeft.y);
    ctx.stroke();
    ctx.closePath();
};

setInterval(loop, dt*1000);












