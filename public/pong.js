"use strict";
function pong() {
    class PongTable {
        constructor(svg) {
            this.paddle = null;
            this.setDefaultPlayerSide = () => {
                Settings.settings.player_side === "left" ?
                    (SessionData.session_data.current_paddle = this.createPaddle(Settings.settings.paddle_height, "left"),
                        SessionData.session_data.opponent_paddle = this.createPaddle(Settings.settings.paddle_height, "right"))
                    :
                        (SessionData.session_data.current_paddle = this.createPaddle(Settings.settings.paddle_height, "right"),
                            SessionData.session_data.opponent_paddle = this.createPaddle(Settings.settings.paddle_height, "left"));
            };
            this.paddle_movement = (paddle) => (y_cord) => {
                paddle.attr("y", y_cord);
            };
            this.move_paddle = (paddle) => {
                const o = Observable
                    .fromEvent(HTMLPage.svg, "mousemove")
                    .map(({ clientX, clientY }) => ({ x: clientX, y: clientY }));
                o.map(({ x, y }) => `${y}`)
                    .map(y => (Number(y) - Number(HTMLPage.svg.style.paddingTop) - HTMLPage.svg.getBoundingClientRect().top) - Number(paddle.attr("height")) / 2)
                    .filter((y) => y <= (Number(HTMLPage.svg.getAttribute("height"))) - Number(paddle.attr("height")) - Settings.settings.padding && y >= Settings.settings.padding)
                    .subscribe(y => this.paddle_movement(paddle)(y.toString()));
                o.subscribe(_ => HTMLPage.svg.style.cursor = "none");
            };
            this.initalizeTable = (svg) => {
                const dash = (y) => new Elem(svg, 'rect')
                    .attr('width', 5)
                    .attr('height', 10)
                    .attr('x', Number(svg.getAttribute("width")) / 2 - 2.5)
                    .attr('y', Number(y))
                    .attr('fill', '#FFF'), dashed_line = (gap) => {
                    const dashed_line_aux = (y_value) => {
                        return (Settings.settings.padding > y_value) ? 0 : (dash(y_value), dashed_line_aux(y_value - gap));
                    };
                    dashed_line_aux(Number(svg.getAttribute("y")) + Number(svg.getAttribute("height")) - gap - Settings.settings.padding);
                }, score = () => {
                    new Elem(svg, "text")
                        .attr("x", Number(svg.getAttribute("width")) / 4)
                        .attr("y", Number(svg.getAttribute("height")) * 2 / 8)
                        .attr("font-size", 100)
                        .attr("fill", "white")
                        .attr("id", "score1")
                        .attr("font-family", "Impact"),
                        document.getElementById("score1").textContent = SessionData.game_data.score_right.toString(),
                        new Elem(svg, "text")
                            .attr("x", Number(svg.getAttribute("width")) * 3 / 4)
                            .attr("y", Number(svg.getAttribute("height")) * 2 / 8)
                            .attr("font-size", 100)
                            .attr("fill", "white")
                            .attr("id", "score2")
                            .attr("font-family", "Impact"),
                        document.getElementById("score2").textContent = SessionData.game_data.score_left.toString();
                };
                dashed_line(Settings.settings.dash_gap);
                score();
            };
            this.initalizeTable(svg);
            this.setDefaultPlayerSide();
            SessionData.session_data.current_ball = new Ball();
        }
        createPaddle(height, side) {
            if (side == "left") {
                return this.paddle = new Elem(HTMLPage.svg, 'rect')
                    .attr("id", "paddle_left")
                    .attr('width', 5)
                    .attr('height', Number(height))
                    .attr('x', Number(HTMLPage.svg.getAttribute("x")) + 40)
                    .attr('y', Number(HTMLPage.svg.getAttribute("height")) / 2 + Number(HTMLPage.svg.getAttribute("t")) / 2)
                    .attr('fill', '#FFF');
            }
            else {
                return this.paddle = new Elem(HTMLPage.svg, 'rect')
                    .attr("id", "paddle_right")
                    .attr('width', 5)
                    .attr('height', Number(height))
                    .attr('x', Number(HTMLPage.svg.getAttribute("x")) + Number(HTMLPage.svg.getAttribute("width")) - 40)
                    .attr('y', Number(HTMLPage.svg.getAttribute("height")) / 2 + Number(HTMLPage.svg.getAttribute("t")) / 2)
                    .attr('fill', '#FFF');
            }
        }
        getPaddle() {
            return this.paddle;
        }
    }
    class Ball {
        constructor() {
            this.ball_movement = (ball_starting_direction) => {
                const gradients = [0, -Settings.settings.ball_speed, Settings.settings.ball_speed, -Settings.settings.ball_speed - 0.5, Settings.settings.ball_speed + 0.5];
                let x_change = gradients[2] * ball_starting_direction;
                let y_change = Math.floor((Math.random() * 3));
                let normal = () => null, bottomSide = () => null, topSide = () => null, currentPaddleTop = () => null, currentPaddleTopMiddle = () => null, currentPaddleMiddle = () => null, currentPaddleBottomMiddle = () => null, currentPaddleBottom = () => null, opponentPaddleTop = () => null, opponentPaddleTopMiddle = () => null, opponentPaddleMiddle = () => null, opponentPaddleBottomMiddle = () => null, opponentPaddleBottom = () => null;
                const observableFromBall = Observable.interval(Settings.settings.game_speed).map(s => ({ x: this.ball.attr('cx'), y: this.ball.attr('cy') }));
                const observableFromBallAfterCollisionCurrentPaddle = Observable.interval(Settings.settings.game_speed).map(_ => ({ x: this.ball.attr('cx'), y: this.ball.attr('cy') }))
                    .filter(({ x, y }) => Number(x) - Number(this.ball.attr("r")) < Number(SessionData.session_data.current_paddle.attr("x")) + Number(SessionData.session_data.current_paddle.attr("width")))
                    .filter(({ x, y }) => Number(x) + Number(this.ball.attr("r")) > Number(SessionData.session_data.current_paddle.attr("x")) - Number(SessionData.session_data.current_paddle.attr("width")))
                    .filter(({ x, y }) => Number(y) + Number(this.ball.attr("r")) > Number(SessionData.session_data.current_paddle.attr("y")))
                    .filter(({ x, y }) => Number(y) < Number(SessionData.session_data.current_paddle.attr("y")) + Number(SessionData.session_data.current_paddle.attr("height")) + Number(this.ball.attr("r")));
                const observableFromBallAfterCollisionOpponentPaddle = Observable.interval(Settings.settings.game_speed).map(s => ({ x: this.ball.attr('cx'), y: this.ball.attr('cy') }))
                    .filter(({ x, y }) => Number(x) - Number(this.ball.attr("r")) < Number(SessionData.session_data.opponent_paddle.attr("x")) + Number(SessionData.session_data.opponent_paddle.attr("width")))
                    .filter(({ x, y }) => Number(x) + Number(this.ball.attr("r")) > Number(SessionData.session_data.opponent_paddle.attr("x")) - Number(SessionData.session_data.opponent_paddle.attr("width")))
                    .filter(({ x, y }) => Number(y) + Number(this.ball.attr("r")) > Number(SessionData.session_data.opponent_paddle.attr("y")))
                    .filter(({ x, y }) => Number(y) < Number(SessionData.session_data.opponent_paddle.attr("y")) + Number(SessionData.session_data.opponent_paddle.attr("height")) + Number(this.ball.attr("r")));
                normal = Observable.interval(Settings.settings.game_speed)
                    .map(s => ({ x: this.ball.attr('cx'), y: this.ball.attr('cy') }))
                    .map(({ x, y }) => ({ x: x_change + Number(x), y: y_change + Number(y) }))
                    .subscribe(({ x, y }) => (this.ball.attr('cx', x),
                    this.ball.attr('cy', y)));
                bottomSide = observableFromBall
                    .filter(({ y }) => (Number(y) > Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.ball.attr("r"))))
                    .map((_) => ((GameSound.game_sound.collision.play(),
                    y_change = (-y_change))))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                topSide = observableFromBall
                    .filter(({ y }) => Number(y) < Settings.settings.padding + Number(this.ball.attr("r")))
                    .map((_) => ((GameSound.game_sound.collision.play(),
                    y_change = (-y_change))))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                currentPaddleTop = observableFromBallAfterCollisionCurrentPaddle
                    .filter(({ y }) => Number(y) <= Number(SessionData.session_data.current_paddle.attr("y")) + Number(SessionData.session_data.current_paddle.attr("height")) * 0.05)
                    .map((_) => (GameSound.game_sound.collision.play(),
                    x_change = (-x_change * gradients[4]),
                    y_change = gradients[3]))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                currentPaddleTopMiddle = observableFromBallAfterCollisionCurrentPaddle
                    .filter(({ y }) => (Number(y) > Number(SessionData.session_data.current_paddle.attr("y")) + Number(SessionData.session_data.current_paddle.attr("height")) * 0.05))
                    .filter(({ y }) => (Number(y) < Number(SessionData.session_data.current_paddle.attr("y")) + Number(SessionData.session_data.current_paddle.attr("height")) / 2 - Number(SessionData.session_data.current_paddle.attr("height")) * 0.05))
                    .map((_) => (GameSound.game_sound.collision.play(),
                    x_change = (-x_change),
                    y_change = gradients[1]))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                currentPaddleMiddle = observableFromBallAfterCollisionCurrentPaddle
                    .filter(({ y }) => (Number(y) >= Number(SessionData.session_data.current_paddle.attr("y")) + Number(SessionData.session_data.current_paddle.attr("height")) / 2 - Number(SessionData.session_data.current_paddle.attr("height")) * 0.05))
                    .filter(({ y }) => (Number(y) <= Number(SessionData.session_data.current_paddle.attr("y")) + Number(SessionData.session_data.current_paddle.attr("height")) / 2 + Number(SessionData.session_data.current_paddle.attr("height")) * 0.05))
                    .map((_) => (GameSound.game_sound.collision.play(),
                    x_change = (-x_change),
                    y_change = gradients[Math.floor((Math.random() * 3))]))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                currentPaddleBottomMiddle = observableFromBallAfterCollisionCurrentPaddle
                    .filter(({ y }) => (Number(y) > Number(SessionData.session_data.current_paddle.attr("y")) + Number(SessionData.session_data.current_paddle.attr("height")) / 2 + Number(SessionData.session_data.current_paddle.attr("height")) * 0.05))
                    .filter(({ y }) => (Number(y) < Number(SessionData.session_data.current_paddle.attr("y")) + Number(SessionData.session_data.current_paddle.attr("height")) - Number(SessionData.session_data.current_paddle.attr("height")) * 0.05))
                    .map((_) => (GameSound.game_sound.collision.play(),
                    x_change = (-x_change),
                    y_change = gradients[2]))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                currentPaddleBottom = observableFromBallAfterCollisionCurrentPaddle
                    .filter(({ y }) => (Number(y) >= Number(SessionData.session_data.current_paddle.attr("y")) + Number(SessionData.session_data.current_paddle.attr("height")) - Number(SessionData.session_data.current_paddle.attr("height")) * 0.05))
                    .map((_) => (GameSound.game_sound.collision.play(),
                    x_change = (-x_change * gradients[4]),
                    y_change = gradients[4]))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                opponentPaddleTop = observableFromBallAfterCollisionOpponentPaddle
                    .filter(({ y }) => Number(y) <= Number(SessionData.session_data.opponent_paddle.attr("y")) + Number(SessionData.session_data.opponent_paddle.attr("height")) * 0.05)
                    .map((_) => (GameSound.game_sound.collision.play(),
                    x_change = (-x_change * gradients[4]),
                    y_change = gradients[3]))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                opponentPaddleTopMiddle = observableFromBallAfterCollisionOpponentPaddle
                    .filter(({ y }) => (Number(y) > Number(SessionData.session_data.opponent_paddle.attr("y")) + Number(SessionData.session_data.opponent_paddle.attr("height")) * 0.05))
                    .filter(({ y }) => (Number(y) < Number(SessionData.session_data.opponent_paddle.attr("y")) + Number(SessionData.session_data.opponent_paddle.attr("height")) / 2 - Number(SessionData.session_data.opponent_paddle.attr("height")) * 0.05))
                    .map((_) => (GameSound.game_sound.collision.play(),
                    x_change = (-x_change),
                    y_change = gradients[1]))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                opponentPaddleMiddle = observableFromBallAfterCollisionOpponentPaddle
                    .filter(({ y }) => (Number(y) >= Number(SessionData.session_data.opponent_paddle.attr("y")) + Number(SessionData.session_data.opponent_paddle.attr("height")) / 2 - Number(SessionData.session_data.opponent_paddle.attr("height")) * 0.05))
                    .filter(({ y }) => (Number(y) <= Number(SessionData.session_data.opponent_paddle.attr("y")) + Number(SessionData.session_data.opponent_paddle.attr("height")) / 2 + Number(SessionData.session_data.opponent_paddle.attr("height")) * 0.05))
                    .map((_) => (GameSound.game_sound.collision.play(),
                    x_change = (-x_change),
                    y_change = gradients[Math.floor((Math.random() * 3))]))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                opponentPaddleBottomMiddle = observableFromBallAfterCollisionOpponentPaddle
                    .filter(({ y }) => (Number(y) > Number(SessionData.session_data.opponent_paddle.attr("y")) + Number(SessionData.session_data.opponent_paddle.attr("height")) / 2 + Number(SessionData.session_data.opponent_paddle.attr("height")) * 0.05))
                    .filter(({ y }) => (Number(y) < Number(SessionData.session_data.opponent_paddle.attr("y")) + Number(SessionData.session_data.opponent_paddle.attr("height")) - Number(SessionData.session_data.opponent_paddle.attr("height")) * 0.05))
                    .map((_) => (GameSound.game_sound.collision.play(),
                    x_change = (-x_change),
                    y_change = gradients[2]))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                opponentPaddleBottom = observableFromBallAfterCollisionOpponentPaddle
                    .filter(({ x, y }) => (Number(y) >= Number(SessionData.session_data.opponent_paddle.attr("y")) + Number(SessionData.session_data.opponent_paddle.attr("height")) - Number(SessionData.session_data.opponent_paddle.attr("height")) * 0.05))
                    .map((_) => (GameSound.game_sound.collision.play(),
                    x_change = (-x_change * gradients[4]),
                    y_change = gradients[4]))
                    .subscribe((_) => (this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change),
                    this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)));
                return () => (normal(),
                    bottomSide(),
                    topSide(),
                    currentPaddleTop(),
                    currentPaddleTopMiddle(),
                    currentPaddleMiddle(),
                    currentPaddleBottomMiddle(),
                    currentPaddleBottom(),
                    opponentPaddleTop(),
                    opponentPaddleTopMiddle(),
                    opponentPaddleMiddle(),
                    opponentPaddleBottomMiddle(),
                    opponentPaddleBottom());
            };
            this.ball = new Elem(HTMLPage.svg, 'circle')
                .attr("id", "ball")
                .attr('cx', Number(HTMLPage.svg.getAttribute("width")) / 2)
                .attr('cy', Number(HTMLPage.svg.getAttribute("height")) / 2)
                .attr('r', 8)
                .attr('fill', '#FFF');
        }
        getBall() {
            return this.ball;
        }
    }
    class CPUPaddleMovement {
        constructor(paddle) {
            this.cpu_paddle_movement = () => {
                const paddle_increment = Settings.settings.ball_speed;
                let moveUp = () => null;
                let moveDown = () => null;
                let stay = () => null;
                moveDown = Observable.interval(Settings.settings.game_speed)
                    .map(_ => ({ x: SessionData.session_data.current_ball.getBall().attr('cy') }))
                    .filter(({ x }) => Number(this.paddle.attr("y")) + Number(this.paddle.attr("height")) / 2 < Number(x))
                    .filter((_) => !(Number(this.paddle.attr("y")) + Number(this.paddle.attr("height")) > Settings.settings.table_height - Settings.settings.padding))
                    .map((_) => ({ y: Number(this.paddle.attr("y")) + paddle_increment }))
                    .subscribe(({ y }) => (this.paddle.attr("y", y.toString())));
                moveUp = Observable.interval(Settings.settings.game_speed)
                    .map(_ => ({ x: SessionData.session_data.current_ball.getBall().attr('cy') }))
                    .filter(({ x }) => Number(this.paddle.attr("y")) + Number(this.paddle.attr("height")) / 2 > Number(x))
                    .filter((_) => !(Number(this.paddle.attr("y")) < Settings.settings.padding))
                    .map((_) => ({ y: Number(this.paddle.attr("y")) - paddle_increment }))
                    .subscribe(({ y }) => (this.paddle.attr("y", y.toString())));
                stay = Observable.interval(Settings.settings.game_speed)
                    .map(_ => ({ x: SessionData.session_data.current_ball.getBall().attr('cy') }))
                    .filter(({ x }) => Number(this.paddle.attr("y")) + Number(this.paddle.attr("height")) / 2 === Number(x))
                    .map((_) => ({ y: Number(this.paddle.attr("y")) }))
                    .subscribe(({ y }) => (this.paddle.attr("y", y.toString())));
                return () => (moveUp(), moveDown(), stay());
            };
            this.paddle = paddle;
        }
        getCPUPaddleMovement() {
            return this.cpu_paddle_movement;
        }
    }
    class Gameplay {
        constructor() {
            this.setHTMLPage = (html) => {
                this.htmlPage = html;
            };
            this.gameplay = () => {
                const mouseup = Observable.fromEvent(HTMLPage.svg, 'mouseup')
                    .filter(_ => !Multiplayer.MULTIPLAYER_STATUS)
                    .filter((_ => !this.game_data.round_started))
                    .subscribe(_ => this.startRound());
                let scoreLeft = () => null;
                let scoreRight = () => null;
                let gameWin = () => null;
                scoreLeft = Observable.interval(Settings.settings.game_speed)
                    .map(_ => ({ x: this.session_data.current_ball.getBall().attr('cx') }))
                    .filter(({ x }) => (Number(x) > (Number(HTMLPage.svg.getAttribute("x")) + Number(this.session_data.current_ball.getBall().attr("r")) + Number(HTMLPage.svg.getAttribute("width")))))
                    .subscribe(({ x }) => (GameSound.game_sound.fail.play(),
                    this.game_data.score_left += 1,
                    document.getElementById("score1").textContent = (this.game_data.score_left).toString(),
                    this.session_data.end_ball_movement(),
                    this.session_data.end_cpu_paddle_movement(),
                    this.session_data.current_ball.getBall()
                        .attr("cy", Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.session_data.current_ball.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding + Number(this.session_data.current_ball.getBall().attr("r"))))
                        .attr("cx", Number(HTMLPage.svg.getAttribute("width")) / 2),
                    this.game_data.round_started = false,
                    this.game_data.start_direction = 1,
                    this.htmlPage.getGameBanner().textContent = "Left is Serving"));
                scoreRight = Observable.interval(Settings.settings.game_speed)
                    .map(s => ({ x: this.session_data.current_ball.getBall().attr('cx') }))
                    .filter(({ x }) => (Number(x) < (Number(HTMLPage.svg.getAttribute("x")) - Number(this.session_data.current_ball.getBall().attr("r")))))
                    .subscribe(({ x }) => (GameSound.game_sound.fail.play(),
                    this.game_data.score_right += 1,
                    document.getElementById("score2").textContent = (this.game_data.score_right).toString(),
                    this.session_data.end_ball_movement(),
                    this.session_data.end_cpu_paddle_movement(),
                    this.session_data.current_ball.getBall()
                        .attr("cy", Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.session_data.current_ball.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding + Number(this.session_data.current_ball.getBall().attr("r"))))
                        .attr("cx", Number(HTMLPage.svg.getAttribute("width")) / 2),
                    this.game_data.round_started = false,
                    this.game_data.start_direction = -1,
                    this.htmlPage.getGameBanner().textContent = "Right is Serving"));
                gameWin = Observable.interval(Settings.settings.game_speed)
                    .map(s => ({ x: this.session_data.current_ball.getBall().attr('cx') }))
                    .filter(({ x }) => (this.game_data.score_left >= Settings.settings.game_point || this.game_data.score_right >= Settings.settings.game_point))
                    .subscribe(({ x }) => (this.session_data.gameplay_main(),
                    mouseup(),
                    this.session_data.end_ball_movement(),
                    this.session_data.end_cpu_paddle_movement(),
                    this.session_data.current_ball.getBall().attr("r", 0),
                    this.htmlPage.getPlayerTurn().textContent = "Wanna play again?",
                    this.game_data.score_left > this.game_data.score_right ? this.htmlPage.getGameBanner().textContent = "Left Won the Game" : this.htmlPage.getGameBanner().textContent = "Right Won the Game",
                    document.getElementById("start").textContent = "Play Again",
                    this.game_data.round_started = true));
                this.session_data.gameplay_main = () => (scoreLeft(), scoreRight(), gameWin());
            };
            this.htmlPage = undefined;
            this.session_data = SessionData.session_data;
            this.game_data = SessionData.game_data;
        }
        startRound() {
            this.game_data.round_started = true;
            this.session_data.end_ball_movement = this.session_data.current_ball.ball_movement(this.game_data.start_direction);
            let cpu = new CPUPaddleMovement(this.session_data.opponent_paddle);
            this.session_data.end_cpu_paddle_movement = cpu.getCPUPaddleMovement()();
        }
    }
    class HTMLPage {
        constructor(gameplay) {
            this.game_banner = document.getElementById("game_state_banner");
            this.player_turn = document.getElementById("player_turn");
            this.start_button = document.getElementById("start");
            this.init = () => {
                Settings.settings.player_side === "left" ? document.getElementById("left_side").checked = true : document.getElementById("right_side").checked = true,
                    document.getElementById("theight").value = Settings.settings.table_height.toString(),
                    document.getElementById("twidth").value = Settings.settings.table_width.toString(),
                    document.getElementById("ball_speed").value = Settings.settings.ball_speed.toString(),
                    document.getElementById("frame_rate").value = Settings.settings.game_speed.toString(),
                    document.getElementById("game_point").value = Settings.settings.game_point.toString(),
                    document.getElementById("paddle_height").value = Settings.settings.paddle_height.toString(),
                    document.getElementById("dash_gap").value = Settings.settings.dash_gap.toString(),
                    document.getElementById("padding").value = Settings.settings.padding.toString();
            };
            this.validateInput = () => {
                let res = {
                    code: 200,
                    message: "Undefined"
                };
                let inputs = {
                    tableHeight: Number(document.getElementById("theight").value),
                    tableWidth: Number(document.getElementById("twidth").value),
                    ballSpeed: Number(document.getElementById("ball_speed").value),
                    frameRate: Number(document.getElementById("frame_rate").value),
                    gamePoint: Number(document.getElementById("game_point").value),
                    paddleHeight: Number(document.getElementById("paddle_height").value),
                    dashGap: Number(document.getElementById("dash_gap").value),
                    padding: Number(document.getElementById("padding").value)
                };
                (inputs.tableHeight >= 300 && inputs.tableHeight <= 1000) ? (res.code == 200) ? (res.code = 200, res.message = "Succesful") : undefined : (res.code = 404, res.message = "Table Height not in range (300 - 1000)");
                (inputs.tableWidth >= 300 && inputs.tableWidth <= 1000) ? (res.code == 200) ? (res.code = 200, res.message = "Succesful") : undefined : (res.code = 404, res.message = "Table Width not in range (300 - 1000)");
                (inputs.ballSpeed >= 0.1 && inputs.ballSpeed <= 5) ? (res.code == 200) ? (res.code = 200, res.message = "Succesful") : undefined : (res.code = 404, res.message = "Difficulty not in range (0.1 - 5)");
                (inputs.frameRate >= 1 && inputs.frameRate <= 10) ? (res.code == 200) ? (res.code = 200, res.message = "Succesful") : undefined : (res.code = 404, res.message = "Frame Rate not in range (1 - 10)");
                (inputs.gamePoint >= 2 && inputs.gamePoint <= 42) ? (res.code == 200) ? (res.code = 200, res.message = "Succesful") : undefined : (res.code = 404, res.message = "Game Point not in range (2 - 42)");
                (inputs.paddleHeight >= Number(inputs.tableHeight) * 0.1 && inputs.paddleHeight <= Number(inputs.tableHeight) * 0.5) ? (res.code == 200) ? (res.code = 200, res.message = "Succesful") : undefined : (res.code = 404, res.message = "Paddle Height not in range (10% of Table Height - 80% of Table Height) ");
                (inputs.dashGap >= 10 && inputs.dashGap <= 40) ? (res.code == 200) ? (res.code = 200, res.message = "Succesful") : undefined : (res.code = 404, res.message = "Dash Gap not in range (10-40)");
                (inputs.padding >= 30 && inputs.padding <= 100) ? (res.code == 200) ? (res.code = 200, res.message = "Succesful") : undefined : (res.code = 404, res.message = "Padding not in range (30 - 100)");
                return res;
            };
            this.update = () => {
                let svg = document.getElementById("canvas");
                const updategame = () => {
                    let pongTable = new PongTable(HTMLPage.svg);
                    pongTable.move_paddle(SessionData.session_data.current_paddle);
                };
                let response = this.validateInput();
                (response.code === 404) ? alert(response.message) :
                    (confirm("THE GAME IS STILL IN BETA. If you wish to update the settings, do at your own RISK. The game may crash on some combinations. If it crashes you will have to reload the page.  Do you wish to continue? ") ?
                        (document.getElementById("left_side").checked ?
                            Settings.settings.player_side = "left" : Settings.settings.player_side = "right",
                            Settings.settings.table_height = Number(document.getElementById("theight").value),
                            Settings.settings.table_width = Number(document.getElementById("twidth").value),
                            Settings.settings.ball_speed = Number(document.getElementById("ball_speed").value),
                            Settings.settings.game_speed = Number(document.getElementById("frame_rate").value),
                            Settings.settings.game_point = Number(document.getElementById("game_point").value),
                            Settings.settings.paddle_height = Number(document.getElementById("paddle_height").value),
                            Settings.settings.dash_gap = Number(document.getElementById("dash_gap").value),
                            Settings.settings.padding = Number(document.getElementById("padding").value),
                            HTMLPage.clearAllChildren(svg),
                            document.getElementById("canvas").setAttribute("height", Settings.settings.table_height.toString()),
                            document.getElementById("canvas").setAttribute("width", Settings.settings.table_width.toString()),
                            updategame())
                        :
                            this.init());
            };
            this.start_game = () => {
                SessionData.session_data.gameplay_main ?
                    (SessionData.session_data.gameplay_main(), SessionData.session_data.end_ball_movement(), SessionData.session_data.end_cpu_paddle_movement())
                    :
                        undefined;
                SessionData.game_data.score_left = 0;
                SessionData.game_data.score_right = 0;
                SessionData.game_data.round_started = false;
                SessionData.game_data.start_direction = 1;
                HTMLPage.clearAllChildren(HTMLPage.svg);
                let pongTable = new PongTable(HTMLPage.svg);
                pongTable.move_paddle(SessionData.session_data.current_paddle);
                this.gamePlay.gameplay();
                this.player_turn.textContent = "Game Started";
                this.game_banner.textContent = "Left is Serving";
                document.getElementById("start").textContent = "Restart Game";
            };
            this.loadSound = () => {
                if (GameSound.game_sound.collision.src !== undefined || GameSound.game_sound.fail.src !== undefined) {
                    GameSound.game_sound.collision.src = "sound/knock.wav";
                    GameSound.game_sound.fail.src = "sound/fail.wav";
                }
            };
            this.getGameBanner = () => {
                return this.game_banner;
            };
            this.getPlayerTurn = () => {
                return this.player_turn;
            };
            this.gamePlay = gameplay;
            this.gamePlay.setHTMLPage(this);
            this.start_button = document.getElementById("start");
            this.game_banner = document.getElementById("game_state_banner");
            this.player_turn = document.getElementById("player_turn");
            this.start_button.style.display = "block";
            this.init();
            document.getElementById("start").onclick = this.start_game;
            document.getElementById("update").onclick = this.update;
            document.getElementById("singleplayer_button").onclick = Multiplayer.switchToSP;
            this.loadSound();
        }
    }
    HTMLPage.svg = document.getElementById("canvas");
    HTMLPage.clearAllChildren = (svg) => {
        let count = svg.childElementCount;
        while (count > 0) {
            svg.removeChild(svg.firstChild);
            count--;
        }
    };
    class SessionData {
        constructor() { }
    }
    SessionData.session_data = {
        current_paddle: undefined,
        opponent_paddle: undefined,
        current_ball: undefined,
        gameplay_main: () => null,
        end_cpu_paddle_movement: () => null,
        end_ball_movement: () => null
    };
    SessionData.game_data = {
        "score_left": 0,
        "score_right": 0,
        "round_started": false,
        "start_direction": 1
    };
    class Settings {
    }
    Settings.settings = {
        "table_height": 600,
        "table_width": 600,
        "game_speed": 8,
        "ball_speed": 2,
        "player_side": "left",
        "game_point": 11,
        "paddle_height": 60,
        "dash_gap": 20,
        "padding": 50
    };
    class GameSound {
    }
    GameSound.game_sound = {
        collision: new Audio(),
        fail: new Audio()
    };
    class Multiplayer {
        constructor(htmlPage) {
            this.updateScore = (res) => {
                const socket = io();
                if (res.game_id == this.GAMEID) {
                    GameSound.game_sound.fail.play(),
                        SessionData.game_data.score_left = res.score_1;
                    SessionData.game_data.score_right = res.score_2;
                    this.html_page.getPlayerTurn().textContent = res.message;
                    document.getElementById("score1").textContent = (SessionData.game_data.score_left).toString();
                    document.getElementById("score2").textContent = (SessionData.game_data.score_right).toString();
                    if (res.status == 1) {
                        document.getElementById("loader2").style.display = "block";
                        document.getElementById("singleplayer_button").style.display = "none";
                        SessionData.game_data.score_left > SessionData.game_data.score_right ? this.html_page.getGameBanner().textContent = "Left Won the Game" : this.html_page.getGameBanner().textContent = "Right Won the Game";
                        SessionData.game_data.round_started = true;
                        Observable.toSocketIO(socket, "detach", this.GAMEID);
                        const refresh = () => { window.location.reload(); };
                        setTimeout(refresh, 5000);
                    }
                }
            };
            this.host_gameplay = () => {
                const socket = io();
                let mouseup = () => null;
                mouseup = Observable.fromEvent(HTMLPage.svg, 'mouseup')
                    .filter((s => !SessionData.game_data.round_started))
                    .subscribe(s => (SessionData.game_data.round_started = true,
                    SessionData.session_data.end_ball_movement = SessionData.session_data.current_ball.ball_movement(SessionData.game_data.start_direction)));
                let scoreLeft = () => null;
                let scoreRight = () => null;
                let gameWin = () => null;
                scoreLeft = Observable.interval(Settings.settings.game_speed)
                    .map(_ => ({ x: SessionData.session_data.current_ball.getBall().attr('cx') }))
                    .filter(({ x }) => (Number(x) < (Number(HTMLPage.svg.getAttribute("x")) - Number(SessionData.session_data.current_ball.getBall().attr("r")))))
                    .subscribe((_) => ((GameSound.game_sound.fail.play(),
                    SessionData.game_data.score_right += 1,
                    document.getElementById("score2").textContent = (SessionData.game_data.score_right).toString(),
                    SessionData.session_data.end_ball_movement(),
                    SessionData.game_data.round_started = false,
                    SessionData.game_data.start_direction = -1,
                    this.html_page.getPlayerTurn().textContent = "Right is Serving",
                    SessionData.session_data.current_ball.getBall()
                        .attr("cy", Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(SessionData.session_data.current_ball.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                        .attr("cx", Number(HTMLPage.svg.getAttribute("width")) / 2),
                    Observable.toSocketIO(socket, "score_update", {
                        "status": 0,
                        "game_id": this.GAMEID,
                        "score_1": SessionData.game_data.score_left,
                        "score_2": SessionData.game_data.score_right,
                        "message": "Right is Serving"
                    }))));
                scoreRight = Observable.interval(Settings.settings.game_speed)
                    .map(_ => ({ x: SessionData.session_data.current_ball.getBall().attr('cx') }))
                    .filter(({ x }) => (Number(x) > (Number(HTMLPage.svg.getAttribute("x")) + Number(SessionData.session_data.current_ball.getBall().attr("r")) + Number(HTMLPage.svg.getAttribute("width")))))
                    .subscribe((_) => (GameSound.game_sound.fail.play(),
                    SessionData.game_data.score_left += 1,
                    document.getElementById("score1").textContent = (SessionData.game_data.score_left).toString(),
                    SessionData.session_data.end_ball_movement(),
                    SessionData.game_data.round_started = false,
                    SessionData.game_data.start_direction = 1,
                    this.html_page.getPlayerTurn().textContent = "Left is Serving",
                    SessionData.session_data.current_ball.getBall()
                        .attr("cy", Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(SessionData.session_data.current_ball.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                        .attr("cx", Number(HTMLPage.svg.getAttribute("width")) / 2),
                    Observable.toSocketIO(socket, "score_update", {
                        "status": 0,
                        "game_id": this.GAMEID,
                        "score_1": SessionData.game_data.score_left,
                        "score_2": SessionData.game_data.score_right,
                        "message": "Left is Serving"
                    })));
                gameWin = Observable.interval(Settings.settings.game_speed)
                    .map(_ => ({ x: SessionData.session_data.current_ball.getBall().attr('cx') }))
                    .filter((_) => (SessionData.game_data.score_left >= Settings.settings.game_point || SessionData.game_data.score_right >= Settings.settings.game_point))
                    .subscribe((_) => (document.getElementById("singleplayer_button").style.display = "none",
                    document.getElementById("loader2").style.display = "block",
                    SessionData.session_data.gameplay_main(),
                    mouseup(),
                    SessionData.session_data.end_ball_movement(),
                    SessionData.session_data.current_ball.getBall().attr("r", 0),
                    this.html_page.getPlayerTurn().textContent = "Thank You for Playing Multiplayer Pong. You will be redirected to single player is 5 seconds.",
                    SessionData.game_data.score_left > SessionData.game_data.score_right ? this.html_page.getGameBanner().textContent = "Left Won the Game" : this.html_page.getGameBanner().textContent = "Right Won the Game",
                    SessionData.game_data.round_started = true,
                    Observable.toSocketIO(socket, "score_update", {
                        "status": 1,
                        "game_id": this.GAMEID,
                        "score_1": SessionData.game_data.score_left,
                        "score_2": SessionData.game_data.score_right,
                        "message": "Thank You for Playing Multiplayer Pong. You will be redirected to single player is 5 seconds."
                    }),
                    Observable.toSocketIO(socket, "detach", this.GAMEID),
                    setTimeout(() => { window.location.reload(); }, 5000)));
                SessionData.session_data.gameplay_main = () => (scoreLeft(), scoreRight(), gameWin());
            };
            this.createGame = () => {
                const generateGameId = () => {
                    const socket = io(), _this = this;
                    Observable.toSocketIO(socket, "new_game");
                    let allocated = [];
                    allocated[0] = false;
                    Observable.fromSocketIO(socket, document, "game_id").subscribe((res) => (_this.updatePlayerHost(res, allocated)));
                };
                this.createLobby();
                generateGameId();
            };
            this.joinGame = () => {
                let game_id = document.getElementById("join_game_id").value;
                if (game_id == "") {
                    alert("Did you enter a Game ID?");
                    Multiplayer.switchToSP();
                }
                else {
                    const socket = io(), _this = this;
                    Observable.toSocketIO(socket, "join_game", game_id.toString());
                    Observable.fromSocketIO(socket, document, "join").subscribe((res) => (_this.updatePlayerClient(res)));
                }
            };
            document.getElementById("creategame").onclick = this.createGame;
            document.getElementById("joingame").onclick = this.joinGame;
            this.USERS = [];
            this.GAMEID = null;
            this.SOCKETID = null;
            this.html_page = htmlPage;
        }
        createLobby(game_id = undefined) {
            document.getElementById("lobby").style.display = "block";
            document.getElementById("game").style.display = "none";
            document.getElementById("options").style.display = "none";
            document.getElementById("singleplayer").style.display = "block";
            document.getElementById("multiplayer").style.display = "none";
            Multiplayer.MULTIPLAYER_STATUS = true;
            game_id ? document.getElementById("gameid").textContent = "Game ID :" + game_id : undefined;
            this.updateLobbyPlayers();
        }
        updateLobbyPlayers() {
            const _this = this, socket = io();
            let trying_count = [0];
            Observable.fromSocketIO(socket, document, "player_update").subscribe((res) => _this.updateLobbyTable(res, socket, trying_count));
        }
        startMultiplayerGame() {
            const _this = this;
            SessionData.session_data.gameplay_main ? (SessionData.session_data.gameplay_main(), SessionData.session_data.end_ball_movement(), SessionData.session_data.end_cpu_paddle_movement()) : undefined;
            SessionData.game_data.score_left = 0;
            SessionData.game_data.score_right = 0;
            SessionData.game_data.round_started = false;
            SessionData.game_data.start_direction = 1;
            HTMLPage.clearAllChildren(HTMLPage.svg);
            document.getElementById("game").style.display = "block";
            document.getElementById("start").style.display = "none";
            let pongTable = new PongTable(HTMLPage.svg);
            let socket = io();
            const observableSocket = Observable;
            let o = Observable
                .fromEvent(document, "mousemove")
                .map(({ clientY }) => ({ y: clientY }))
                .map(({ y }) => ({ y: y - HTMLPage.svg.getBoundingClientRect().top }))
                .filter(({ y }) => y <= (Number(HTMLPage.svg.getAttribute("height"))) - Number(SessionData.session_data.current_paddle.attr("height")) - Settings.settings.padding && y >= Settings.settings.padding)
                .map((y) => ({ gameid: this.GAMEID, y: y.y, socket: this.SOCKETID }))
                .subscribe(s => (observableSocket.toSocketIO(socket, 'movement', s)));
            Observable.fromSocketIO(socket, document, "player_movement").subscribe((res) => _this.updatePaddles(res, pongTable));
            o = Observable
                .fromEvent(HTMLPage.svg, "mousemove")
                .map(({ clientX, clientY }) => ({ x: clientX, y: clientY }))
                .subscribe(_ => HTMLPage.svg.style.cursor = "none");
            if (this.SOCKETID === this.USERS[0]) {
                Observable.interval(Settings.settings.game_speed)
                    .map(s => ({
                    gameid: this.GAMEID,
                    x: SessionData.session_data.current_ball.getBall().attr("cx"),
                    y: SessionData.session_data.current_ball.getBall().attr("cy")
                }))
                    .subscribe(s => Observable.toSocketIO(socket, 'ball', s));
            }
            if (this.SOCKETID === this.USERS[1]) {
                Observable.fromSocketIO(socket, document, "ball_move").subscribe((res) => this.ballLocation(res));
            }
            if (this.SOCKETID === this.USERS[1]) {
                Observable.fromSocketIO(socket, document, "update_score").subscribe((res) => this.updateScore(res));
            }
            if (this.SOCKETID === this.USERS[0]) {
                this.host_gameplay();
            }
        }
        ballLocation(data) {
            if (data.gameid == this.GAMEID) {
                SessionData.session_data.current_ball.getBall()
                    .attr("cx", data.x)
                    .attr("cy", data.y);
            }
        }
        updateLobbyTable(res, socket, trying_count) {
            if (res.game_data !== undefined) {
                document.getElementById("gameid").textContent = "Game ID : " + res.game;
                if (res.game == this.GAMEID) {
                    if (res.socket == this.SOCKETID || this.SOCKETID == null || Object.keys((res.game_data)).length === 2) {
                        trying_count[0]++;
                        document.getElementById("player_wait_banner").textContent = "Waiting for players (Session will be terminated in 60 seconds) (" + trying_count + "/60)";
                        if (trying_count[0] > 60) {
                            trying_count[0] = 0;
                            document.getElementById("player_wait_banner").textContent = "";
                            Observable.toSocketIO(socket, "stop_searching_for_players", this.GAMEID);
                            this.GAMEID = null;
                            this.SOCKETID = null;
                            Observable.toSocketIO(socket, "detach", this.GAMEID);
                            const refresh = () => { window.location.reload(); };
                            setTimeout(refresh, 1);
                            alert("Timed Out. Please try again.");
                        }
                        if (Object.keys(res.game_data).length <= 2) {
                            let table_div = document.getElementById("player_table");
                            table_div.removeChild(table_div.childNodes[0]);
                            let table = document.createElement("table"), tr = document.createElement("tr"), td_0 = document.createElement("td"), td_1 = document.createElement("td"), td_2 = document.createElement("td"), text_0 = document.createTextNode("Player Side"), text_1 = document.createTextNode("Socket ID"), text_2 = document.createTextNode("Ready");
                            td_0.appendChild(text_0);
                            td_1.appendChild(text_1);
                            td_2.appendChild(text_2);
                            tr.appendChild(td_0);
                            tr.appendChild(td_1);
                            tr.appendChild(td_2);
                            table.appendChild(tr);
                            let count = 0;
                            let _this = this;
                            Object.keys(res.game_data).forEach(function (key) {
                                if (_this.USERS[0] != key)
                                    _this.USERS.push(key);
                            });
                            for (let i = 0; i <= 1; i++) {
                                let tr = document.createElement("tr"), td_0 = document.createElement("td"), td_1 = document.createElement("td"), td_2 = document.createElement("td"), text_1 = undefined, tick = undefined, side = document.createTextNode((count === 0) ? "Left Side" : "Right Side");
                                if (this.USERS[i] !== undefined) {
                                    text_1 = document.createTextNode(this.USERS[i]);
                                    tick = document.createElement("img");
                                    tick.setAttribute("src", "img/tick.png");
                                }
                                else {
                                    text_1 = document.createTextNode("Waiting......");
                                    tick = document.createElement("img");
                                }
                                tick.setAttribute("height", "80px");
                                tick.setAttribute("weight", "1000px");
                                td_0.appendChild(side);
                                td_1.appendChild(text_1);
                                td_2.appendChild(tick);
                                tr.appendChild(td_0);
                                tr.appendChild(td_1);
                                tr.appendChild(td_2);
                                table.appendChild(tr);
                                count++;
                            }
                            table_div.appendChild(table);
                            if ((Object.keys(res.game_data).length === 2)) {
                                document.getElementById("loader").style.display = "none";
                                document.getElementById("player_wait_banner").style.display = "block";
                                document.getElementById("player_wait_banner").textContent = "Both Players Connected. To Start the Game, the Host has to click on the table.";
                                document.getElementById("player_turn").textContent = "Left is Serving";
                                this.startMultiplayerGame();
                                if (!socket.sentMydata) {
                                    Observable.toSocketIO(socket, "stop_searching_for_players");
                                    socket.sentMydata = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        updatePaddles(res, pongTable) {
            let left_paddle = SessionData.session_data.current_paddle;
            let right_paddle = SessionData.session_data.opponent_paddle;
            pongTable.paddle_movement(left_paddle)(res[this.GAMEID][this.USERS[0]]);
            pongTable.paddle_movement(right_paddle)(res[this.GAMEID][this.USERS[1]]);
        }
        updatePlayerHost(res, allocated) {
            if (res.code == 200) {
                if (this.GAMEID == undefined || this.GAMEID == res.gameid) {
                    allocated[0] = true;
                    this.GAMEID = res.gameid;
                    this.SOCKETID = res.socket_id;
                    document.getElementById("gameid").textContent = "Game ID : " + res.gameid;
                    document.getElementById("player_wait_banner").style.display = "block";
                }
            }
            else if (res.code == 404) {
                if (allocated[0] == false) {
                    Multiplayer.switchToSP();
                    alert(res.message);
                }
            }
        }
        updatePlayerClient(res) {
            if (res.code === 200) {
                if (this.GAMEID == undefined || this.GAMEID == res.gameid) {
                    this.GAMEID = res.gameid;
                    this.SOCKETID = res.socket_id;
                    this.createLobby(res.gameid);
                    document.getElementById("gameid").textContent = "Game ID : " + res.gameid;
                }
            }
            else {
                alert(res.message);
            }
        }
    }
    Multiplayer.MULTIPLAYER_STATUS = false;
    Multiplayer.switchToSP = () => {
        const socket = io();
        Observable.toSocketIO(socket, "detach", "check");
        const refresh = () => { window.location.reload(); };
        setTimeout(refresh, 500);
    };
    const main = () => {
        let game = new Gameplay(), html = new HTMLPage(game), multiplayer = new Multiplayer(html);
    };
    main();
}
if (typeof window != 'undefined')
    window.onload = () => {
        pong();
    };
//# sourceMappingURL=pong.js.map