import kaboom from "kaboom"
kaboom()

loadSprite("bean", "/sprites/plane.png")
loadSound("score", "/sounds/score.mp3")
loadSound("wooosh", "/sounds/wooosh.mp3")
loadSound("hit", "/sounds/hit.mp3")

// define gravity
setGravity(3200)

setBackground(141, 183, 255)

scene("game", () => {

	const game = add([
		timer(),
	])

	const PIPE_OPEN = 240
	const PIPE_MIN = 100
	const JUMP_FORCE = 800
	const SPEED = 320
	const CEILING = -60

	// a game object consists of a list of components and tags
	const bean = game.add([
		// sprite() means it's drawn with a sprite of name "bean" (defined above in 'loadSprite')
		sprite("bean"),
		// give it a position
		pos(width() / 4, 0),
		scale(0.5),
		// give it a collider
		area(),
		// body component enables it to fall and jump in a gravity world
		body(),
	])

	// check for fall death
	bean.onUpdate(() => {
		if (bean.pos.y >= height() || bean.pos.y <= CEILING) {
			// switch to "lose" scene
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
		bean.rotate += 45; // Rotate the bean by 45 degrees
	});

	onGamepadButtonPress("south", () => {
		bean.jump(JUMP_FORCE)
		play("wooosh")
	})

	// mobile
	onClick(() => {
		bean.jump(JUMP_FORCE)
		play("wooosh")
	})

	let pipeSpawnDelay = 1.2; // Initial delay in seconds between pipe spawns

	function spawnPipe() {
		// calculate pipe positions
		const h1 = rand(PIPE_MIN, height() - PIPE_MIN - PIPE_OPEN);
		const h2 = height() - h1 - PIPE_OPEN;

		game.add([
			pos(width(), 0),
			rect(64, h1),
			color(0, 127, 255),
			outline(4),
			area(),
			move(LEFT, SPEED),
			offscreen({ destroy: true }),
			"pipe",
		]);

		game.add([
			pos(width(), h1 + PIPE_OPEN),
			rect(64, h2),
			color(0, 127, 255),
			outline(4),
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
	bean.onCollide("pipe", () => {
		go("lose", score)
		play("hit")
		addKaboom(bean.pos)
	})

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
		sprite("bean"),
		pos(width() / 2, height() / 2 - 108),
		scale(0.5),
		anchor("center"),
	])

	// display score
	add([
		text(score),
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