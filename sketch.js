// biscuit*
// inspired by the works of I am Robot and Proud

// L
let ball, balls, obs, bder, hw, hh;
let obsbox = [];
const density = 4; // <- 発音体の密度 (推奨: 2 - 9)

let ballin = [];
let n = 0;

let ding = [];
let synth = new p5.MonoSynth();
const notes = ["C", "D", "E", "G", "A"]; // <- 出てほしい音の設定
const octs = ["2", "3", "4"];

// R
let adj, ballz, delay, delayz;
let grbing = false;
let moving = false;
const adjs = 32; // <- アジャスターのでかさ
const mkm = 4; // <- グリッドの密度

const velo = 4.2; // <- wasdでいじる場合のボールの速度

// Screen shake variables
let shakeIntensity = 0;
let shakeDuration = 0;
let shakeOffsetX = 0;
let shakeOffsetY = 0;
const shakeDecay = 0.9; // How quickly shake fades
const maxShakeIntensity = 8; // Maximum shake amount
let screenShakeEnabled = false; // Toggle for screen shake feature

// Waveform visualization variables
let waveform = [];
let analyzer;
let waveformEnabled = true; // Toggle for waveform visualization
const waveformLength = 256; // Number of samples to display

// Rhythm mode variables
let rhythmModeEnabled = false; // Toggle for rhythm mode
let rhythmTimer = 0;
let rhythmInterval = 60; // Frames between ball generation (adjust for different tempos)
let rhythmPattern = [1, 0, 1, 0, 1, 0, 1, 0]; // Pattern of beats (1 = ball, 0 = rest)
let rhythmStep = 0;
let rhythmBPM = 180; // Beats per minute
let rhythmBalls = []; // Track balls created in rhythm mode

// Musical structure variables
let currentScale = ["C", "D", "E", "G", "A"]; // Pentatonic scale (current)
let currentChord = 0;
let chordProgression = [0, 2, 1, 3]; // Chord progression pattern
let noteIndex = 0;
let useChordMode = true; // Use chord-based notes instead of random

// CHAOS MODE VARIABLES - ABSOLUTE MADNESS! 🤪
let chaosModeEnabled = false;
let chaosTimer = 0;
let chaosEffects = [];
let screenWarp = 0;
let colorShift = 0;
let gravityChaos = 1;
let timeWarp = 1;
let particleExplosions = [];
let glitchIntensity = 0;
let rainbowMode = false;
let earthquakeMode = false;
let dimensionShift = 0;

// Screen shake function
function triggerShake(intensity = 3) {
	if (!screenShakeEnabled) return; // Skip if disabled
	shakeIntensity = Math.min(intensity, maxShakeIntensity);
	shakeDuration = 10; // Frames of shake
}

// CHAOS MODE FUNCTIONS - PURE INSANITY! 🤪
function triggerChaosEvent() {
	let events = [
		'screenWarp',
		'colorShift', 
		'gravityChaos',
		'timeWarp',
		'particleExplosion',
		'glitch',
		'rainbow',
		'earthquake',
		'dimensionShift'
	];
	
	let randomEvent = random(events);
	chaosEffects.push({
		type: randomEvent,
		intensity: random(0.5, 2),
		duration: random(30, 120),
		timer: 0
	});
}

function createParticleExplosion(x, y, color) {
	for (let i = 0; i < 20; i++) {
		particleExplosions.push({
			x: x,
			y: y,
			vx: random(-8, 8),
			vy: random(-8, 8),
			life: 60,
			color: color || color(random(255), random(255), random(255))
		});
	}
}

function updateChaosEffects() {
	// Update existing effects
	for (let i = chaosEffects.length - 1; i >= 0; i--) {
		let effect = chaosEffects[i];
		effect.timer++;
		
		if (effect.timer >= effect.duration) {
			chaosEffects.splice(i, 1);
		} else {
			// Apply effect
			switch(effect.type) {
				case 'screenWarp':
					screenWarp = sin(frameCount * 0.1) * effect.intensity * 20;
					break;
				case 'colorShift':
					colorShift = (colorShift + effect.intensity) % 255;
					break;
				case 'gravityChaos':
					gravityChaos = 1 + sin(frameCount * 0.05) * effect.intensity;
					break;
				case 'timeWarp':
					timeWarp = 0.5 + sin(frameCount * 0.02) * effect.intensity;
					break;
				case 'glitch':
					glitchIntensity = effect.intensity;
					break;
				case 'rainbow':
					rainbowMode = true;
					break;
				case 'earthquake':
					earthquakeMode = true;
					break;
				case 'dimensionShift':
					dimensionShift = sin(frameCount * 0.03) * effect.intensity * 50;
					break;
			}
		}
	}
	
	// Update particles
	for (let i = particleExplosions.length - 1; i >= 0; i--) {
		let particle = particleExplosions[i];
		particle.x += particle.vx;
		particle.y += particle.vy;
		particle.vy += 0.2; // gravity
		particle.life--;
		
		if (particle.life <= 0) {
			particleExplosions.splice(i, 1);
		}
	}
}

function setup() {
	// L & R
	createCanvas(1000, 500);
	hw = width / 2;
	hh = height / 2;
	
	world.gravity.y = 10;
	noStroke();

	// L
	balls = new Group();
	let c = 0;
	
	for (y = 0; y < density; y++) { // <- 発音体の生成
		for (x = 0; x < density; x++) {
			obs = new Sprite(hw / 2 + map(x, 0, density - 1, -25 * density, 25 * density), hh + map(y, 0, density - 1, -25 * density, 25 * density), 4, 16);
			obs.collider = "static";
			obs.rotation = 45;
			obsbox[c] = obs;
			
			ding[c] = [255, 255, 255];
			obs.color = color(ding[c]);
			c += 1;
		}
	}
	
	bder = new Sprite(hw, hh, 0, height);　// <- 左右の仕切り
	bder.collider = "static";
	
	/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
	
	// R
	adj = new Sprite(hw + (hw / 2), hh, adjs); // <- 円形アイコン（アジャスター）の設定
	adj.collider = "static";
	adj.color = "rgba(255, 255, 255, 0)";
	adj.strokeWeight = 2;
	adj.stroke = 255;
	
	delay = new p5.Delay();
	
	// Set up audio analyzer for waveform visualization
	analyzer = new p5.FFT();
	analyzer.setInput(synth);
}

function draw() {
	// Update screen shake
	if (shakeDuration > 0) {
		shakeOffsetX = random(-shakeIntensity, shakeIntensity);
		shakeOffsetY = random(-shakeIntensity, shakeIntensity);
		shakeDuration--;
		shakeIntensity *= shakeDecay;
	} else {
		shakeOffsetX = 0;
		shakeOffsetY = 0;
		shakeIntensity = 0;
	}
	
	// L
	fill("#F6DFAC");
	rect(0, 0, hw, height);
	
	if (mouseX < hw) { cursor("crosshair"); }
	
	for (let i in obsbox) { // <- 各発音体とボールの接触時の処理
		if (balls.collides(obsbox[i])) {
			
			ding[i] = [158, 222, 165];
			
			// Use structured musical notes instead of random
			let noteToPlay;
			if (useChordMode) {
				// Use chord-based progression
				let chordRoot = currentScale[chordProgression[currentChord]];
				let chordNotes = [chordRoot, currentScale[(chordProgression[currentChord] + 2) % currentScale.length], currentScale[(chordProgression[currentChord] + 4) % currentScale.length]];
				noteToPlay = chordNotes[noteIndex % chordNotes.length] + random(octs);
				noteIndex++;
			} else {
				// Use scale-based notes in sequence
				noteToPlay = currentScale[noteIndex % currentScale.length] + random(octs);
				noteIndex++;
			}
			
			synth.play(noteToPlay, 0.2, 0, 0.1); // <- 🔊
			
			// Trigger screen shake on collision
			triggerShake(2);
			
			// CHAOS MODE: Particle explosion on collision! 🤪
			if (chaosModeEnabled) {
				createParticleExplosion(obsbox[i].position.x, obsbox[i].position.y, color(255, 100, 100));
			}
			
			// Remove rhythm mode balls on collision
			if (rhythmModeEnabled) {
				for (let j = rhythmBalls.length - 1; j >= 0; j--) {
					if (rhythmBalls[j].collides(obsbox[i])) {
						rhythmBalls[j].remove();
						rhythmBalls.splice(j, 1);
						break; // Only remove one ball per collision
					}
				}
			}
			
		}
		
		obsbox[i].color = color(ding[i]); // <- 発音体の変色
		
		for (ii = 0; ii < 3; ii++) {
			if (ding[i][ii] < 255) { ding[i][ii] += 1; }
		}
		
	}
	
	// Rhythm mode - automatic ball generation
	if (rhythmModeEnabled) {
		rhythmTimer++;
		
		// Control BPM with adjuster x position when in rhythm mode
		rhythmBPM = map(adj.position.x, hw + adjs / 2, width - adjs / 2, 60, 240);
		
		// Calculate interval based on BPM (60 FPS / (BPM / 60) / 4 for quarter notes)
		rhythmInterval = Math.floor(60 / (rhythmBPM / 60) / 4);
		
		if (rhythmTimer >= rhythmInterval) {
			rhythmTimer = 0;
			
			// Check if current step should generate a ball
			if (rhythmPattern[rhythmStep] === 1) {
				// Generate ball at obsbox positions for better targeting
				let targetIndex = floor(random(obsbox.length)); // Pick a random obsbox
				let ballX = obsbox[targetIndex].position.x; // Use obsbox x position
				let ballY = 50; // Fixed spawn height for consistent timing
				
				ball = new Sprite(ballX, ballY, 16);
				ball.color = 255;
				balls.add(ball);
				
				// Track this ball as a rhythm mode ball
				rhythmBalls.push(ball);
				
				ballin[n] = ball;
				n += 1;
				
				delay.process(synth, delayz, 0.64);
			}
			
			// Move to next step in pattern
			rhythmStep = (rhythmStep + 1) % rhythmPattern.length;
			
			// Change chord every 8 beats (2 complete patterns)
			if (rhythmStep === 0) {
				currentChord = (currentChord + 1) % chordProgression.length;
			}
		}
	}
	
	// CHAOS MODE UPDATE - ABSOLUTE MADNESS! 🤪
	if (chaosModeEnabled) {
		chaosTimer++;
		
		// Random chaos events
		if (random(1) < 0.01) { // 1% chance per frame
			triggerChaosEvent();
		}
		
		updateChaosEffects();
		
		// Apply chaos effects to world
		world.gravity.y = 10 * gravityChaos;
		
		// Apply time warp to balls
		for (let ball of balls) {
			ball.vel.x *= timeWarp;
			ball.vel.y *= timeWarp;
		}
	}
	
	// for (let i in ballin) { ballin[i].diameter -= 0.04; } // <- スタック阻止
	
	/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
	
	// R
	fill("#9EDEA5");
	rect(hw, 0, hw, height);
	
	stroke(255);
	strokeWeight(0.1);
	for (y = 0; y < mkm; y++) { // <- グリッドの描画
		for (x = 0; x < mkm; x++) {
			line(hw, height / mkm * y, width, height / mkm * y);
			line(hw + hw / mkm * x, 0, hw + hw / mkm * x, height);
		}
	}
	noStroke();
	
	if (mouseX > hw && !grbing) { cursor("grab"); }
	
	if (grbing) { // <- アジャスターを掴んでいるときの処理
		
		cursor("grabbing");
		adj.position.x = mouse.x;
		adj.position.y = mouse.y;
		
	} else { // <- wasdで弄れるようにするやつ (there has to be a better way to code this part)
		
		let ppos = [adj.position.x, adj.position.y];
		
		if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { adj.position.x += velo; }
		if (keyIsDown(LEFT_ARROW)  || keyIsDown(65)) { adj.position.x -= velo; }
		if (keyIsDown(DOWN_ARROW)  || keyIsDown(83)) { adj.position.y += velo; }
		if (keyIsDown(UP_ARROW)    || keyIsDown(87)) { adj.position.y -= velo; }

		if (ppos[0] <= hw + adjs / 2) { adj.position.x = width - adjs / 2 - velo; } // <- Mario Bros. (1983)
		if (ppos[0] >= width - adjs / 2) { adj.position.x = hw + adjs / 2 + velo; }
		if (ppos[1] <= 0 + adjs / 2) { adj.position.y = height - adjs / 2 - velo; }
		if (ppos[1] >= height - adjs / 2) { adj.position.y = 0 + adjs / 2 + velo; }
		
		if (adj.position.x != ppos[0] || adj.position.y != ppos[1]) { moving = true; } else { moving = false; }
		
	}
	
	if (moving) { // <- アジャスターが動いているとき
		
		fill(255);
		textAlign(LEFT);
		text("size: " + round(ballz, 1) + "\n" + "delay: " + round(delayz, 2), adj.position.x + adjs / 1.5, adj.position.y - adjs / 1.5);
		
		adj.color = "rgb(255, 255, 255)";
		
	} else { adj.color = "rgba(255, 255, 255, 0)"; }
	
	ballz = map(adj.position.x, hw + adjs / 2, width - adjs / 2, 12, 42); // <- 横軸と
	delayz = map(adj.position.y, 0 + adjs / 2, height - adjs / 2, 0, 0.9); // <- 縦軸の数値の設定
	
	// Apply screen shake by moving all sprites
	if (screenShakeEnabled && (shakeOffsetX !== 0 || shakeOffsetY !== 0)) {
		// Move all balls
		for (let ball of balls) {
			ball.position.x += shakeOffsetX;
			ball.position.y += shakeOffsetY;
		}
		
		// Move all static objects
		for (let obs of obsbox) {
			obs.position.x += shakeOffsetX;
			obs.position.y += shakeOffsetY;
		}
		
		// Move the divider
		bder.position.x += shakeOffsetX;
		bder.position.y += shakeOffsetY;
		
		// Move the adjuster
		adj.position.x += shakeOffsetX;
		adj.position.y += shakeOffsetY;
	}
	
	// Draw waveform visualization
	if (waveformEnabled) {
		// Analyze the audio
		waveform = analyzer.waveform(waveformLength, 'float');
		
		// Draw vertical waveform in the center
		push();
		stroke(255, 100, 100, 150);
		strokeWeight(3);
		noFill();
		
		// Position vertical waveform exactly where the divider (bder) is
		let dividerX = hw; // This is where bder is positioned
		let waveformWidth = 150; // Wider waveform for more dramatic effect
		
		// Check if there's significant audio activity
		let audioLevel = 0;
		for (let i = 0; i < waveform.length; i++) {
			audioLevel += Math.abs(waveform[i]);
		}
		audioLevel = audioLevel / waveform.length;
		
		// Only draw waveform if there's significant audio activity
		if (audioLevel > 0.01) {
			// Draw multiple waveform layers for dramatic effect
			for (let layer = 0; layer < 3; layer++) {
				let opacity = map(layer, 0, 2, 200, 50);
				let widthOffset = layer * 10;
				
				stroke(255, 255, 255, opacity);
				strokeWeight(2 - layer * 0.5);
				
				beginShape();
				for (let i = 0; i < waveform.length; i++) {
					// Amplify the waveform for more dramatic effect
					let amplifiedWave = waveform[i] * 2.5;
					let x = map(amplifiedWave, -2.5, 2.5, dividerX - waveformWidth/2, dividerX + waveformWidth/2);
					let y = map(i, 0, waveform.length, 0, height);
					vertex(x, y);
				}
				endShape();
			}
		}
		
		pop();
	}
	
	// CHAOS MODE VISUAL EFFECTS - PURE INSANITY! 🤪
	if (chaosModeEnabled) {
		// Draw particle explosions
		for (let particle of particleExplosions) {
			push();
			fill(particle.color);
			noStroke();
			ellipse(particle.x, particle.y, map(particle.life, 0, 60, 0, 8));
			pop();
		}
		
		// Apply screen warping
		if (screenWarp !== 0) {
			push();
			translate(screenWarp, 0);
		}
		
		// Apply color shifting
		if (colorShift !== 0) {
			tint(colorShift, 255 - colorShift, 255);
		}
		
		// Apply glitch effect
		if (glitchIntensity > 0) {
			if (random(1) < glitchIntensity * 0.1) {
				translate(random(-glitchIntensity * 10, glitchIntensity * 10), 0);
			}
		}
		
		// Apply earthquake mode
		if (earthquakeMode) {
			translate(random(-5, 5), random(-5, 5));
		}
		
		// Apply dimension shift
		if (dimensionShift !== 0) {
			translate(dimensionShift, 0);
		}
		
		// Rainbow mode for balls
		if (rainbowMode) {
			for (let ball of balls) {
				ball.color = color(frameCount % 255, (frameCount + 85) % 255, (frameCount + 170) % 255);
			}
		}
		
		// Reset effects
		if (screenWarp !== 0 || colorShift !== 0 || glitchIntensity > 0 || earthquakeMode || dimensionShift !== 0) {
			pop();
		}
	}
	
	// Rhythm mode display
	fill(255);
	noStroke();
	textAlign(LEFT);
	textSize(12);
	text("Rhythm Mode: " + (rhythmModeEnabled ? "ON" : "OFF"), hw + 10, 20);
	text("BPM: " + round(rhythmBPM) + (rhythmModeEnabled ? " (Live)" : ""), hw + 10, 35);
	text("Press 'R' to toggle", hw + 10, 50);
	text("Chord Mode: " + (useChordMode ? "ON" : "OFF"), hw + 10, 65);
	text("Chord: " + currentScale[chordProgression[currentChord]], hw + 10, 80);
	text("Press 'M' for scales", hw + 10, 95);
	text("CHAOS MODE: " + (chaosModeEnabled ? "ON" : "OFF"), hw + 10, 110);
	text("Press 'X' for CHAOS!", hw + 10, 125);
}

function mouseClicked() {
	if (mouseX < hw - ballz / 2) {
		ball = new Sprite(mouseX, mouseY, ballz); // <- ボールの生成
		ball.color = 255;
		balls.add(ball);
		
		ballin[n] = ball;
		n += 1;
		
		delay.process(synth, delayz, 0.64); // <- ディレイのリセット
	}
}

function mouseDragged() {
	if (mouseX > hw + adjs / 2 && mouseX < width - adjs / 2 &&
		  mouseY > 0 + adjs / 2 && mouseY < height - adjs / 2) // <- アジャスターが掴まれているかの確認
		
	{ grbing = true; moving = true; } else { grbing = false; moving = false; }
	
}

function mouseReleased() {
	grbing = false;
}

function mousePressed() {
	if (getAudioContext().state !== 'running') {
		getAudioContext().resume();
		// テスト用：短い音を鳴らす（不要なら消してOK）
		// synth.play('C4', 0.1, 0, 0.1);
	}
}

function touchStarted() {
	if (getAudioContext().state !== 'running') {
		getAudioContext().resume();
	}
}

// Rhythm mode controls
function keyPressed() {
	if (key === 'R' || key === 'r') {
		rhythmModeEnabled = !rhythmModeEnabled;
		console.log("Rhythm Mode:", rhythmModeEnabled ? "ON" : "OFF");
	}
	if (key === 'C' || key === 'c') {
		useChordMode = !useChordMode;
		console.log("Chord Mode:", useChordMode ? "ON" : "OFF");
	}
	if (key === 'M' || key === 'm') {
		// Cycle through different scales
		let scales = [
			["C", "D", "E", "G", "A"], // Pentatonic
			["C", "D", "E", "F", "G", "A", "B"], // Major
			["C", "D", "Eb", "F", "G", "Ab", "Bb"], // Minor
			["C", "D", "E", "F#", "G", "A", "B"] // Lydian
		];
		let currentIndex = scales.findIndex(scale => JSON.stringify(scale) === JSON.stringify(currentScale));
		currentScale = scales[(currentIndex + 1) % scales.length];
		console.log("Scale changed to:", currentScale);
	}
	if (key === 'X' || key === 'x') {
		chaosModeEnabled = !chaosModeEnabled;
		console.log("CHAOS MODE:", chaosModeEnabled ? "ACTIVATED! 🤪" : "DEACTIVATED");
	}
}
