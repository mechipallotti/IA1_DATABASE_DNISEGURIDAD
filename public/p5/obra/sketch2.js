let pantalla02;
let audioDesbloqueado = false;

class Pantalla {
  draw() {}
  keyPressed() {}
}

class Pantalla02 extends Pantalla {
  constructor() {
    super();
    this.cebolla = [];
    this.sides0 = 3; this.sideInc = 1;
    this.radio0 = 10; this.radioInc = 40;
    this.tiempo0 = 32;
    this.cantidad = 20;
    this.midiNotes = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81];

    this.masterGain = new p5.Gain();
    this.masterGain.amp(0.52);
    this.started = false;

    this.grilla();
  }

  grilla() {
    for (let i = 0; i < this.cantidad; i++) {
      let sides = this.sides0 + i * this.sideInc;
      let radio = this.radio0 + i * this.radioInc;
      let tiempo = this.tiempo0 * (i + i);
      let note = this.midiNotes[i % this.midiNotes.length];
      this.cebolla.push(new Poligonos(sides, radio, tiempo, note, this.masterGain));
    }
  }

  draw() {
    background(250);
    for (let i = this.cantidad - 1; i >= 0; i--) {
      this.cebolla[i].update();
      this.cebolla[i].display();
    }

    fill(220);
    textAlign(CENTER);
    textSize(16);
    text("CEBOLLITA MUSICAL", width / 2, height - 30);
    text("<- 4", 20, 0);
  }

  keyPressed() {
    if (key === '1') nav.seleccionarPantalla(1);
    else if (key === '2') nav.seleccionarPantalla(2);
    else if (key === '3') nav.seleccionarPantalla(3);
    else if (key === '4') nav.seleccionarPantalla(0);
    else if (keyCode === RIGHT_ARROW) nav.siguientePantalla();
    else if (keyCode === LEFT_ARROW) nav.previaPantalla();
  }

  activarAudio() {
    userStartAudio();
    this.cebolla.forEach(p => {
      if (!p.started) {
        p.osc.start();
        p.started = true;
      }
    });
    this.masterGain.connect();
    this.masterGain.amp(0.5, 0.2);
  }
}

class Poligonos {
  constructor(sides, radio, tiempo, note, masterGain) {
    this.sides = sides;
    this.radio = radio;
    this.angle = 0;
    this.tiempo = tiempo;
    this.note = note;
    this.interaccion0 = false;

    this.osc = new p5.Oscillator('sine');
    this.osc.freq(midiToFreq(this.note));
    this.osc.amp(0);
    this.osc.disconnect();
    this.osc.connect(masterGain);
  }

  update() {
    this.angle += (TWO_PI / this.tiempo) / 60;

    if (this.interaccion()) {
      this.interaccion0 = true;
      let distC = dist(mouseX, mouseY, width / 2, height / 2);
      let maxDist = width / 2;
      let ampVal = 0.22 * (distC / maxDist);
      this.osc.amp(ampVal, 0.12);

      let panVal = map(mouseX, 0, width, -1, 1);
      this.osc.pan(panVal);
    } else {
      this.interaccion0 = false;
      this.osc.amp(0, 0.12);
    }
  }

  display() {
    noStroke();
    fill(this.interaccion0 ? color(0, 85, 170, 90) : color(255, 80));

    push();
    translate(width / 2, height / 2);
    rotate(this.angle);

    beginShape();
    for (let i = 0; i < this.sides; i++) {
      let a = TWO_PI / this.sides * i;
      let x = this.radio * cos(a);
      let y = this.radio * sin(a);
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }

  interaccion() {
    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;

    let cosA = cos(-this.angle);
    let sinA = sin(-this.angle);
    let localX = mx * cosA - my * sinA;
    let localY = mx * sinA + my * cosA;

    let vertices = [];
    for (let i = 0; i < this.sides; i++) {
      let a = TWO_PI / this.sides * i;
      let x = this.radio * cos(a);
      let y = this.radio * sin(a);
      vertices.push(createVector(x, y));
    }

    let inside = false;
    for (let i = 0, j = this.sides - 1; i < this.sides; j = i++) {
      let xi = vertices[i].x, yi = vertices[i].y;
      let xj = vertices[j].x, yj = vertices[j].y;
      let intersect = ((yi > localY) != (yj > localY)) &&
                      (localX < (xj - xi) * (localY - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  stop() {
    this.osc.amp(0, 0.1);
  }
}

// --- Setup y draw ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  pantalla02 = new Pantalla02();
}

function draw() {
  pantalla02.draw();
}

// --- KeyPressed global ---
function keyPressed() {
  // Cualquier tecla desbloquea audio si no estaba activado
  if (!audioDesbloqueado) {
    pantalla02.activarAudio();
    audioDesbloqueado = true;
  }
  pantalla02.keyPressed();
}

// --- MousePressed global (opcional para desbloquear audio con clic) ---
function mousePressed() {
  if (!audioDesbloqueado) {
    pantalla02.activarAudio();
    audioDesbloqueado = true;
  }
}