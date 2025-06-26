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
}

function draw() {
	// L
	fill("#F6DFAC");
	rect(0, 0, hw, height);
	
	if (mouseX < hw) { cursor("crosshair"); }
	
	for (let i in obsbox) { // <- 各発音体とボールの接触時の処理
		if (balls.collides(obsbox[i])) {
			
			ding[i] = [158, 222, 165];
			synth.play(random(notes) + random(octs), 0.2, 0, 0.1); // <- 🔊
			
		}
		
		obsbox[i].color = color(ding[i]); // <- 発音体の変色
		
		for (ii = 0; ii < 3; ii++) {
			if (ding[i][ii] < 255) { ding[i][ii] += 1; }
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