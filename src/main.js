import kaboom from "kaboom"
kaboom({
	background: [0, 0, 0]
})

loadSprite("bean", "/sprites/plane.png")
loadSprite("bean20", "/sprites/plane_20.png")
loadSprite("bean-20", "/sprites/plane_-20.png")
loadSound("score", "/sounds/score.mp3")
loadSound("wooosh", "/sounds/wooosh.mp3")
loadSound("hit", "/sounds/hit.mp3")
loadSprite("background", "/sprites/city.png");
// loadSprite("WTCbackground", "/sprites/WTO.png");
loadSprite("WTCbackground", "/sprites/boom.png");
loadSprite("building", "/sprites/buildin.png");
loadSprite("buildingRotated", "/sprites/buildin-rotated.png");
loadSound("hit", "/sounds/ollahuobkar.mp3")
// define gravity
setGravity(3200)

// setBackground(141, 183, 255)


scene("game", () => {

	add([
		sprite("background"),
		pos(0, 0),
		scale(width() / 1196, height() / 670), // Adjust the scale to fit the canvas size
		z(-1) // Ensure it's behind other game objects
	]);

	const game = add([
		timer(),
	])

	const PIPE_OPEN = 500
	const PIPE_MIN = 100
	const JUMP_FORCE = 800
	const SPEED = 320
	const CEILING = -60

	const bean = game.add([
		sprite("bean"),
		pos(width() / 4, 0),
		scale(0.5),
		area(),
		body(),
	])

	bean.onUpdate(() => {
		if (bean.pos.y >= height() || bean.pos.y <= CEILING) {
			go("lose", score)
		}
	})

	// jump
	// onKeyPress("space", () => {
	// 	bean.jump(JUMP_FORCE)
	// 	play("wooosh")
	// })

	onKeyPress("space", () => {
		bean.jump(JUMP_FORCE);
		play("wooosh");
		bean.use(sprite("bean20"));
		setTimeout(() => {
			bean.use(sprite("bean"));
		}, 200);
	});

	onGamepadButtonPress("south", () => {
		bean.jump(JUMP_FORCE)
		play("wooosh")
		bean.use(sprite("bean20"));
		setTimeout(() => {
			bean.use(sprite("bean"));
		}, 200);
	})

	// mobile
	onClick(() => {
		bean.jump(JUMP_FORCE)
		play("wooosh")
		bean.use(sprite("bean20"));
		setTimeout(() => {
			bean.use(sprite("bean"));
		}, 200);
	})

	let pipeSpawnDelay = 1.5; // Initial delay in seconds between pipe spawns

	function spawnPipe() {
		// calculate pipe positions
		const h1 = rand(PIPE_MIN, height() - PIPE_MIN - PIPE_OPEN);
		const randNum = rand(100, 200);
		const h2 = height() - h1 - PIPE_OPEN;
	
		// Add the bottom building sprite
		game.add([
			pos(width(), -randNum),
			sprite("buildingRotated"),
			area(),
			move(LEFT, SPEED),
			offscreen({ destroy: true }),
			"pipe",
		]);
	
		// Add the top rotated building sprite
		game.add([
			pos(width(), h1 + PIPE_OPEN),
			sprite("building"),
			area(),
			move(LEFT, SPEED),
			offscreen({ destroy: true }),
			"pipe",
			{ passed: false },
		]);
	
		pipeSpawnDelay += 0.1; // Increase the delay for next pipe spawn
	}
	

	// spawn a pipe with a delay
	game.loop(pipeSpawnDelay, () => {
		spawnPipe();
	});

	// callback when bean onCollide with objects with tag "pipe"
	// bean.onCollide("pipe", () => {
	// 	go("lose", score)
	// 	play("hit")
	// 	addKaboom(bean.pos)
	// })
	bean.onCollide("pipe", () => {
		// Pause the game
		game.paused = true;
		play("hit");
		addKaboom(bean.pos);
		wait(0.2, () => {
			game.paused = false;
			go("lose", score);
		});
	});

	// per frame event for all objects with tag 'pipe'
	onUpdate("pipe", (p) => {
		// check if bean passed the pipe
		if (p.pos.x + p.width <= bean.pos.x && p.passed === false) {
			addScore()
			p.passed = true
		}
	})

	// // spawn a pipe every 1 sec
	// game.loop(1, () => {
	// 	spawnPipe()
	// })

	let score = 0

	// display score
	const scoreLabel = game.add([
		text(score),
		anchor("center"),
		pos(width() / 2, 80),
		fixed(),
		z(100),
	])

	function addScore() {
		score++
		scoreLabel.text = score
		play("score")
	}

	let curTween = null

	onKeyPress("p", () => {
		game.paused = !game.paused
		if (curTween) curTween.cancel()
		curTween = tween(
			pauseMenu.pos,
			game.paused ? center() : center().add(0, 700),
			1,
			(p) => pauseMenu.pos = p,
			easings.easeOutElastic,
		)
		if (game.paused) {
			pauseMenu.hidden = false
			pauseMenu.paused = false
		} else {
			curTween.onEnd(() => {
				pauseMenu.hidden = true
				pauseMenu.paused = true
			})
		}
	})

	const pauseMenu = add([
		rect(300, 400),
		color(255, 255, 255),
		outline(4),
		anchor("center"),
		pos(center().add(0, 700)),
	])

	pauseMenu.hidden = true
	pauseMenu.paused = true

})

scene("lose", (score) => {

	add([
		sprite("WTCbackground"),
		pos(0, 0),
		scale(width() / 1800, height() / 1200), // Adjust the scale to fit the canvas size
		z(-1) // Ensure it's behind other game objects
	]);

	add([
		sprite("bean"),
		pos(width() / 2, height() / 2 - 108),
		scale(0.5),
		anchor("center"),
	])

	// display score
	add([
		text(score),
		color(265, 155, 0),
		pos(width() / 2, height() / 2 + 108),
		scale(3),
		anchor("center"),
	])

	// go back to game with space is pressed
	onKeyPress("space", () => go("game"))
	onClick(() => go("game"))

})

debug.inspect = true

go("game")
