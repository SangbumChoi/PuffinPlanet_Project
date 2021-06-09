const weather = require('./weather');
const puffdata = require('./dataapi');

const particleTypes = {
	blank : 'blank',
	co2 : 'co2',
	chem : 'chem',
	dust : 'dust'
}

let appMgr = {
	pageIndex : 0,
	pages : [],
	drag : [],
	dragIndex : 0,
	prevMouseState: false,
	isNewScreen3 : true,

	addPage(page){
		this.pages.push(page);
	},

	addIndex(value){
		this.pageIndex += value;
		if(this.pageIndex >= this.pages.length) this.pageIndex = 0;
		if(this.pageIndex < 0) this.pageIndex = this.pages.length - 1;

		this.pages[this.pageIndex].start();
	},

	initialize(){
		this.addPage(particleMgr);
		this.addPage(conditionMgr);
		this.addPage(outsideMgr);
		this.pages.forEach(page => {
			page.start();
		});
	},

	update(){
		this.gesture();
		if(this.pageIndex != 2) { this.pages[this.pageIndex].update(); }
	},

	draw(){
		if(this.pageIndex == 2){
			this.isNewScreen3 ? this.pages[this.pageIndex].draw() : null ;
			this.isNewScreen3 = false;
		} else{
			this.pages[this.pageIndex].draw();
			this.isNewScreen3 = true;
		}
	},

	gesture(){
		if(!mouseIsPressed && this.prevMouseState){
			let swipeX = 0;
			let swipeY = 0;
			this.drag.forEach(element => {
				swipeX += element[0];
				swipeY += element[1];
			});

			if(swipeX > 20){
				this.addIndex(-1);
			}else if(swipeX < -20){
				this.addIndex(1);
			}

			if(swipeX * swipeX < 9 && swipeY * swipeY < 9) {
				this.click();
			}

			this.drag = [];
		}

		if(mouseIsPressed) {
			this.prevMouseState = true;
			this.drag[this.dragIndex] = ([mouseX - pmouseX, mouseY - pmouseY]);
			this.dragIndex += 1;
			if(this.dragIndex > 30){
				this.dragIndex = 0;
			}
		} else {
			this.prevMouseState = false;
		}

		
	},

	click(){
		this.pages[this.pageIndex].click();
	}
}

var dataMgr = {
	threshold:{
		co2: 5,
		chem: 5,
		dust: 5
	},
	density: {
		co2: 6,
		chem: 8,
		dust: 3
	},
	condition: {
		temperature: 22,
		humidity: 30
	},
	realValue:{
		co2: 600,
		chem: 800,
		dust: 15
	},
	ventil: 24
}

let particleMgr = {
	maxNum: 10,
	minDist: 10,
	particles: [],
	detail: false,
	animTimer: 0,
	selected: particleTypes.blank,
	size: 0,
	padding: 0,
	width: 0,

	start(){
		this.width = windowWidth;

		this.detail = false;
		this.animTimer = 0;
		this.padding = Math.sqrt(windowHeight * this.width)/49;
		this.size = Math.sqrt((windowHeight - 2 * this.padding) * (this.width - 2 * this.padding))/7;

		this.particles = [];
		let initialPos = [];
		let deltaWidth = (windowWidth - 2 * this.padding - this.size) / Math.floor((windowWidth - 2 * this.padding - this.size) / this.size);
		let deltaHeight = (windowHeight - 2 * this.padding - this.size) / Math.floor((windowHeight - 2 * this.padding - this.size) / this.size);
		for(let i = this.padding + this.size/2; i <= windowWidth - this.padding - this.size/2; i += deltaWidth){
			for(let j = this.padding + this.size/2; j <= windowHeight - this.padding - this.size/2; j += deltaHeight){
				initialPos.push({x: i + random(-25, 25), y: j + random(-25, 25)})
			}
		}
		initialPos.sort((a, b) => 0.5 - Math.random());
		// velocity factor for framerate
		velocity_factor = 4
		for(let i = 0; i < dataMgr.density.co2; i++){
			let imsi = this.createParticle(particleTypes.co2);
			imsi.position = initialPos.pop();
			imsi.velocity = {x: this.size / 200 * random(-1, 1) * velocity_factor, y: this.size / 200 * random(-1, 1) * velocity_factor};
			imsi.rotation = random(0, 2);
			imsi.rotationVelocity = random(-0.01, 0.01);
			this.particles.push(imsi);
		}

		for(let i = 0; i < dataMgr.density.chem; i++){
			let imsi = this.createParticle(particleTypes.chem);
			imsi.position = initialPos.pop();
			imsi.velocity = {x: this.size / 200 * random(-1, 1) * velocity_factor, y: this.size / 200 * random(-1, 1) * velocity_factor};
			imsi.rotation = random(0, 2);
			imsi.rotationVelocity = random(-0.01, 0.01);
			this.particles.push(imsi);
		}

		for(let i = 0; i < dataMgr.density.dust; i++){
			let imsi = this.createParticle(particleTypes.dust);
			imsi.position = initialPos.pop();
			imsi.velocity = {x: this.size / 200 * random(-1, 1) * velocity_factor, y: this.size / 200 * random(-1, 1) * velocity_factor};
			imsi.rotation = random(0, 2);
			imsi.rotationVelocity = random(-0.01, 0.01);
			this.particles.push(imsi);
		}
	},

	draw(){
		this.particles.forEach(particle => {
			particle.draw();
		});

		let animMult = 0;
		if(this.detail){
			animMult = standardAnim.incDispList[this.animTimer];
		}else{
			animMult = standardAnim.decDispList[this.animTimer];
		}

		noStroke();

		translate(windowWidth - windowHeight/3 * animMult, 0);

		//co2info
		let co2Opacity = 0;
		if(particleMgr.selected == particleTypes.co2 || particleMgr.selected == particleTypes.blank){
			opacity = 255;
		} else {
			opacity = 48;
		}
		fill(141, 142, 159, opacity);
		rectMode(CORNER);
		square(0, 0, windowHeight/3);
		noStroke();

		fill(255, 255, 255);
		circle(windowHeight/3/2, windowHeight/3 * 0.5, windowHeight/3 * 0.85 * 0.9);
		
		fill(0, 0, 0, opacity);
		textAlign(CENTER, BOTTOM);
		textSize(windowHeight/3 * 0.2);
		textStyle(BOLD);
		text(dataMgr.realValue.co2, windowHeight/3/2, windowHeight/3 * 0.57);
		textAlign(CENTER, TOP);
		textSize(windowHeight/3 * 0.08);
		textStyle(NORMAL);
		text("이산화탄소", windowHeight/3/2, windowHeight/3 * 0.57);

		//cheminfo
		let chemOpacity = 0;
		if(particleMgr.selected == particleTypes.chem || particleMgr.selected == particleTypes.blank){
			chemOpacity = 255;
		} else {
			chemOpacity = 48;
		}
		fill(21, 194, 134, chemOpacity);
		rectMode(CORNER);
		square(0, windowHeight/3, windowHeight/3);
		noStroke();

		rectMode(CENTER);
		fill(255, 255, 255);
		square(windowHeight/3/2, windowHeight/3 * 1.5, windowHeight/3 * 0.75 * 0.9);

		fill(0, 0, 0, chemOpacity);
		textAlign(CENTER, BOTTOM);
		textSize(windowHeight/3 * 0.2);
		textStyle(BOLD);
		text(dataMgr.realValue.chem, windowHeight/3/2, windowHeight/3 * 1.57);
		textAlign(CENTER, TOP);
		textSize(windowHeight/3 * 0.08);
		textStyle(NORMAL);
		text("화학물질", windowHeight/3/2, windowHeight/3 * 1.57);

		//dustinfo
		let dustOpacity = 0;
		if(particleMgr.selected == particleTypes.dust || particleMgr.selected == particleTypes.blank){
			dustOpacity = 255;
		} else {
			dustOpacity = 48;
		}
		fill(255, 181, 50, dustOpacity);
		rectMode(CORNER);
		square(0, 2 * windowHeight/3, windowHeight/3);

		fill(255, 255, 255);
		translate(windowHeight/3/2, windowHeight/3 * 2.5);
		triangle(-(windowHeight / 3 * 0.9) / 2 * Math.cos(Math.PI / 6), (windowHeight / 3 * 0.9) * 0.25 + (windowHeight / 3 * 0.9) * 0.1, (windowHeight / 3 * 0.9) / 2 * Math.cos(Math.PI / 6), (windowHeight / 3 * 0.9) * 0.25 + (windowHeight / 3 * 0.9) * 0.1, 0, -(windowHeight / 3 * 0.9) * 0.5 + (windowHeight / 3 * 0.9) * 0.1);
		translate(-(windowHeight/3/2), -windowHeight/3 * 2.5);
		
		fill(0, 0, 0, dustOpacity);
		textAlign(CENTER, BOTTOM);
		textSize(windowHeight/3 * 0.2);
		textStyle(BOLD);
		text(dataMgr.realValue.dust, windowHeight/3/2, windowHeight/3 * 2.65);
		textAlign(CENTER, TOP);
		textSize(windowHeight/3 * 0.08);
		textStyle(NORMAL);
		text("미세먼지", windowHeight/3/2, windowHeight/3 * 2.65);

		translate(-(windowWidth - windowHeight/3 * animMult), 0);

		this.notice();
	},
	
	update(){
		let prevPadding = this.padding;
		let prevSize = this.size;
		let prevWidth = this.width;

		if(this.detail && this.animTimer < 100) {
			this.animTimer += 1;
			animMult = standardAnim.incDispList[this.animTimer];
			this.width = windowWidth - windowHeight/3 * animMult;
			this.padding = Math.sqrt(windowHeight * this.width)/49;
			this.size = Math.sqrt((windowHeight - 2 * this.padding) * (this.width - 2 * this.padding))/7;

			let curPadding = this.padding;
			let curSize = this.size;
			let curWidth = this.width;

			this.particles.forEach(particle => {
				let prevX = particle.position.x;
				let curX = curPadding + curSize/2 + (prevX - prevPadding - prevSize/2) * (curWidth - 2*curPadding - curSize) / (prevWidth - 2*prevPadding - prevSize);
				particle.position.x = curX;
			});
		}

		if(!this.detail && this.animTimer > 0) {
			this.animTimer -= 1;
			animMult = standardAnim.decDispList[this.animTimer];
			this.width = windowWidth - windowHeight/3 * animMult;
			this.padding = Math.sqrt(windowHeight * this.width)/49;
			this.size = Math.sqrt((windowHeight - 2 * this.padding) * (this.width - 2 * this.padding))/7;

			let curPadding = this.padding;
			let curSize = this.size;
			let curWidth = this.width;

			this.particles.forEach(particle => {
				let prevX = particle.position.x;
				let curX = curPadding + curSize/2 + (prevX - prevPadding - prevSize/2) * (curWidth - 2*curPadding - curSize) / (prevWidth - 2*prevPadding - prevSize);
				particle.position.x = curX;
			});
		}

		this.particles.forEach(particle => {
			this.bounce();
			particle.update();
		});

		this.particleUpdate();
	},

	bounce(){
		for(let i = 0; i < this.particles.length; i += 1){
			for(let j = i+1; j < this.particles.length; j += 1){
				if(Math.abs(this.particles[i].position.x - this.particles[j].position.x) < this.size && Math.abs(this.particles[i].position.y - this.particles[j].position.y) < this.size){
					if((this.particles[i].position.x > this.particles[j].position.x && this.particles[i].velocity.x < this.particles[j].velocity.x)||
						(this.particles[i].position.x < this.particles[j].position.x && this.particles[i].velocity.x > this.particles[j].velocity.x)){
						let imsi = this.particles[i].velocity.x;
						this.particles[i].velocity.x = this.particles[j].velocity.x;
						this.particles[j].velocity.x = imsi;
					}

					if((this.particles[i].position.y > this.particles[j].position.y && this.particles[i].velocity.y < this.particles[j].velocity.y)||
						(this.particles[i].position.y < this.particles[j].position.y && this.particles[i].velocity.y > this.particles[j].velocity.y)){
						let imsi = this.particles[i].velocity.y;
						this.particles[i].velocity.y = this.particles[j].velocity.y;
						this.particles[j].velocity.y = imsi;
					}

					imsi = this.particles[i].rotationVelocity;
					this.particles[i].rotationVelocity = this.particles[j].rotationVelocity;
					this.particles[j].rotationVelocity = imsi;
				}
			}
		}
	},

	createParticle(type){
		return particle = {
			size : 0,
			position : {x: 0, y: 0},
			velocity : {x: 0, y: 0},
			rotation : 0,
			rotationVelocity : 0,
			tag : type,
		
			update(){
				this.position.x += this.velocity.x;
				this.position.y += this.velocity.y;
				this.rotation += this.rotationVelocity;

				if(this.position.x < (particleMgr.size/2 + particleMgr.padding) && this.velocity.x < 0){
					this.velocity.x *= -1;
				}

				let infoBanner = windowHeight / 3;
				if(!particleMgr.detail) infoBanner = 0;
				if(this.position.x > windowWidth - (particleMgr.size/2 + particleMgr.padding) - infoBanner && this.velocity.x > 0){
					this.velocity.x *= -1;
				}

				if(this.position.y < (particleMgr.size/2 + particleMgr.padding) && this.velocity.y < 0){
					this.velocity.y *= -1;
				}

				if(this.position.y > windowHeight - (particleMgr.size/2 + particleMgr.padding) && this.velocity.y > 0){
					this.velocity.y *= -1;
				}
			},
		
			draw(){
				switch(this.tag){
					case particleTypes.co2:
						noStroke();
						if(particleMgr.selected == this.tag || particleMgr.selected == particleTypes.blank){
							fill(141, 142, 159);
						} else {
							fill(141, 142, 159, 48);
						}
						translate(this.position.x, this.position.y);
						circle(0, 0, particleMgr.size * 0.85);
						translate(-this.position.x, -this.position.y);
						break;
					case particleTypes.chem:
						noStroke();
						if(particleMgr.selected == this.tag || particleMgr.selected == particleTypes.blank){
							fill(21, 194, 134);
						} else {
							fill(21, 194, 134, 48);
						}
						rectMode(CENTER);
						translate(this.position.x, this.position.y);
						rotate(-this.rotation);
						square(0, 0, particleMgr.size * 0.75);
						rotate(this.rotation);
						translate(-this.position.x, -this.position.y);
						break;
					case particleTypes.dust:
						noStroke();
						if(particleMgr.selected == this.tag || particleMgr.selected == particleTypes.blank){
							fill(255, 181, 50);
						} else {
							fill(255, 181, 50, 48);
						}
						translate(this.position.x, this.position.y);
						rotate(-this.rotation);
						triangle(-particleMgr.size / 2 * Math.cos(Math.PI / 6), particleMgr.size * 0.25 + particleMgr.size * 0.1, particleMgr.size / 2 * Math.cos(Math.PI / 6), particleMgr.size * 0.25 + particleMgr.size * 0.1, 0, -particleMgr.size * 0.5 + particleMgr.size * 0.1);
						rotate(this.rotation);
						translate(-this.position.x, -this.position.y);
						break;
				}
			}
		}
	},

	click(){
		if(this.detail == false){
			this.detail = true;
			this.animTimer = standardAnim.decToIncDisp(this.animTimer);
		} else {
			if(this.animTimer == 100){
				if(mouseX > windowWidth - windowHeight/3){
					if(mouseY < windowHeight/3){
						if(particleMgr.selected != particleTypes.co2){
							particleMgr.selected = particleTypes.co2;
						} else {
							particleMgr.selected = particleTypes.blank;
						}
					} else if(mouseY < 2 * windowHeight/3){
						if(particleMgr.selected != particleTypes.chem){
							particleMgr.selected = particleTypes.chem;
						} else {
							particleMgr.selected = particleTypes.blank;
						}
					} else if(mouseY < windowHeight){
						if(particleMgr.selected != particleTypes.dust){
							particleMgr.selected = particleTypes.dust;
						} else {
							particleMgr.selected = particleTypes.blank;
						}
					}
				} else {
					this.detail = false;
					this.animTimer = standardAnim.incToDecDisp(this.animTimer);
					
				}
			} else {
				if(mouseX > windowWidth - windowHeight/3 * standardAnim.incDispList[this.animTimer]){
					if(mouseY < windowHeight/3){
						if(particleMgr.selected != particleTypes.co2){
							particleMgr.selected = particleTypes.co2;
						} else {
							particleMgr.selected = particleTypes.blank;
						}
					} else if(mouseY < 2 * windowHeight/3){
						if(particleMgr.selected != particleTypes.chem){
							particleMgr.selected = particleTypes.chem;
						} else {
							particleMgr.selected = particleTypes.blank;
						}
					} else if(mouseY < windowHeight){
						if(particleMgr.selected != particleTypes.dust){
							particleMgr.selected = particleTypes.dust;
						} else {
							particleMgr.selected = particleTypes.blank;
						}
					}
				} else {
					this.detail = false;
					this.animTimer = standardAnim.incToDecDisp(this.animTimer);
				}
			}
		}
	},

	notice(){
		let noticeWidth = particleMgr.width * 0.75 * 0.3;
		let noticeHeight = particleMgr.width * 0.75 * 0.1 * 0.5;
		let height = noticeHeight / 3;

		// if(dataMgr.ventil){
		height += noticeHeight / 2;

		stroke(255, 255, 255);
		strokeWeight(noticeHeight * 0.05);
		
		fill(76, 195, 251);
		rectMode(CENTER);
		rect(particleMgr.width / 2, height, noticeWidth, noticeHeight, noticeHeight / 2);

		noStroke();
		fill(255, 255, 255);
		textAlign(CENTER, CENTER);
		textSize(noticeHeight / 2 * 0.9);
		text(dataMgr.ventil.toString() + "만큼 환기가 진행중입니다", particleMgr.width / 2, height + noticeHeight / 16);
		// }

		noticeWidth = particleMgr.width * 0.75 * 0.25;
		noticeHeight = particleMgr.width * 0.75 * 0.1 * 0.4;

		if(dataMgr.density.co2 > dataMgr.threshold.co2){
			/*if(dataMgr.ventil)*/ height += noticeHeight + noticeHeight / 5 * 2;
			// else height += noticeHeight / 2;

			stroke(255, 255, 255);
			strokeWeight(noticeHeight * 0.05);
			if(particleMgr.selected == particleTypes.co2/* || (!dataMgr.ventil && particleMgr.selected == particleTypes.blank)*/){
				fill(141, 142, 159);
			} else {
				fill(141, 142, 159, 48);
			}
			rectMode(CENTER);
			rect(particleMgr.width / 2, height, noticeWidth, noticeHeight, noticeHeight / 2);

			noStroke();
			fill(255, 255, 255);
			textAlign(CENTER, CENTER);
			textSize(noticeHeight / 2 * 0.9);
			text("숨이 답답하지는 않으세요?", particleMgr.width / 2, height + noticeHeight / 16);
		}

		if(dataMgr.density.chem > dataMgr.threshold.chem){
			height += noticeHeight + noticeHeight / 5;

			stroke(255, 255, 255);
			strokeWeight(noticeHeight * 0.05);
			
			if(particleMgr.selected == particleTypes.chem/* || (!dataMgr.ventil && particleMgr.selected == particleTypes.blank)*/){
				fill(21, 194, 134);
			} else {
				fill(21, 194, 134, 48);
			}
			rectMode(CENTER);
			rect(particleMgr.width / 2, height, noticeWidth, noticeHeight, noticeHeight / 2);

			noStroke();
			fill(255, 255, 255);
			textAlign(CENTER, CENTER);
			textSize(noticeHeight / 2 * 0.9);
			text("머리가 아프지는 않으세요?", particleMgr.width / 2, height + noticeHeight / 16);
		}

		if(dataMgr.density.dust > dataMgr.threshold.dust){
			height += noticeHeight + noticeHeight / 5;
			
			stroke(255, 255, 255);
			strokeWeight(noticeHeight * 0.05);
			
			if(particleMgr.selected == particleTypes.dust/* || (!dataMgr.ventil && particleMgr.selected == particleTypes.blank)*/){
				fill(255, 181, 50);
			} else {
				fill(255, 181, 50, 48);
			}
			rectMode(CENTER);
			rect(particleMgr.width / 2, height, noticeWidth, noticeHeight, noticeHeight / 2);

			noStroke();
			fill(255, 255, 255);
			textAlign(CENTER, CENTER);
			textSize(noticeHeight / 2 * 0.9);
			text("목이 아프지는 않으세요?", particleMgr.width / 2, height + noticeHeight / 16);
		}
	},

	particleUpdate(){
		let curCo2 = this.particles.filter(particle => particle.tag == particleTypes.co2);
		let curChem = this.particles.filter(particle => particle.tag == particleTypes.chem);
		let curDust = this.particles.filter(particle => particle.tag == particleTypes.dust);

		if(curCo2.length > dataMgr.density.co2){
			for(let i = 0; i < curCo2.length - dataMgr.density.co2; i++){
				let imsi = curCo2.pop();
				this.particles = this.particles.filter(item => item != imsi);
			}
		} else if(curCo2.length < dataMgr.density.co2){
			for(let i = 0; i < dataMgr.density.co2 - curCo2.length; i++){
				let imsi = this.createParticle(particleTypes.co2);
				imsi.position = {x: random(this.padding + this.size / 2, this.padding + this.width - this.size / 2), y: random(this.padding + this.size / 2, windowHeight - this.padding - this.size / 2)}
				imsi.velocity = {x: this.size / 200 * random(-1, 1), y: this.size / 200 * random(-1, 1)};
				imsi.rotation = random(0, 2);
				imsi.rotationVelocity = random(-0.01, 0.01);
				this.particles.push(imsi);
			}
		}

		if(curChem.length > dataMgr.density.chem){
			for(let i = 0; i < curChem.length - dataMgr.density.chem; i++){
				let imsi = curChem.pop();
				this.particles = this.particles.filter(item => item != imsi);
			}
		} else if(curChem.length < dataMgr.density.chem){
			for(let i = 0; i < dataMgr.density.chem - curChem.length; i++){
				let imsi = this.createParticle(particleTypes.chem);
				imsi.position = {x: random(this.padding + this.size / 2, this.padding + this.width - this.size / 2), y: random(this.padding + this.size / 2, windowHeight - this.padding - this.size / 2)}
				imsi.velocity = {x: this.size / 200 * random(-1, 1), y: this.size / 200 * random(-1, 1)};
				imsi.rotation = random(0, 2);
				imsi.rotationVelocity = random(-0.01, 0.01);
				this.particles.push(imsi);
			}
		}

		if(curDust.length > dataMgr.density.dust){
			for(let i = 0; i < curDust.length - dataMgr.density.dust; i++){
				let imsi = curDust.pop();
				this.particles = this.particles.filter(item => item != imsi);
			}
		} else if(curDust.length < dataMgr.density.dust){
			for(let i = 0; i < dataMgr.density.dust - curDust.length; i++){
				let imsi = this.createParticle(particleTypes.dust);
				imsi.position = {x: random(this.padding + this.size / 2, this.padding + this.width - this.size / 2), y: random(this.padding + this.size / 2, windowHeight - this.padding - this.size / 2)}
				imsi.velocity = {x: this.size / 200 * random(-1, 1), y: this.size / 200 * random(-1, 1)};
				imsi.rotation = random(0, 2);
				imsi.rotationVelocity = random(-0.01, 0.01);
				this.particles.push(imsi);
			}
		}
	}
}

let conditionMgr = {
	animTimer: 0,
	detail: false,
	animTimer2: 0,

	start(){
		this.detail = false;
		this.animTimer = 0;
		this.animTimer2 = 0;
	},

	draw(){
		if(this.animTimer > 0){
			if(this.animTimer < 100){
				rectMode(CORNER);
				noStroke();
				fill(38, 41, 73);
				rect(0, windowHeight * (1 - dataMgr.condition.humidity / 100 * (1 - Math.pow(1 - (this.animTimer - 0) / 100, 10))), windowWidth, windowHeight);
			} else {
				rectMode(CORNER);
				noStroke();
				fill(38, 41, 73);
				rect(0, windowHeight * (1 - dataMgr.condition.humidity / 100), windowWidth, windowHeight);
			}
		}
		
		let discomfortIndex = (9 * dataMgr.condition.temperature / 5 - 0.55 * (1 - dataMgr.condition.humidity / 100) * (9 * dataMgr.condition.temperature / 5 - 26) + 32);
		let discomfortLevel = 0;
		if(discomfortIndex < 68){
			discomfortLevel = 0;
		} else if(discomfortIndex < 80) {
			discomfortLevel = (discomfortIndex - 68) / (80 - 68)
		} else {
			discomfortLevel = 1;
		}

		if(this.animTimer > 50){
			if(this.animTimer < 150){
				rectMode(CORNER);
				noStroke();
				fill(50, 106, 207);
				rect(windowWidth * (1 - (0.2 + 0.6 * (1 - discomfortLevel)) * (1 - Math.pow(1 - (this.animTimer - 50) / 100, 10))), 0, windowWidth, windowHeight);
			} else {
				rectMode(CORNER);
				noStroke();
				fill(50, 106, 207);
				rect(windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel, 0, windowWidth, windowHeight);
			}
		}

		let temperature = dataMgr.condition.temperature;
		let temperatureLevel = 0;
		if(temperature < -10){
			temperatureLevel = 0;
		} else if(temperature < 30) {
			temperatureLevel = (temperature - (-10)) / (30 - (-10));
		} else {
			temperatureLevel = 1;
		}

		if(this.animTimer > 100){
			if(this.animTimer < 200){
				rectMode(CORNER);
				noStroke();
				fill(215, 64, 55);
				rect(windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel, windowHeight * (1 - temperatureLevel * (1 - Math.pow(1 - (this.animTimer - 100) / 100, 10))), windowWidth, windowHeight);
			} else {
				rectMode(CORNER);
				noStroke();
				fill(215, 64, 55);
				rect(windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel, windowHeight * (1 - temperatureLevel), windowWidth, windowHeight);
			}
		}

		let size = windowWidth * 0.035;
		let mult = 0.5;
		textSize(size);

		let textOpacity = 0;
		let textDisp = 0;
		if(this.detail){
			textOpacity = 255 * standardAnim.incDispList[this.animTimer2];
			textDisp = standardAnim.incDispList[this.animTimer2];
		} else {
			textOpacity = 255 * standardAnim.decDispList[this.animTimer2];
			textDisp = standardAnim.decDispList[this.animTimer2];
		}

		if(dataMgr.condition.humidity > 50){
			pg = createGraphics((windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel), windowHeight);
			pg.fill(255, 255, 255, textOpacity);
			pg.textSize(size);
			pg.textAlign(RIGHT, TOP);
			pg.text('습도' + '\n' + dataMgr.condition.humidity + '%', (windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel) - size * mult + windowWidth * 0.1 * (1 - textDisp), (windowHeight * (1 - dataMgr.condition.humidity / 100)) + size * mult);
			
			pg.fill(255, 255, 255, textOpacity);
			pg.textSize(size);
			pg.textAlign(RIGHT, BOTTOM);
			pg.text('불쾌지수' + '\n' + (round(discomfortIndex)) + '점', (windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel) - size * mult + windowWidth * 0.15 * (1 - textDisp), windowHeight - size * mult);
			image(pg, 0, 0);
		} else {
			pg = createGraphics((windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel), windowHeight);
			pg.fill(0, 0, 0, textOpacity);
			pg.textSize(size);
			pg.textAlign(RIGHT, BOTTOM);
			pg.text('습도' + '\n' + dataMgr.condition.humidity + '%', (windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel) - size * mult + windowWidth * 0.1 * (1 - textDisp), (windowHeight * (1 - dataMgr.condition.humidity / 100)) - size * mult);
			
			pg.fill(0, 0, 0, textOpacity);
			pg.textSize(size);
			pg.textAlign(RIGHT, TOP);
			pg.text('불쾌지수' + '\n' + (round(discomfortIndex)) + '점', (windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel) - size * mult + windowWidth * 0.15 * (1 - textDisp), size * mult);
			image(pg, 0, 0);
		}

		if(dataMgr.condition.temperature > 10){
			pg = createGraphics(windowWidth - (windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel), windowHeight);
			pg.fill(255, 255, 255, textOpacity);
			pg.textSize(size);
			pg.textAlign(LEFT, TOP);
			pg.text('온도' + '\n' + dataMgr.condition.temperature + '°C', size * mult - windowWidth * 0.1 * (1 - textDisp), windowHeight * (1 - temperatureLevel) + size * mult);
			image(pg, (windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel), 0);
		} else {
			pg = createGraphics(windowWidth - (windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel), windowHeight);
			pg.fill(255, 255, 255, textOpacity);
			pg.textSize(size);
			pg.textAlign(LEFT, BOTTOM);
			pg.text('온도' + '\n' + dataMgr.condition.temperature + '°C', size * mult - windowWidth * 0.1 * (1 - textDisp), windowHeight * (1 - temperatureLevel) - size * mult);
			image(pg, (windowWidth * 0.2 + windowWidth * 0.6 * discomfortLevel), 0);
		}
	},
	
	update(){
		if(this.animTimer < 200) {
			this.animTimer += 2 * 1.5;
		}

		if(this.animTimer >= 200){
			if(this.detail && this.animTimer2 < 100){
				this.animTimer2 += 2;
			}
	
			if(!this.detail && this.animTimer2 > 0){
				this.animTimer2 -= 2;
			}
		}
	},

	click(){
		if(this.detail == false){
			this.detail = true;
			this.animTimer2 = standardAnim.decToIncDisp(this.animTimer2);
		} else {
			this.detail = false;
			this.animTimer2 = standardAnim.incToDecDisp(this.animTimer2);
		}
	}
}

let standardAnim = {
	incVelList: [0],
	incDispList: [0],
	decDispList: [0],

	initialize(){
		for(let i = 0; i < 101; i++){
			this.incVelList[i] = (Math.pow(1 - i / 100, 10)) - this.incVelList[i];
			this.incDispList[i] = (1 - Math.pow(1 - i / 100, 10));
			this.decDispList[i] = (Math.pow(i / 100, 10)); 

			if(i + 1 < 101){
				this.incVelList[i + 1] = (Math.pow(1 - i / 100, 10));
			}
  		}
	},

	incToDecDisp(timer){
		let newTime = null;
		let curVal = this.incDispList[timer];
		for(let i = this.decDispList.length - 1; i >= 0 ; i--){
			if(curVal <= this.decDispList[i] && curVal > this.decDispList[i - 1]){
				newTime = i;
				break;
			}
		}
		return newTime;
	},

	decToIncDisp(timer){
		let newTime = null;
		let curVal = this.decDispList[timer];
		for(let i = 0; i < this.incDispList.length - 1; i++){
			if(curVal >= this.incDispList[i] && curVal < this.incDispList[i + 1]){
				newTime = i;
				break;
			}
		}
		return newTime;
	}
}

let outsideMgr = {
	start(){
		picture_promise = weather.getWeather()
		picture_promise.then(res => {
			img_weather = loadImage(`images/${res[0]}.png`);
			img_window = loadImage(`images/${res[1]}.png`);
			img_temp = loadImage(`images/${res[2]}.png`);
			img_umbrella = res[3] ? loadImage(`images/umbrella.png`) : null ;
			img_mask = res[4] ? loadImage(`images/mask.png`) : null ;
		})
	},

	draw(){
		image(img_weather,0,0,windowWidth,windowHeight);
		image(img_window,0,0,windowWidth,windowHeight);
		image(img_temp,0,0,windowWidth,windowHeight);
		img_umbrella ? image(img_umbrella,0,0,windowWidth,windowHeight) : null;
		img_mask ? image(img_mask,0,0,windowWidth,windowHeight) : null;
	},
	
	update(){
		
	},

	click(){

	}
}

function setup (){
	createCanvas(windowWidth, windowHeight);
	setInterval(refreshServer, 10000);
	frameRate(30);
	appMgr.initialize();
	standardAnim.initialize();
}

async function refreshServer() {
	indoorData = await puffdata.getPuffData()
	ventData = await puffdata.getVentLevelData()
	// outsideData = await puffdata.getOutsideWeather()

	// dataMgr.density.co2 = ~~(indoorData.co2 / 100)
	// dataMgr.density.chem = ~~(indoorData.voc / 100)
	// dataMgr.density.dust = indoorData.pm25
	
	if (indoorData != null && ventData != null){
		dataMgr.realValue.co2 = indoorData.co2
		dataMgr.realValue.chem = indoorData.voc
		dataMgr.realValue.dust = indoorData.pm25

		dataMgr.condition.temperature = indoorData.temp.toFixed(1)
		dataMgr.condition.humidity = indoorData.humid.toFixed(1)

		dataMgr.ventil = ventData

		mapData();
	}
}

function mapData(){
	dataMgr.density.co2 = ~~((dataMgr.realValue.co2 - 100) / 100);

	// dust region
	temp = dataMgr.realValue.dust;
	if (temp >= 0 && temp < 105) dataMgr.density.dust = ~~(temp / 15);
	else if (temp >= 105 && temp < 420) dataMgr.density.dust = ~~(temp / 105) + 6;
	else dataMgr.density.dust = 10;

	// chem region
	temp = dataMgr.realValue.chem;
	if (temp >=0 && temp < 50) dataMgr.density.chem = 0;
	else if (temp >= 50 && temp < 275) dataMgr.density.chem = ~~(temp / 25) - 1;
	else dataMgr.density.chem = 10;
}

var first = true
async function draw(){
	if (first){
		await refreshServer();
		first = false;
	}
	appMgr.pageIndex != 2 ||(appMgr.pageIndex == 2 && appMgr.isNewScreen3) ? background(255) : null;
	appMgr.update();
	appMgr.draw();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}