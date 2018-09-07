// FIT2102 2018 Assignment 1
// https://docs.google.com/document/d/1woMAgJVf1oL3M49Q8N3E1ykTuTu5_r28_MQPVS5QIVo/edit?usp=sharing


function pong() {
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in pong.html, animate them, and make them interactive.
  // Study and complete the tasks in basicexamples.ts first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.

/**
 * This class is used to generate the pong table on the svg canvas
 */
class PongTable {

  private paddle:Elem|null = null;                  // Varibale to store the refernce to a paddle

  /**
   * Initializes the class and sets the default player side on the table and intialize the 
   * ping pong ball
   * @param svg svg elemnt where the pong table should be drawn
   */
  constructor(svg:HTMLElement)
  {
    // Initalize the pong table
    this.initalizeTable(svg)
    // Set the defalut player side
    this.setDefaultPlayerSide()
    // Creates a new Ball and sets it inside the session data
    SessionData.session_data.current_ball! =  new Ball()
    
  }

  /**
   * This function initializes the palyer paddle using the setttings defined by the player or by default
   */
  setDefaultPlayerSide = ():void => {
    // Check if the player side is left 
    Settings.settings.player_side === "left"? 
        // If the player side is left then make the current paddle left and opponenet paddle right
        (SessionData.session_data.current_paddle! = this.createPaddle(Settings.settings.paddle_height,"left"),
        SessionData.session_data.opponent_paddle! = this.createPaddle(Settings.settings.paddle_height,"right") )
        :
        // If the player side is right then make the current paddle right and opponenet paddle left
        (SessionData.session_data.current_paddle! = this.createPaddle(Settings.settings.paddle_height,"right"),
        SessionData.session_data.opponent_paddle! = this.createPaddle(Settings.settings.paddle_height,"left") )
  }

  /**
   * This function is used to create the paddles on the pong table
   * @param height the height of the new paddle
   * @param side the side of the new paddle on the pong table
   */
  createPaddle(height:number,side:string):Elem{
    if (side == "left"){
      // If the side is left create a left paddle
      return this.paddle = new Elem(HTMLPage.svg, 'rect')
      .attr("id","paddle_left")
      .attr('width', 5)
      .attr('height', Number(height))
      .attr('x', Number(HTMLPage.svg.getAttribute("x")!) +  40 )
      .attr('y', Number(HTMLPage.svg.getAttribute("height"))/2 + Number(HTMLPage.svg.getAttribute("t"))/2)
      .attr('fill', '#FFF')
    }
    else
    {
      // If the paddle is right create a right paddle
    return this.paddle = new Elem(HTMLPage.svg, 'rect')
      .attr("id","paddle_right")
      .attr('width', 5)
      .attr('height', Number(height))
      .attr('x', Number(HTMLPage.svg.getAttribute("x")!) + Number(HTMLPage.svg.getAttribute("width")) - 40 ) 
      .attr('y', Number(HTMLPage.svg.getAttribute("height"))/2 + Number(HTMLPage.svg.getAttribute("t"))/2)
      .attr('fill', '#FFF')
    }

  }

  /**
   * Accessor for the paddle
   */
  getPaddle():Elem{
    return this.paddle!
  }

  /**
   * This curried function is used to update the paddles given the new y coordinates and the paddle, since the paddle only moves up and down
   */
  paddle_movement = (paddle:Elem)=>(y_cord:string):void => {
    paddle.attr("y",y_cord)
  }

  /**
   * This function is used to update the current position of the paddle using the mouse move given the reference to the paddle
   */
  move_paddle = (paddle:Elem) => {
        // Creating an observable from the mouse move
        const 
          o = Observable
                .fromEvent<MouseEvent>(HTMLPage.svg, "mousemove")
                .map(({clientX, clientY})=>({x: clientX, y: clientY}));

        // Creating an observable from the mouse move event and uses the clientY cordinate to update the paddle movement
        o.map(({x,y}) => `${y}`)
          .map(y=>(Number(y) - Number(HTMLPage.svg.style.paddingTop) -HTMLPage.svg.getBoundingClientRect().top) - Number(paddle.attr("height"))/2 )
          .filter((y) => y <= (Number(HTMLPage.svg.getAttribute("height"))) - Number(paddle.attr("height")) - Settings.settings.padding && y >= Settings.settings.padding)
          .subscribe(y => this.paddle_movement(paddle)(y.toString()));

        // Using the observable from the mouse move event to hide the cursour when the move is over the svg to give the illution of the user controling the paddle
        o.subscribe(_=>HTMLPage.svg.style.cursor = "none")

  }

  /**
   * This method is used to initialize a table with the dassh lines and the score in the svg canvas
   */
  initalizeTable = (svg:HTMLElement) => {

    /**
     * Function used to initialize the dashes in the pong table
     */
    const dash =(y:number)=> new Elem(svg, 'rect')
              .attr('width', 5)
              .attr('height', 10)
              .attr('x', Number(svg.getAttribute("width"))/2 - 2.5)   
              .attr('y', Number(y))
              .attr('fill', '#FFF'),
  
          /**
           * Function used to combine multiple dashes using recursion to create the dashed line
           */
          dashed_line = (gap:number)=>{
            const dashed_line_aux = (y_value:number):number|undefined=> {
              return (Settings.settings.padding > y_value)? 0 : (dash(y_value),dashed_line_aux(y_value-gap))
            }
            dashed_line_aux(Number(svg.getAttribute("y"))! + Number(svg.getAttribute("height")) - gap - Settings.settings.padding )
          },  
          /**
           * Function used to create the letters for score
           */
          score = () => {new Elem(svg,"text")
              .attr("x",Number(svg.getAttribute("width"))/4)
              .attr("y",Number(svg.getAttribute("height"))*2/8)
              .attr("font-size",100)
              .attr("fill","white")
              .attr("id","score1")
              .attr("font-family","Impact"),
              document.getElementById("score1")!.textContent = SessionData.game_data.score_right.toString(),
              new Elem(svg,"text")
              .attr("x",Number(svg.getAttribute("width"))*3/4)
              .attr("y",Number(svg.getAttribute("height"))*2/8)
              .attr("font-size",100)
              .attr("fill","white")
              .attr("id","score2")
              .attr("font-family","Impact"),
              document.getElementById("score2")!.textContent = SessionData.game_data.score_left.toString()
  
            }

          // Initializing the table lines 
          dashed_line(Settings.settings.dash_gap)
          // Initialize the scores on the table
          score()
  
  }



}


/**
 * This class is used to create the svg ball element that is being used through out the game
 */
class Ball {

    private ball:Elem;              // Variable to store a reference to the ball

    /**
     * Constructor to initialize the ball and assign it to the private varaibles
     */
    constructor(){
        this.ball = new Elem(HTMLPage.svg, 'circle')
        .attr("id","ball")
        .attr('cx', Number(HTMLPage.svg.getAttribute("width"))/2)
        .attr('cy', Number(HTMLPage.svg.getAttribute("height"))/2)
        .attr('r', 8)
        .attr('fill', '#FFF')
    }

    /**
     * Accessor for the private ball attribute
     */
    getBall():Elem{
      // Return the private ball attribute
      return this.ball
    }
   
    /**
     * Function that creates the trejactory of the ball upon collisons with the paddles, sides and out of bounds
     */
    ball_movement = (ball_starting_direction:number) => {

        // Accelaration factor or gradient of the curve
        // eg : gradients = [0, -1 , 1 , -1.5 , 1.5] 
        const gradients = [0,-Settings.settings.ball_speed,Settings.settings.ball_speed,-Settings.settings.ball_speed-0.5,Settings.settings.ball_speed+0.5]

        // Starting gradient factor for the ball and the start direction of the ball
        let x_change = gradients[2]*ball_starting_direction
        // Starting y accelaration for the ball using a random value between the gradients [0,-1,1] ( if the ball speed is 1)
        let y_change = Math.floor((Math.random() * 3))
        
        // Defining the varibales to hold the unsubscribe functions of the observables
        let normal:()=>void = ()=>null,                         // Unsubscribe for the normal ball movement
        bottomSide:()=>void = ()=>null,                         // Unsubscribe for the ball colliding with the bottom side
        topSide:()=>void = ()=>null,                            // Unsubscribe for the ball colliding with the top side
        currentPaddleTop:()=>void = ()=>null,                   // Unsubscribe for ball colliding with the top of the user's paddle
        currentPaddleTopMiddle:()=>void = ()=>null,             // Unsubscribe for ball colliding with the top middle of the user's paddle
        currentPaddleMiddle:()=>void = ()=>null,                // Unsubscribe for ball colliding with the middle of the user's paddle
        currentPaddleBottomMiddle:()=>void = ()=>null,          // Unsubscribe for ball colliding with the bottom middle of the user's paddle
        currentPaddleBottom:()=>void = ()=>null,                // Unsubscribe for ball colliding with the bottom of the user's paddle
        opponentPaddleTop:()=>void = ()=>null,                  // Unsubscribe for ball colliding with the top of the opponent's paddle
        opponentPaddleTopMiddle:()=>void = ()=>null,            // Unsubscribe for ball colliding with the top middle of the opponent's paddle
        opponentPaddleMiddle:()=>void = ()=>null,               // Unsubscribe for ball colliding with the middle of the opponent's paddle
        opponentPaddleBottomMiddle:()=>void = ()=>null,         // Unsubscribe for ball colliding with the bottom middle of the opponent's paddle
        opponentPaddleBottom:()=>void = ()=>null                // Unsubscribe for ball colliding with the bottom of the opponent's paddle

        // Getting a reference to an Observable which maps the cx and cy values of the ball
        const observableFromBall = Observable.interval(Settings.settings.game_speed).map(s=>({x:this.ball.attr('cx'),y:this.ball.attr('cy') }))

        // Getting a reference to an Observable which maps the cx and cy values of the ball which filters the values that collide with the user paddle
        // Instead of using if else I have used a chain of fliters to filter out whether the ball is colliding with the users paddle
        const observableFromBallAfterCollisionCurrentPaddle = Observable.interval(Settings.settings.game_speed).map(_=>({x:this.ball.attr('cx'),y:this.ball.attr('cy') }))
              .filter(({x,y}) => Number(x) - Number(this.ball.attr("r")) < Number(SessionData.session_data.current_paddle!.attr("x"))+ Number(SessionData.session_data.current_paddle!.attr("width")))
              .filter(({x,y}) => Number(x) + Number(this.ball.attr("r")) >Number(SessionData.session_data.current_paddle!.attr("x"))-Number(SessionData.session_data.current_paddle!.attr("width")))
              .filter(({x,y}) => Number(y) + Number(this.ball.attr("r")) > Number(SessionData.session_data.current_paddle!.attr("y")) )
              .filter(({x,y}) => Number(y) < Number(SessionData.session_data.current_paddle!.attr("y"))+Number(SessionData.session_data.current_paddle!.attr("height")) + Number(this.ball.attr("r")))
        // Getting a reference to an Observable which maps the cx and cy values of the ball which filters the values that collide with the opponent paddle
        // Instead of using if else I have used a chain of fliters to filter out whether the ball is colliding with the opponents paddle
        const observableFromBallAfterCollisionOpponentPaddle = Observable.interval(Settings.settings.game_speed).map(s=>({x:this.ball.attr('cx'),y:this.ball.attr('cy') }))
              .filter(({x,y}) => Number(x) - Number(this.ball.attr("r")) < Number(SessionData.session_data.opponent_paddle!.attr("x"))+ Number(SessionData.session_data.opponent_paddle!.attr("width")))
              .filter(({x,y}) => Number(x) + Number(this.ball.attr("r")) >Number(SessionData.session_data.opponent_paddle!.attr("x"))-Number(SessionData.session_data.opponent_paddle!.attr("width")))
              .filter(({x,y}) => Number(y) + Number(this.ball.attr("r")) > Number(SessionData.session_data.opponent_paddle!.attr("y")) )
              .filter(({x,y}) => Number(y) < Number(SessionData.session_data.opponent_paddle!.attr("y"))+Number(SessionData.session_data.opponent_paddle!.attr("height")) + Number(this.ball.attr("r")))
        
          // Increasing the ball increment to move the ball
          normal = Observable.interval(Settings.settings.game_speed)
              .map(s=>({x:this.ball.attr('cx'),y:this.ball.attr('cy') }))
              .map(({x,y})=>({x:x_change+Number(x) ,y:y_change+Number(y) }))
              .subscribe(({x,y})=>(
                this.ball.attr('cx', x),
                this.ball.attr('cy', y))
          );

          // If the ball collide with the bottom edge of the svg, it will turn the ball around
          bottomSide = observableFromBall
              .filter(({y}) => (Number(y)>Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.ball.attr("r"))))
              .map((_) => (
                (GameSound.game_sound.collision.play(),
                // Negating the y change value
                y_change = (-y_change))))
              .subscribe((_)=>(
                this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
                this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change))
          );

          // If the ball collide with the top edge of the svg, it will turn the ball around
          topSide = observableFromBall
              .filter(({y}) => Number(y)<Settings.settings.padding+Number(this.ball.attr("r")))
              .map((_) => (
                (GameSound.game_sound.collision.play(),
                // Negating the y change value
                y_change = (-y_change))))
              .subscribe((_)=>(
                this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
                this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change))
          );

          // If the ball collides with the paddle then check whether it collides with the top 5% of the paddle
          currentPaddleTop = observableFromBallAfterCollisionCurrentPaddle
              .filter(({y}) => 
              Number(y) <=  Number(SessionData.session_data.current_paddle!.attr("y")) + Number(SessionData.session_data.current_paddle!.attr("height"))*0.05   )
              .map((_) => (
                GameSound.game_sound.collision.play(),
                x_change = (-x_change*gradients[4]),
                y_change = gradients[3]
              ))
              .subscribe((_)=>(
                this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
                this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change))
          );

          // If the ball collides with the paddle then check whether it collides with the top 40% of the paddle
          // Using a chain of filters we assigned above to check whether the ball is colliding with the paddle, we filter out the exact point of collison on the ball
          currentPaddleTopMiddle = observableFromBallAfterCollisionCurrentPaddle
          .filter(({y}) => (Number(y) >  Number(SessionData.session_data.current_paddle!.attr("y")) + Number(SessionData.session_data.current_paddle!.attr("height"))*0.05))
          .filter(({y}) => (Number(y) <  Number(SessionData.session_data.current_paddle!.attr("y")) + Number(SessionData.session_data.current_paddle!.attr("height"))/2  -  Number(SessionData.session_data.current_paddle!.attr("height"))*0.05))
          .map((_) => (
            GameSound.game_sound.collision.play(),
            x_change = (-x_change),
            y_change = gradients[1]
          ))
          .subscribe((_)=>(
            this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
            this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)))

          // If the ball collides with the paddle then check whether it collides with the middle 10% of the paddle
          // Using a chain of filters we assigned above to check whether the ball is colliding with the paddle, we filter out the exact point of collison on the ball
          currentPaddleMiddle = observableFromBallAfterCollisionCurrentPaddle
          .filter(({y}) => (Number(y) >=  Number(SessionData.session_data.current_paddle!.attr("y")) + Number(SessionData.session_data.current_paddle!.attr("height"))/2  -  Number(SessionData.session_data.current_paddle!.attr("height"))*0.05))
          .filter(({y}) => (Number(y) <=  Number(SessionData.session_data.current_paddle!.attr("y")) + Number(SessionData.session_data.current_paddle!.attr("height"))/2  +  Number(SessionData.session_data.current_paddle!.attr("height"))*0.05))
          .map((_) => (
            GameSound.game_sound.collision.play(),
            x_change = (-x_change),
            y_change = gradients[Math.floor((Math.random() * 3))]
          ))
          .subscribe((_)=>(
            this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
            this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)))

          // If the ball collides with the paddle then check whether it collides with the bottom 40% of the paddle
          // Using a chain of filters we assigned above to check whether the ball is colliding with the paddle, we filter out the exact point of collison on the ball
          currentPaddleBottomMiddle = observableFromBallAfterCollisionCurrentPaddle
          .filter(({y}) => (Number(y) >  Number(SessionData.session_data.current_paddle!.attr("y")) + Number(SessionData.session_data.current_paddle!.attr("height"))/2  +  Number(SessionData.session_data.current_paddle!.attr("height"))*0.05))
          .filter(({y}) => (Number(y) <  Number(SessionData.session_data.current_paddle!.attr("y")) + Number(SessionData.session_data.current_paddle!.attr("height"))  -  Number(SessionData.session_data.current_paddle!.attr("height"))*0.05))
          .map((_) => (
            GameSound.game_sound.collision.play(),
            x_change = (-x_change),
            y_change = gradients[2]
          ))
          .subscribe((_)=>(
            this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
            this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)))

          // If the ball collides with the paddle then check whether it collides with the bottom 5% of the paddle
          // Using a chain of filters we assigned above to check whether the ball is colliding with the paddle, we filter out the exact point of collison on the ball
          currentPaddleBottom = observableFromBallAfterCollisionCurrentPaddle
          .filter(({y}) => (Number(y) >=  Number(SessionData.session_data.current_paddle!.attr("y")) + Number(SessionData.session_data.current_paddle!.attr("height"))  -  Number(SessionData.session_data.current_paddle!.attr("height"))*0.05))
          .map((_) => (
            GameSound.game_sound.collision.play(),
            x_change = (-x_change*gradients[4]),
            y_change = gradients[4]
          ))
          .subscribe((_)=>(
            this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
            this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)))


          // If the ball collides with the paddle then check whether it collides with the top 5% of the paddle
          // Using a chain of filters we assigned above to check whether the ball is colliding with the paddle, we filter out the exact point of collison on the ball
          opponentPaddleTop = observableFromBallAfterCollisionOpponentPaddle
              .filter(({y}) => Number(y) <=  Number(SessionData.session_data.opponent_paddle!.attr("y")) + Number(SessionData.session_data.opponent_paddle!.attr("height"))*0.05)
              .map((_) => (
                GameSound.game_sound.collision.play(),
                x_change = (-x_change*gradients[4]),
                y_change = gradients[3]
              ))
              .subscribe((_)=>(
                this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
                this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change))
          );

          // If the ball collides with the paddle then check whether it collides with the top 40% of the paddle
          // Using a chain of filters we assigned above to check whether the ball is colliding with the paddle, we filter out the exact point of collison on the ball
          opponentPaddleTopMiddle = observableFromBallAfterCollisionOpponentPaddle
          .filter(({y}) => (Number(y) >  Number(SessionData.session_data.opponent_paddle!.attr("y")) + Number(SessionData.session_data.opponent_paddle!.attr("height"))*0.05))
          .filter(({y}) => (Number(y) <  Number(SessionData.session_data.opponent_paddle!.attr("y")) + Number(SessionData.session_data.opponent_paddle!.attr("height"))/2  -  Number(SessionData.session_data.opponent_paddle!.attr("height"))*0.05))
          .map((_) => (
            GameSound.game_sound.collision.play(),
            x_change = (-x_change),
            y_change = gradients[1]
          ))
          .subscribe((_)=>(
            this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
            this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)))

          // If the ball collides with the paddle then check whether it collides with the middle 10% of the paddle
          // Using a chain of filters we assigned above to check whether the ball is colliding with the paddle, we filter out the exact point of collison on the ball
          opponentPaddleMiddle = observableFromBallAfterCollisionOpponentPaddle
          .filter(({y}) => (Number(y) >=  Number(SessionData.session_data.opponent_paddle!.attr("y")) + Number(SessionData.session_data.opponent_paddle!.attr("height"))/2  -  Number(SessionData.session_data.opponent_paddle!.attr("height"))*0.05))
          .filter(({y}) => (Number(y) <=  Number(SessionData.session_data.opponent_paddle!.attr("y")) + Number(SessionData.session_data.opponent_paddle!.attr("height"))/2  +  Number(SessionData.session_data.opponent_paddle!.attr("height"))*0.05))
          .map((_) => (
            GameSound.game_sound.collision.play(),
            x_change = (-x_change),
            y_change = gradients[Math.floor((Math.random() * 3))]
          ))
          .subscribe((_)=>(
            this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
            this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)))

          // If the ball collides with the paddle then check whether it collides with the bottom 40% of the paddle
          // Using a chain of filters we assigned above to check whether the ball is colliding with the paddle, we filter out the exact point of collison on the ball
          opponentPaddleBottomMiddle = observableFromBallAfterCollisionOpponentPaddle
          .filter(({y}) => (Number(y) >  Number(SessionData.session_data.opponent_paddle!.attr("y")) + Number(SessionData.session_data.opponent_paddle!.attr("height"))/2  +  Number(SessionData.session_data.opponent_paddle!.attr("height"))*0.05))
          .filter(({y}) => (Number(y) <  Number(SessionData.session_data.opponent_paddle!.attr("y")) + Number(SessionData.session_data.opponent_paddle!.attr("height"))  -  Number(SessionData.session_data.opponent_paddle!.attr("height"))*0.05))
          .map((_) => (
            GameSound.game_sound.collision.play(),
            x_change = (-x_change),
            y_change = gradients[2]
          ))
          .subscribe((_)=>(
            this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
            this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)))

        // If the ball collides with the paddle then check whether it collides with the bottom 5% of the paddle
        // Using a chain of filters we assigned above to check whether the ball is colliding with the paddle, we filter out the exact point of collison on the ball
        opponentPaddleBottom = observableFromBallAfterCollisionOpponentPaddle
          .filter(({x,y}) => 
          (Number(y) >=  Number(SessionData.session_data.opponent_paddle!.attr("y")) + Number(SessionData.session_data.opponent_paddle!.attr("height"))  -  Number(SessionData.session_data.opponent_paddle!.attr("height"))*0.05))
          .map((_) => (
            GameSound.game_sound.collision.play(),
            x_change = (-x_change*gradients[4]),
            y_change = gradients[4]
          ))
          .subscribe((_)=>(
            this.ball.attr('cx', Number(this.ball.attr('cx')) + x_change ),
            this.ball.attr('cy', Number(this.ball.attr('cy')) + y_change)))

          // Return all the unsubscribe methods of all the observables related to ball movements
          return () => (
            normal(),
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
            opponentPaddleBottom()
          )



        }

    
}

/**
 * This class is used to create the AI Paddle and manipulate it
 */
class CPUPaddleMovement{
  private paddle:Elem|null;

  // Passing in the reference to the left or right paddle to be controlled
  constructor(paddle:Elem){
      // Assigning the passed in paddle to the private paddle attribute
      this.paddle = paddle
  }
  
  /**
   * The function is used to calculate the CPU paddle movement
   */
  private cpu_paddle_movement = ():()=> void => {
    // Updating the paddle increament speed as the same as the ball speed so that by defalut it is able to keep up
    // with the ball. Unless the user hits the top or bottom 5%, then there is a possibility not to hit the center,
    // since it is updating slower than the ball
    const paddle_increment = Settings.settings.ball_speed

    // Defining the varibales to hold the unsubscribe functions of the observables
    let moveUp:()=>void = ()=>null        // Unsubscribe for the paddle up movement
    let moveDown:()=>void = ()=>null      // Unsubscribe for the paddle down movement
    let stay:()=>void = ()=>null          // Unsubscribe for paddle to not move

    
            // Observable to update the AI Paddle, to move down if the ball location is below than the paddle center   
            //  Using observables and function channing to get AI Paddle move on the ball movement
            moveDown = Observable.interval(Settings.settings.game_speed)
                    .map(_=>({x:SessionData.session_data.current_ball!.getBall().attr('cy') }))
                    .filter(({x}) => Number(this.paddle!.attr("y")) + Number(this.paddle!.attr("height"))/2 < Number(x))
                    .filter((_) => !(Number(this.paddle!.attr("y")) + Number(this.paddle!.attr("height")) > Settings.settings.table_height-Settings.settings.padding))
                    .map((_)=>( {y : Number(this.paddle!.attr("y")) + paddle_increment }) )
                    .subscribe(({y})=>(
                      this.paddle!.attr("y",y.toString())))
                  
            // Observable to update the AI Paddle, to move up if the ball location is above than the paddle center  
            // Using observables and function channing to get AI Paddle move on the ball movement 
            moveUp = Observable.interval(Settings.settings.game_speed)
                    .map(_=>({x:SessionData.session_data.current_ball!.getBall().attr('cy') }))
                    .filter(({x}) => Number(this.paddle!.attr("y")) + Number(this.paddle!.attr("height"))/2 > Number(x))
                    .filter((_) => !(Number(this.paddle!.attr("y")) < Settings.settings.padding))
                    .map((_)=>( {y : Number(this.paddle!.attr("y")) - paddle_increment }))
                    .subscribe(({y})=>(
                      this.paddle!.attr("y",y.toString())))
                  
            // Observable to update the AI Paddle, to move up if the ball location is the same as the paddle center  
            //  Using observables and function channing to get AI Paddle move on the ball movement
            stay = Observable.interval(Settings.settings.game_speed)
                    .map(_=>({x:SessionData.session_data.current_ball!.getBall().attr('cy') }))
                    .filter(({x}) => Number(this.paddle!.attr("y")) + Number(this.paddle!.attr("height"))/2 === Number(x))
                    .map((_)=>( {y : Number(this.paddle!.attr("y"))}))
                    .subscribe(({y})=>(
                      this.paddle!.attr("y",y.toString())))
                  
          // Returning a function with all the unsubscribe function to stop the paddle movement
          return () => (moveUp(),moveDown(),stay())
    }

    /**
     * Accessor for the cpu paddle movement function
     */
    getCPUPaddleMovement(){
      // Returning the cpu paddle movement function, which is the unsubscribe funtion for the cpu paddle movement observable
      return this.cpu_paddle_movement
    }
}


/**
 * This class is used to intialize the gameplay and control the flow of the game
 */
class Gameplay {

  private htmlPage:HTMLPage|undefined;               // This variable is used to store a reference to the html page, it can be either of type HTMLPage or undefined
  private session_data:any;                          // This variable is used to store a refernce to the session_data
  private game_data:any;                             // This variable is used to store a reference to the game data

  // Contructor to initialize the gameplay class
  constructor(){
    // Initializing the gameplay attribute to undefined
    this.htmlPage = undefined
    // Initializng the session_data to to the reference of the Static Class Attribute
    this.session_data = SessionData.session_data
    // Initializng the game_data to the reference of the Static Class Attribute
    this.game_data = SessionData.game_data
  }

  /**
   * This method is used to start a round of game play. (i.e round is from one point to another)
   */
  private startRound(){
    // Setting the flag to true to indicate that a round has started
    this.game_data.round_started = true
    // Passing in the initial start_direction for each round for the ball and starting the ball movement observable and 
    // and get the reference to the unsubscribe function and store it in the session data
    this.session_data.end_ball_movement= this.session_data.current_ball.ball_movement(this.game_data.start_direction)
    // Creating a new CPUPaddleMovement class to initilize the AI Paddle
    let cpu = new CPUPaddleMovement(this.session_data.opponent_paddle!)
    // Calling the getCPUPaddleMovement method in the gameplay class to start moving the paddle and get the reference to
    // the unsubscribe function and store it in the session data
    this.session_data.end_cpu_paddle_movement = cpu.getCPUPaddleMovement()()

  }
  /**
   * Mutator for setting the html page
   * @param html the reference to the html page
   */
  setHTMLPage = (html:HTMLPage) => {
    // Setting the passed in html reference as the attribute of the class
    this.htmlPage = html
  }

  /**
   * Method that contain the gameplay logic 
   */
  gameplay = () =>{
    // Using the mouse up event to start an observable
    const 
    mouseup = Observable.fromEvent<MouseEvent>(HTMLPage.svg, 'mouseup')
    // Check if the Multiplayer game is running
    .filter(_=>!Multiplayer.MULTIPLAYER_STATUS)
    // Check if the previous round has ended
    .filter((_=>!this.game_data.round_started))
    // If all the above conditions past then, start the round
    .subscribe(_=>this.startRound())

    // Defining the varibales to hold the unsubscribe functions of the observables
    let scoreLeft:()=>void = ()=>null
    let scoreRight:()=>void = ()=>null
    let gameWin:()=>void = ()=>null


     // Creating an observable that fires every game (Userdefined framerate) milliseconds
    scoreLeft = Observable.interval(Settings.settings.game_speed)
    // Using the current ball reference stored in the class attribute, we get the x axis values for the ball
    .map(_=>({x:this.session_data.current_ball!.getBall().attr('cx')}))
    .filter(({x}) => (Number(x) > (Number(HTMLPage.svg.getAttribute("x"))+Number(this.session_data.current_ball!.getBall().attr("r")) + Number(HTMLPage.svg.getAttribute("width") ))))
    // Calling the subscribe function to check whether the ball is in bounds are if not calculating the points
    .subscribe(
      ({x})=>
        (
              //  Play the sound for the ball going out of bounds 
                GameSound.game_sound.fail.play(),
                // Increase the score of the left side player by one
                this.game_data.score_left +=1,
                // Update the GUI score
                document.getElementById("score1")!.textContent = (this.game_data.score_left).toString(),
                // End the ball movement observable
                this.session_data.end_ball_movement(),
                // End the AI Paddle movement
                this.session_data.end_cpu_paddle_movement(),
                // Generating the random value to be used as the starting position for the next round
                this.session_data.current_ball!.getBall()
                  .attr("cy",Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.session_data.current_ball!.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding + Number(this.session_data.current_ball!.getBall().attr("r"))))
                  .attr("cx",Number(HTMLPage.svg.getAttribute("width"))/2),
                // Setting the flag to start the next round as false
                this.game_data.round_started = false,
                // Changing the direction of the ball so that it moves towards the left player
                this.game_data.start_direction = 1,
                // Update the GUI Element to indicate which side is serving
                this.htmlPage!.getGameBanner().textContent = "Left is Serving"

        )
      )

     // Creating an observable that fires every game (Userdefined framerate) milliseconds
     scoreRight = Observable.interval(Settings.settings.game_speed)
     // Using the current ball reference stored in the class attribute, we get the x axis values for the ball
     .map(s=>({x:this.session_data.current_ball!.getBall().attr('cx')}))
     .filter(({x}) => (Number(x) < (Number(HTMLPage.svg.getAttribute("x"))-Number(this.session_data.current_ball!.getBall().attr("r")))))
     // Calling the subscribe function to check whether the ball is in bounds are if not calculating the points
     .subscribe(
       ({x})=>
         (
                 // Play the sound for the ball going out of bounds 
                 GameSound.game_sound.fail.play(),
                 // Increase the score of the right side player by one
                 this.game_data.score_right+=1,
                 // Update the GUI score
                 document.getElementById("score2")!.textContent = (this.game_data.score_right).toString(),
                 // End the ball movement observable
                 this.session_data.end_ball_movement(),
                 // End the AI Paddle movement
                 this.session_data.end_cpu_paddle_movement(),
                 // Generating the random value to be used as the starting position for the next round
                 this.session_data.current_ball!.getBall()
                   .attr("cy",Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.session_data.current_ball!.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding + Number(this.session_data.current_ball!.getBall().attr("r"))))
                   .attr("cx",Number(HTMLPage.svg.getAttribute("width"))/2),
                 // Setting the flag to start the next round as false
                 this.game_data.round_started = false,
                 // Changing the direction of the ball so that it moves towards the right player
                 this.game_data.start_direction = -1,
                 // Update the GUI Element to indicate which side is serving
                 this.htmlPage!.getGameBanner().textContent = "Right is Serving"
 
         )
       )

      // Creating an observable that fires every game (Userdefined framerate) milliseconds
     gameWin = Observable.interval(Settings.settings.game_speed)
     // Using the current ball reference stored in the class attribute, we get the x axis values for the ball
     .map(s=>({x:this.session_data.current_ball!.getBall().attr('cx')}))
     .filter(({x}) => (this.game_data.score_left >= Settings.settings.game_point || this.game_data.score_right >= Settings.settings.game_point))
     // Calling the subscribe function to check whether the ball is in bounds are if not calculating the points
     .subscribe(
       ({x})=>
         (
                  // Calling the unsubscribe function for the main gameplay
                  this.session_data.gameplay_main(),
                  // Ending the mouse up observable so that it wont start a new game
                  mouseup(),
                  // Calling the unsubscribe function to end the ball movement
                  this.session_data.end_ball_movement(),
                  // Calling the unsubscribe function to end the cpu paddle movement
                  this.session_data.end_cpu_paddle_movement(),
                  // Setting the radius of the ball to 0 to hide the ball
                  this.session_data.current_ball!.getBall().attr("r",0),
                  // Updating the GUI to ask the user to play again
                  this.htmlPage!.getPlayerTurn().textContent = "Wanna play again?",
                  // Check which player won and update the GUI accordingly 
                  this.game_data.score_left>this.game_data.score_right?this.htmlPage!.getGameBanner().textContent = "Left Won the Game":this.htmlPage!.getGameBanner().textContent = "Right Won the Game",
                  // Update the GUI button to display paly again
                  document.getElementById("start")!.textContent = "Play Again",
                  // Set the flag to true to stop the game from starting
                  this.game_data.round_started = true
 
         )
       )

      // Setting the unsubscribe funtion to stop the score board
      this.session_data.gameplay_main = () => (scoreLeft(),scoreRight(),gameWin())


  }

}
/**
 * The class used to store the data needed for the HTML Page
 */
class HTMLPage {

  private game_banner = document.getElementById("game_state_banner")!       // Setting the reference to the game_state_banner html element
  private player_turn = document.getElementById("player_turn")!             // Setting the reference to the player_turn html element
  private start_button = document.getElementById("start")!                  // Setting the reference to the start html element
  static svg:HTMLElement = document.getElementById("canvas")!;              // Setting the static reference to the canvas html element
  private gamePlay:Gameplay;                                                // Storing a reference to the gameplay class that run the game

  /**
   * Constructor to initialize the class
   * @param gameplay Reference to the gameplay 
   */
  constructor(gameplay:Gameplay){
    // Setting the gameplay parameter as the private attribute
    this.gamePlay = gameplay
    // Setting passing the reference to the itself as the parameter for the Gameplay class
    this.gamePlay.setHTMLPage(this)

    // Getting reference to the start button and storing it in a private attribute of the class
    this.start_button = document.getElementById("start")!
    // Getting reference to the game_start element and storing it in a private attribute of the class
    this.game_banner = document.getElementById("game_state_banner")!
    // Getting reference to the player turn element and storing it in a private attribute of the class
    this.player_turn = document.getElementById("player_turn")!
    // Setting the style of the button as block
    this.start_button.style.display = "block"
    // Running the init function of the class to initalize all the values to default
    this.init()

    // Setting the onclick of the start button
    document.getElementById("start")!.onclick = this.start_game
    // Setting the onclick of the update button
    document.getElementById("update")!.onclick = this.update
    // Setting the onclick of the ultiplayer switchToSP button
    document.getElementById("singleplayer_button")!.onclick = Multiplayer.switchToSP
    // Load all the audio files needed for the game
    this.loadSound()

    

  }

  /**
   * This function is used to intilize the defalut values of the options table to the defalut values of the game
   */
  init = ():void => {

    // Checking the correct radio button
    Settings.settings.player_side === "left"?(<HTMLInputElement>document.getElementById("left_side"))!.checked = true: (<HTMLInputElement>document.getElementById("right_side"))!.checked = true,
    // Assigning the default values for the options text boxes
    (<HTMLInputElement>document.getElementById("theight"))!.value = Settings.settings.table_height.toString(),
    (<HTMLInputElement>document.getElementById("twidth"))!.value = Settings.settings.table_width.toString(),
    (<HTMLInputElement>document.getElementById("ball_speed"))!.value = Settings.settings.ball_speed.toString(),
    (<HTMLInputElement>document.getElementById("frame_rate"))!.value = Settings.settings.game_speed.toString(),
    (<HTMLInputElement>document.getElementById("game_point"))!.value = Settings.settings.game_point.toString(),
    (<HTMLInputElement>document.getElementById("paddle_height"))!.value = Settings.settings.paddle_height.toString(),
    (<HTMLInputElement>document.getElementById("dash_gap"))!.value = Settings.settings.dash_gap.toString(),
    (<HTMLInputElement>document.getElementById("padding"))!.value = Settings.settings.padding.toString()

  }

  /**
   * Staic class used to delete all the elements in the svg element(i.e canvas)
   * @param svg Reference to the svg element
   */
  static clearAllChildren = (svg:HTMLElement):void => {
    // Count of all the child svg elemnents
    let count = svg.childElementCount!
    // Loop through all the items to delete them one by one
    while (count>0){
      svg.removeChild(svg.firstChild!)
      count--
    }
  }

  /**
   * This function is used to validate the input entered by the user
   */
  validateInput = () => {

    // Creating a response object
    let res : {
      code : Number,
      message: String
    }={
      code : 200,
      message : "Undefined"
    }

    // Getting in all the input variables
    let inputs : {
      tableHeight : Number,
      tableWidth : Number,
      ballSpeed: Number,
      frameRate: Number,
      gamePoint: Number,
      paddleHeight: Number,
      dashGap : Number,
      padding: Number
    }={
      tableHeight : Number((<HTMLInputElement>document.getElementById("theight"))!.value),
      tableWidth : Number((<HTMLInputElement>document.getElementById("twidth"))!.value),
      ballSpeed: Number((<HTMLInputElement>document.getElementById("ball_speed"))!.value),
      frameRate: Number((<HTMLInputElement>document.getElementById("frame_rate"))!.value),
      gamePoint: Number((<HTMLInputElement>document.getElementById("game_point"))!.value),
      paddleHeight: Number((<HTMLInputElement>document.getElementById("paddle_height"))!.value),
      dashGap : Number((<HTMLInputElement>document.getElementById("dash_gap"))!.value),
      padding: Number((<HTMLInputElement>document.getElementById("padding"))!.value)
    };
  

    // Checking all the inputs are in the correct range
    (inputs.tableHeight >= 300 && inputs.tableHeight <= 1000)? (res.code == 200)?(res.code = 200,res.message = "Succesful"):undefined:(res.code = 404, res.message = "Table Height not in range (300 - 1000)");
    (inputs.tableWidth >= 300 && inputs.tableWidth <= 1000)? (res.code == 200)?(res.code = 200,res.message = "Succesful"):undefined:(res.code = 404, res.message = "Table Width not in range (300 - 1000)");
    (inputs.ballSpeed >= 0.1 && inputs.ballSpeed <= 5)? (res.code == 200)?(res.code = 200,res.message = "Succesful"):undefined:(res.code = 404, res.message = "Difficulty not in range (0.1 - 5)");
    (inputs.frameRate >= 1 && inputs.frameRate <= 10)? (res.code == 200)?(res.code = 200,res.message = "Succesful"):undefined:(res.code = 404, res.message = "Frame Rate not in range (1 - 10)");
    (inputs.gamePoint >= 2 && inputs.gamePoint <= 42)? (res.code == 200)?(res.code = 200,res.message = "Succesful"):undefined:(res.code = 404, res.message = "Game Point not in range (2 - 42)");
    (inputs.paddleHeight >= Number(inputs.tableHeight)*0.1 && inputs.paddleHeight <= Number(inputs.tableHeight)*0.5)? (res.code == 200)?(res.code = 200,res.message = "Succesful"):undefined:(res.code = 404, res.message = "Paddle Height not in range (10% of Table Height - 80% of Table Height) ");
    (inputs.dashGap >= 10 && inputs.dashGap <= 40)? (res.code == 200)?(res.code = 200,res.message = "Succesful"):undefined:(res.code = 404, res.message = "Dash Gap not in range (10-40)");
    (inputs.padding >= 30 && inputs.padding <= 100)?(res.code == 200)?(res.code = 200,res.message = "Succesful"):undefined:(res.code = 404, res.message = "Padding not in range (30 - 100)");

    // Return the result
    return res
  
  }

  /**
   * Function used to update the settings in the game
   */
  update = ():void => {
    // Getting a reference to the svg 
    let svg = document.getElementById("canvas")!
    
    // Function to update the game and restart it 
    const updategame = () => {
      let pongTable = new PongTable(HTMLPage.svg)
      pongTable.move_paddle(SessionData.session_data.current_paddle!)
    }

    // Validate the User Input
    let response = this.validateInput();

    // If the validation is not correct then throw an alert with the error message
    (response.code === 404)?alert(response.message):
    (
    //  Prompting the user to confirm to update the settings
    confirm("THE GAME IS STILL IN BETA. If you wish to update the settings, do at your own RISK. The game may crash on some combinations. If it crashes you will have to reload the page.  Do you wish to continue? ")?
    (
    // Retriving the data from the options table and setting them as the data for the static class
    (<HTMLInputElement>document.getElementById("left_side"))!.checked?
    Settings.settings.player_side ="left":Settings.settings.player_side ="right",
    Settings.settings.table_height = Number((<HTMLInputElement>document.getElementById("theight"))!.value),
    Settings.settings.table_width = Number((<HTMLInputElement>document.getElementById("twidth"))!.value),
    Settings.settings.ball_speed = Number((<HTMLInputElement>document.getElementById("ball_speed"))!.value),
    Settings.settings.game_speed = Number((<HTMLInputElement>document.getElementById("frame_rate"))!.value),
    Settings.settings.game_point = Number((<HTMLInputElement>document.getElementById("game_point"))!.value),
    Settings.settings.paddle_height = Number((<HTMLInputElement>document.getElementById("paddle_height"))!.value),
    Settings.settings.dash_gap = Number((<HTMLInputElement>document.getElementById("dash_gap"))!.value),
    Settings.settings.padding = Number((<HTMLInputElement>document.getElementById("padding"))!.value),
    
    // Clearing all the values from the svg 
    HTMLPage.clearAllChildren(svg),
    
    // Updating the height of the canvas
    document.getElementById("canvas")!.setAttribute("height", Settings.settings.table_height.toString()),
    // Updating the width of the canvas
    document.getElementById("canvas")!.setAttribute("width",Settings.settings.table_width.toString()),
    // Updating the whole game accrodingly
    updategame())
    :
    // If user says no, then rivert all the changes back
    this.init()

    )

  }

  /**
   * Function used to start the game
   */
  start_game = ():void => {

    // Check if the gameplay_main observable is defined
    SessionData.session_data.gameplay_main?
    // If yes then unsubscribe current instances of the gamplay_main, AI movement and ball movement
    (SessionData.session_data.gameplay_main(),SessionData.session_data.end_ball_movement(),SessionData.session_data.end_cpu_paddle_movement())
    :
    // Else undefined
    undefined

    // Setting the game data to the defalut values
    SessionData.game_data.score_left = 0
    SessionData.game_data.score_right = 0
    SessionData.game_data.round_started = false
    SessionData.game_data.start_direction = 1

    // Clear all the children elements of the svg
    HTMLPage.clearAllChildren(HTMLPage.svg)

    // Initializing the pong table
    let pongTable = new PongTable(HTMLPage.svg)
    // Start moving the user paddle
    pongTable.move_paddle(SessionData.session_data.current_paddle!)
    // Starting the game play
    this.gamePlay.gameplay()

    // Update the GUI to display that the game has started
    this.player_turn.textContent = "Game Started"
    this.game_banner.textContent = "Left is Serving"
    // Update the Start button to display the restart game
    document.getElementById("start")!.textContent = "Restart Game"
    
  }
  /**
   * Function used to load the sounds into the game
   */
  loadSound = ():void => {
    // Check if the sound is not already loaded
    if (GameSound.game_sound.collision.src !== undefined || GameSound.game_sound.fail.src !== undefined ){
      // If not loaded, then update the src values of the audio elements
      GameSound.game_sound.collision!.src = "sound/knock.wav"
      GameSound.game_sound.fail!.src = "sound/fail.wav"
    }
  }

  /**
   * Accesor for the game_banner element
   */
  getGameBanner = ():HTMLElement => {
    // Returns the reference to the HTML game banner element
    return this.game_banner
  }
  getPlayerTurn = ():HTMLElement => {
    // Returns the reference to the HTML player turn elemnent
    return this.player_turn
}

}

/**
 * Static Class to maintain all the data that is needed through out the game.
 * These two items are used to maintain the flow of the game
 */
class SessionData {

  // Stores the svg element data per session and the data for ending the relavant observables
  static session_data : {
    current_paddle :Elem | undefined,               // Stores a reference to the left paddle
    opponent_paddle :Elem | undefined,              // Stores a reference to the reight paddle
    current_ball : Ball | undefined,                // Stores a reference to the current ball
    gameplay_main:()=>void ,                        // Stores a reference to the unsubscribe method of the game_play observable
    end_cpu_paddle_movement:()=>void ,              // Stores a reference to the unsubscribe method of the AI Paddle observable
    end_ball_movement:()=>void                      // Stores a reference to the unsubscribe method of the ball observable

  } = {
    // Assigning default values to initialize the variables
    current_paddle :undefined,                      // Setting the default value for current_paddle as undefined
    opponent_paddle :undefined,                     // Setting the default value for opponent_paddle as undefined
    current_ball : undefined ,                      // Setting the default value for current_ball as undefined
    gameplay_main:() => null,                       // Setting the default value for gameplay_main as a function that returns null
    end_cpu_paddle_movement:() => null,             // Setting the default value for end_cpu_paddle_movement as a function that returns null
    end_ball_movement:() => null                    // Setting the default value for end_ball_movement as a function that returns null
  }

  // Stores the game data per session
  static game_data = {
    "score_left":0,                                 // Initializing the score left as 0  
    "score_right":0,                                // Initializing the score right as 0  
    "round_started":false,                          // Initializing the round started as false  
    "start_direction":1                             // Initializing the start direction as so that left will be serving always  
  }

  // Empty Constructor
  constructor() {}

}

/**
 * Static Class to store the user entered settings to be used in the game.
 * They are set to default values
 */
class Settings {
  static settings = {
    "table_height":600,                             // Initializing the table height as 600px
    "table_width":600,                              // Initializing the table width as 600px
    "game_speed" :8,                                // Initializing the game speed as 1, this is the rate in which all of the Observable.intervals will fire data 
    "ball_speed" : 2,                               // Initializing the ball_speed as 2, this is number of pixels the ball changes every game_speed milliseconds
    "player_side" : "left",                         // Initializing the player_side as left, so that by defalut the user will be initlized to the left
    "game_point":11,                                // Initializing the game point as 11, this is the point at which the game ends
    "paddle_height":60,                             // Initializing the paddle height to 60px by default
    "dash_gap": 20,                                 // Initializing the dash_gap in the pong table to 20 by default
    "padding" : 50                                  // Initializing the padding around the box(i.e the buffer area for the mouse to move to)
  }
}

/**
 * Static Class to store the refrence to the Game Sound Files
 * These sound files are used for paddle collision and after each round
 */
class GameSound {
  static game_sound = {
    collision:new Audio(),                          // Initialzing the collison audio to new HTMLAudio elements
    fail:new Audio()                                // Initialzing the fail audio to new HTMLAudio elements
  }
}




// ******************************************************************************************************************************************************************************************************  //
// ******************************************************************************************************************************************************************************************************  //
// ******************************************************************************************************************************************************************************************************  //
// ******************************************************************************************************************************************************************************************************  //
// ******************************************************************************************************************************************************************************************************  //
// ******************************************************************************************************************************************************************************************************  //



/**
 * Class that is used to initialize the multiplayer version of the game and start the multiplayer game
 */
class Multiplayer {

  static MULTIPLAYER_STATUS = false;          // Attribute that defines whether the multiplayer game is on or not
                                              // Defined to false by default
  
  private GAMEID:string|null;                 // Private attribute to store the Game ID of the current session
  private SOCKETID:string|null;               // Private attribute to store the Socket ID of the current session
  private USERS:Array<string>                 // Private attribute to store the USERS/Players of the current session
  private html_page:HTMLPage;                 // Private attribute to store the HTML Page of the current session
  
  /**
   * Constructor for Multiplayer Class
   * @param htmlPage Reference to the HTML Page that is used to generate the multiplayer game
   */
  constructor(htmlPage:HTMLPage){
    // Setting the create game button to run the createGame function
    document.getElementById("creategame")!.onclick = this.createGame
    // Setting the join game button to run the joinGame function
    document.getElementById("joingame")!.onclick = this.joinGame

    // Initializing the USERS Array as an empty array
    this.USERS = []
    // Initializing the GAMEID to be null
    this.GAMEID = null
    // Initializing the SOCKETID to be null
    this.SOCKETID = null
    // Initializing the html_page to be the reference to the html passed from the constructor
    this.html_page = htmlPage
  }

  /**
   * Function used to create the lobby
   * @param game_id the game_id of the current game
   */
  private createLobby(game_id = undefined):void {
    // Initializing the UI elements to create the lobby
    document.getElementById("lobby")!.style.display = "block"
    document.getElementById("game")!.style.display = "none"
    document.getElementById("options")!.style.display = "none"
    document.getElementById("singleplayer")!.style.display = "block"
    document.getElementById("multiplayer")!.style.display = "none"

    // Setting the Multiplayer status to be true to signify that the Multiplayer Game has started
    Multiplayer.MULTIPLAYER_STATUS = true
    
    // Changing the GameID to the current GameID of the Session
    game_id?document.getElementById("gameid")!.textContent = "Game ID :" + game_id:undefined
    
    // Calling the update lobby players function to update the players
    this.updateLobbyPlayers()
  }

  /**
   * This method is used to update the lobby players and the lobby player table
   */
  private updateLobbyPlayers():void {    
      
      const _this = this,           // Getting a reference to the current Multiplayer class and storing it as a constant
          socket = io()             // Getting a reference to the SocketIO's io() function
      
      let trying_count:Array<number> = [0]        // Storing the trying count and assigning the count to 0 to keep track of the amount of
                                                  // times the server sent the users
  

      // Getting the users from the server and passing it to the updateLobbyTable function
      Observable.fromSocketIO(socket,document,"player_update").subscribe((res)=>_this.updateLobbyTable(res,socket,trying_count))

      
      
    }

  /**
   * This method is used to start the multiplayer game after getting both users ready
   */
  public startMultiplayerGame():void {

      const _this = this;               // Getting a reference to the current Multiplayer class and storing it as a constant

      // Resetting all the game data
      SessionData.session_data.gameplay_main?(SessionData.session_data.gameplay_main(),SessionData.session_data.end_ball_movement(),SessionData.session_data.end_cpu_paddle_movement()):undefined
      SessionData.game_data.score_left = 0
      SessionData.game_data.score_right = 0
      SessionData.game_data.round_started = false
      SessionData.game_data.start_direction = 1


      // Deleting all the elements on the svg to be redrawn when initialzing the pong table
      HTMLPage.clearAllChildren(HTMLPage.svg)

      // Making the ping pong table svg visible
      document.getElementById("game")!.style.display = "block"
      // Making the start button invisible
      document.getElementById("start")!.style.display = "none"

      // Creating all the elements in the pong table
      let pongTable = new PongTable(HTMLPage.svg);

      // Getting a reference to the socket from the server
      let socket = io()
      // Getting a reference to the Observable Class
      const observableSocket = Observable



      // Sending the paddle movements to the server to be sent back to all the clients
      let o = Observable
      // Getting the mousemove event to an Observerbale
      .fromEvent<MouseEvent>(document, "mousemove")
      // Get the y cordinates from mouse move
      .map(({clientY})=>({y: clientY}))
      // Get the y value from the ClientRect
      .map(({y}) => ({y: y-HTMLPage.svg.getBoundingClientRect().top}))
      // Filter the y values that makes the paddle reach outof bounds
      .filter(({y}) => y <= (Number(HTMLPage.svg.getAttribute("height"))) - Number(SessionData.session_data.current_paddle!.attr("height")) - Settings.settings.padding && y >= Settings.settings.padding)  
      // Create an object with the game and the socket ID
      .map((y)=> ({gameid : this.GAMEID, y:y.y,socket:this.SOCKETID } ))
      // Subscribe to the observable to send the data to the server in order to be sent back to both clients
      .subscribe(s=>(observableSocket.toSocketIO(socket,'movement', s)))
      
  
      // Updating the paddle movements from the users to be displayed in both the client browsers
      Observable.fromSocketIO(socket,document,"player_movement").subscribe((res)=>_this.updatePaddles(res,pongTable))

      // Hiding cursor when over the svg
      o = Observable
          // Getting the mousemove cordinates from the mouse event 
          .fromEvent<MouseEvent>(HTMLPage.svg, "mousemove")
          // Mapping the client X and Client y
          .map(({clientX, clientY})=>({x: clientX, y: clientY}))
          // Subscribe to the mouse event to hide the cursour when over the svg element
          .subscribe(_=>HTMLPage.svg.style.cursor = "none")
      
      // Host sending the cordinates to update the ball
      if (this.SOCKETID === this.USERS[0]){
          // Creating an observable that notifies every given time
          Observable.interval(Settings.settings.game_speed)
          // Creating an object to send the ball coordinates to the server
          .map(s=>({
            gameid:this.GAMEID,
            x:SessionData.session_data.current_ball!.getBall().attr("cx"),
            y:SessionData.session_data.current_ball!.getBall().attr("cy")}))
          // Subscribing to the observable to send the data to the server
          .subscribe(s => Observable.toSocketIO(socket,'ball', s))
        }

      // Client updating the ball
      if (this.SOCKETID === this.USERS[1]){
        // Getting the ball cordinates from the server and passing it to the ballLocation to update the location
        // of the ball
        Observable.fromSocketIO(socket,document,"ball_move").subscribe((res)=>this.ballLocation(res))

      }

      // Client updating the score
      if (this.SOCKETID === this.USERS[1]){
        // Getting the score from the server and passing it to the updateScore to update the game score
        Observable.fromSocketIO(socket,document,"update_score").subscribe((res)=>this.updateScore(res))
      }

      // Host starting the game and sending information to the server
      if (this.SOCKETID === this.USERS[0]){
        // Calling the host gameplay method
        this.host_gameplay()
      }
      
  }

  /**
   * Function to update the ball location 
   * @param data the data from the server to update the ball location
   */
  private ballLocation(data:any) {
    // Check if the data is to the correct GAMEID
    if (data.gameid == this.GAMEID){
      // If so, update the current ball location of the client
      SessionData.session_data.current_ball!.getBall()
            // Update the x axis
            .attr("cx",data.x)
            // Update the y axis
            .attr("cy",data.y)
    }
  }

  /**
   * Function to update the scores and end the client side game
   * @param res response from the server with the updated scores
   */
  private updateScore = (res:any):void => {

    const socket = io()             // Reference to the io() function

    // Check whether the GameID is the current Session Game ID
    if (res.game_id == this.GAMEID) {
      // Play the sound for the ball going out of bounds 
      GameSound.game_sound.fail.play(),
      // Upadting the client left score
      SessionData.game_data.score_left = res.score_1
      // Updating the client right score
      SessionData.game_data.score_right = res.score_2
      // Updating the playerturn banner with the message from the server
      this.html_page.getPlayerTurn().textContent =res.message

      // Updating the left UI score
      document.getElementById("score1")!.textContent = (SessionData.game_data.score_left).toString()
      // Updaing the right UI score
      document.getElementById("score2")!.textContent = (SessionData.game_data.score_right).toString()

      // Checking the response status
      if (res.status == 1){
        // if the response status is 1, the game is over
        // Showing the loader until the server detach from the game
        document.getElementById("loader2")!.style.display = "block"
        // Hiding the switch to single player button until the server detaches
        document.getElementById("singleplayer_button")!.style.display = "none"
        // Printing who won the game
        SessionData.game_data.score_left>SessionData.game_data.score_right?this.html_page.getGameBanner().textContent = "Left Won the Game":this.html_page.getGameBanner().textContent = "Right Won the Game"
        // Setting the round started value to true
        SessionData.game_data.round_started = true
        // Sending the detach request to the server
        Observable.toSocketIO(socket,"detach",this.GAMEID)
        // Create a function to refresh the page
        const refresh = () => {window.location.reload()}
        // Waiting 5 seconds and then refreshing the page
        setTimeout(refresh,5000)

      }
    }
  }

  /**
   * Function running in the host send data to the server
   */
  private host_gameplay = ():void =>{
    const socket = io()             // Reference to the io() function

    // Creating mouse up with a function that returns void
    let mouseup:() => void = () => null
    
    // Assigning a mouseup event to create an observable
    mouseup = Observable.fromEvent<MouseEvent>(HTMLPage.svg, 'mouseup')
        // Checking if the round has not started
        .filter((s=>!SessionData.game_data.round_started))
        // Subscribe to the observable
        .subscribe(s=>(
          // Change the round started to true
          SessionData.game_data.round_started = true,
          // Start the ball movement
          SessionData.session_data.end_ball_movement= SessionData.session_data.current_ball!.ball_movement(SessionData.game_data.start_direction)))

    // Defining the varibales to hold the unsubscribe functions of the observables
    let scoreLeft:()=>void = ()=>null       // Unsubscribe for the left score
    let scoreRight:()=>void = ()=>null      // Unsubscribe for the right score
    let gameWin:()=>void = ()=>null         // Unsubscribe for when the game ends

     // Creating an observable that fires every game (Userdefined framerate) milliseconds
     scoreLeft = Observable.interval(Settings.settings.game_speed)
     // Using the current ball reference stored in the class attribute, we get the x axis values for the ball
     .map(_=>({x:SessionData.session_data.current_ball!.getBall().attr('cx')}))
     .filter(({x}) => (Number(x) < (Number(HTMLPage.svg.getAttribute("x"))-Number(SessionData.session_data.current_ball!.getBall().attr("r")))))
     // Calling the subscribe function to check whether the ball is in bounds are if not calculating the points
     .subscribe(
       (_)=>
         ((
                // Play the sound for the ball going out of bounds 
                GameSound.game_sound.fail.play(),
                // Increase the score of the right side player by one
                SessionData.game_data.score_right+=1,
                // Update the GUI score
                document.getElementById("score2")!.textContent = (SessionData.game_data.score_right).toString(),
                // End the ball movement observable
                SessionData.session_data.end_ball_movement(),
                // Setting the flag to start the next round as false
                SessionData.game_data.round_started = false,
                // Changing the direction of the ball so that it moves towards the left player
                SessionData.game_data.start_direction = -1,
                // Update the GUI Element to indicate which side is serving
                this.html_page.getPlayerTurn().textContent = "Right is Serving",
                // Generating the random value to be used as the starting position for the next round
                SessionData.session_data.current_ball!.getBall()
                .attr("cy",Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(SessionData.session_data.current_ball!.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                .attr("cx",Number(HTMLPage.svg.getAttribute("width"))/2),
                // Creating an object to be sent to the server with all the socre data
                // and Sending the data to the server
                Observable.toSocketIO(socket,"score_update",{
                  "status" : 0,
                  "game_id" : this.GAMEID,
                  "score_1" : SessionData.game_data.score_left,
                  "score_2" : SessionData.game_data.score_right,
                  "message" : "Right is Serving"
                })

 
         ))
       )
 
      // Creating an observable that fires every game (Userdefined framerate) milliseconds
      scoreRight = Observable.interval(Settings.settings.game_speed)
      // Using the current ball reference stored in the class attribute, we get the x axis values for the ball
      .map(_=>({x:SessionData.session_data.current_ball!.getBall().attr('cx')}))
      .filter(({x}) => (Number(x) > (Number(HTMLPage.svg.getAttribute("x"))+Number(SessionData.session_data.current_ball!.getBall().attr("r")) + Number(HTMLPage.svg.getAttribute("width") ))))
      // Calling the subscribe function to check whether the ball is in bounds are if not calculating the points
      .subscribe(
        (_)=>
          (
                  // Play the sound for the ball going out of bounds 
                GameSound.game_sound.fail.play(),
                // Increase the score of the left side player by one
                SessionData.game_data.score_left +=1,
                // Update the GUI score
                document.getElementById("score1")!.textContent = (SessionData.game_data.score_left).toString(),
                // End the ball movement observable
                SessionData.session_data.end_ball_movement(),
                // Setting the flag to start the next round as false
                SessionData.game_data.round_started = false,
                // Changing the direction of the ball so that it moves towards the right player
                SessionData.game_data.start_direction = 1,
                // Update the GUI Element to indicate which side is serving
                this.html_page.getPlayerTurn().textContent = "Left is Serving",
                // Generating the random value to be used as the starting position for the next round
                SessionData.session_data.current_ball!.getBall()
                .attr("cy",Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(SessionData.session_data.current_ball!.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                .attr("cx",Number(HTMLPage.svg.getAttribute("width"))/2),
                // Creating an object to be sent to the server with all the score data and
                // Sending the data to the server
                Observable.toSocketIO(socket,"score_update",{
                  "status" : 0,
                  "game_id" : this.GAMEID,
                  "score_1" : SessionData.game_data.score_left,
                  "score_2" : SessionData.game_data.score_right,
                  "message" : "Left is Serving"
                })
  
          )
        )
 
       // Creating an observable that fires every game (Userdefined framerate) milliseconds
      gameWin = Observable.interval(Settings.settings.game_speed)
      // Using the current ball reference stored in the class attribute, we get the x axis values for the ball
      .map(_=>({x:SessionData.session_data.current_ball!.getBall().attr('cx')}))
      .filter((_) => (SessionData.game_data.score_left >= Settings.settings.game_point || SessionData.game_data.score_right >= Settings.settings.game_point))
      // Calling the subscribe function to check whether the ball is in bounds are if not calculating the points
      .subscribe(
        (_)=>
          (
              // Hiding the single player button
              document.getElementById("singleplayer_button")!.style.display = "none",
              // Showing the loader until the host sends the data to the server
              document.getElementById("loader2")!.style.display = "block",
              // Ending the mouse up observable so that it wont start a new game
              SessionData.session_data.gameplay_main(),
              // Ending the mouse up observable
              mouseup(),
              // Calling the unsubscribe function to end the ball movement
              SessionData.session_data.end_ball_movement(),
               // Setting the radius of the ball to 0 to hide the ball
              SessionData.session_data.current_ball!.getBall().attr("r",0),
              // Updating the GUI to prompt the user to wait
              this.html_page.getPlayerTurn().textContent = "Thank You for Playing Multiplayer Pong. You will be redirected to single player is 5 seconds.",
              // Check which player won and update the GUI accordingly 
              SessionData.game_data.score_left>SessionData.game_data.score_right?this.html_page.getGameBanner().textContent = "Left Won the Game":this.html_page.getGameBanner().textContent = "Right Won the Game",
              // Set the flag to true to stop the game from starting
              SessionData.game_data.round_started = true,
              // Creating an object to be sent to the server with all the score data and 
              // Sending the data to the server
              Observable.toSocketIO(socket,"score_update",{
                "status" : 1,
                "game_id" : this.GAMEID,
                "score_1" : SessionData.game_data.score_left,
                "score_2" : SessionData.game_data.score_right,
                "message" : "Thank You for Playing Multiplayer Pong. You will be redirected to single player is 5 seconds."
              }),

              // Sending the detach signal to the server
              Observable.toSocketIO(socket,"detach",this.GAMEID),

              // Create a function to refresh the page and 
              // Waiting 5 seconds and then refreshing the page
              setTimeout(() => {window.location.reload()},5000)
  
          )
        )
 
        // Unsubscribe function to stop the scoring of the game
        SessionData.session_data.gameplay_main = () => (scoreLeft(),scoreRight(),gameWin())


  }

/**
 * 
 * Function used to update the lobby table 
 * @param res response from the server
 * @param socket socket from which the server sends data
 * @param trying_count trying count for the amount of times the server is sending data
 */
private updateLobbyTable(res:any,socket:any,trying_count:Array<number>) {
  // Check if the game_data is not undefined
  if (res.game_data !== undefined){
    // Updating the GAMEID to the value from the server
    document.getElementById("gameid")!.textContent = "Game ID : "+res.game
    // If the GameID is not equal to the one from the server
    if (res.game == this.GAMEID){
      // And if the Socket is equal to the socket ID or the length of items in the game_data is equal to 2
      if (res.socket == this.SOCKETID || this.SOCKETID == null || Object.keys((res.game_data)).length === 2){
        // Increase the trying count by 1
        trying_count[0]++
        // Upadting the UI to indicate that the server is serching for players
        document.getElementById("player_wait_banner")!.textContent! =  "Waiting for players (Session will be terminated in 60 seconds) (" + trying_count + "/60)"
        // Check if the trying count is less than 60 
        if (trying_count[0]>60){
          // If less tahn 60, set it to 0 again
          trying_count[0] = 0
          // Updating the please wait banner
          document.getElementById("player_wait_banner")!.textContent! =  ""
          // Sending the signal to the server to stop searching for players
          Observable.toSocketIO(socket,"stop_searching_for_players",this.GAMEID)
          
          // Setting the GAMEID as null
          this.GAMEID = null
          // Setting the SOCKETID as null
          this.SOCKETID = null

          // Sending the detach signal to the server
          Observable.toSocketIO(socket,"detach",this.GAMEID)

          // Create a function to refresh the page
          const refresh = () => {window.location.reload()}
            
          // Waiting 5 seconds and then refreshing the page
          setTimeout(refresh,1)

          // Notify the user that the server TIMED OUT
          alert("Timed Out. Please try again.")
        }
        
        // Check if the length of the users in the server response is less than or equal to 2
        if (Object.keys(res.game_data).length <= 2){
            // Getting reference to the player tabe div
            let table_div = document.getElementById("player_table")!;
            // Remove all the nodes from the div
            table_div.removeChild(table_div.childNodes[0])
      
            let table = document.createElement("table"),                // Creating a new table
                tr = document.createElement("tr"),                      // Creating a new table row
                td_0 = document.createElement("td"),                    // Creating a new table data element
                td_1 = document.createElement("td"),                    // Creating a new table data element
                td_2 = document.createElement("td"),                    // Creating a new table data element
                text_0 = document.createTextNode("Player Side"),        // Creating a new textNode and setting the value
                text_1 = document.createTextNode("Socket ID"),          // Creating a new textNode and setting the value
                text_2 = document.createTextNode("Ready")               // Creating a new textNode and setting the value
      
            // Appending the textNodes to the table data elements
            td_0.appendChild(text_0);
            td_1.appendChild(text_1);
            td_2.appendChild(text_2);
      
            // Appending the table data elements to the table rows
            tr.appendChild(td_0);
            tr.appendChild(td_1);
            tr.appendChild(td_2);

            // Appending the table row to the table
            table.appendChild(tr);
      
            // Initialize a count varible to 0
            let count = 0;
      
            // Getting a refrence to the class
            let _this = this

            // Using a for loop push the user data onto the USERS array
            Object.keys(res.game_data).forEach(function(key) {
              // If the users key is not the same as the host key
              if (_this.USERS[0] != key)
                  // Push the key to the users table 
                  _this.USERS.push(key)
            });
            // Using a loop that runs twice, create the users table row elements
            for (let i = 0; i <= 1; i++) {
                // Create a new table row element
                let tr = document.createElement("tr"),
                  // Create table data elements
                  td_0 = document.createElement("td"),
                  td_1 = document.createElement("td"),
                  td_2 = document.createElement("td"),

                  // Create the text element fro the table
                  text_1:Text|undefined = undefined,
                  // Creating an HTMLImage element
                  tick:HTMLImageElement|undefined = undefined,
                  // Checking the correct count and assigning the left and right side accordingly
                  side = document.createTextNode((count === 0)?"Left Side":"Right Side")

                  // Check if the USERS are defined
                  if (this.USERS[i] !== undefined){
                    // If defined just print the socket id
                    text_1 = document.createTextNode(this.USERS[i])
                    // Set the image element
                    tick = document.createElement("img")
                    // Set the source to the tick
                    tick.setAttribute("src","img/tick.png")
                  }else{
                    // Setting the text node as waiting
                    text_1 = document.createTextNode("Waiting......")
                    // Creating an empty image tag
                    tick = document.createElement("img")
                  }
                  
              // Setting the height and width of the image tag
              tick!.setAttribute("height","80px")
              tick!.setAttribute("weight","1000px")
              
              // Appending the text and images to the table data element
              td_0.appendChild(side);
              td_1.appendChild(text_1!);
              td_2.appendChild(tick!);
      
              // Appending the table data to the table row
              tr.appendChild(td_0);
              tr.appendChild(td_1);
              tr.appendChild(td_2);
      
              // Appending the table row to the table
              table.appendChild(tr);
              // Increasing the count by one
              count++
                
            }
            
            // Appending the tabe to the table div
            table_div.appendChild(table)
      
            // Check if the length of the keys two
            if ((Object.keys(res.game_data).length === 2)){
              // If true, hide the loader
              document.getElementById("loader")!.style.display = "none"
              // Display the pleasewait banner
              document.getElementById("player_wait_banner")!.style.display = "block"
              // Display that both players are ready
              document.getElementById("player_wait_banner")!.textContent = "Both Players Connected. To Start the Game, the Host has to click on the table."
               // Display that both players are ready
               document.getElementById("player_turn")!.textContent = "Left is Serving"
              // Start the multiplayer game 
              this.startMultiplayerGame()
            
            // If the socket sent my data is false
            if (!socket.sentMydata) {
              // Send the request to stop asking for the users
              Observable.toSocketIO(socket,"stop_searching_for_players")
              // If sent then stop asking
              socket.sentMydata = true;
            }
          }
            
        }
      }
    }
  }
}

/**
 * Function used to update the paddles of the clients
 * @param res response from the server with the paddl values
 * @param pongTable reference to the pong table
 */
private updatePaddles(res:any,pongTable:PongTable) {
  // Getting reference to the left paddle
  let left_paddle = SessionData.session_data.current_paddle!
  // Getting reference to the right paddle
  let right_paddle = SessionData.session_data.opponent_paddle!

  // Calling the paddle movement function to move the paddle of both the left and right players using the 
  // data from the server
  pongTable.paddle_movement(left_paddle)(res[this.GAMEID!][this.USERS[0]])
  pongTable.paddle_movement(right_paddle)(res[this.GAMEID!][this.USERS[1]])
  
}

/**
 * Function used to update the host data for the game
 * @param res response from the server with the important information for the host
 * @param allocated flag to check whether the data is updated
 */
private updatePlayerHost(res:any,allocated:Array<boolean>) {
  // Check the server response code
  if (res.code == 200){ 
    // Check if the game is undefined or the Game id is equal to the server game id
    if (this.GAMEID == undefined || this.GAMEID == res.gameid){
      // If true, then update the allocated value to true
      allocated[0] = true  
      // Update the game id of the host
      this.GAMEID = res.gameid
      // Update the socketid of the host
      this.SOCKETID = res.socket_id

      // Update the UI to display the Game ID
      document.getElementById("gameid")!.textContent = "Game ID : "+ res.gameid
      document.getElementById("player_wait_banner")!.style.display = "block"    
    }
  // Check if the response code id 404
  }else if (res.code == 404){
    // If the game is not allocated
    if (allocated[0] == false){
      // Switch to Single Player
      Multiplayer.switchToSP()
      // Display alert message
      alert(res.message)
    }
  }
}

/**
 * Function to update the client information
 * @param res the response from the server
 */
private updatePlayerClient(res:any) {
  // Check if the response code is 200
  if (res.code === 200) {
    // Check if the game is undefined or the Game id is equal to the server game id
    if (this.GAMEID == undefined || this.GAMEID == res.gameid){
      // Update the game id of the client
      this.GAMEID = res.gameid
      // Update the socket id of the client
      this.SOCKETID = res.socket_id
      // Create the lobby of the client
      this.createLobby(res.gameid)
      // Updating the Game ID of the client 
      document.getElementById("gameid")!.textContent = "Game ID : "+res.gameid
    }
  }else{
    // Dispaly message from server
    alert(res.message)
  }

}

/**
 * Static class to switch from single player to multiplayer
 */
static switchToSP = () => {
      const socket = io()             // Reference to the io() function

      // Send the request to detach
      Observable.toSocketIO(socket,"detach","check")

      // Creating a function to reload the page
      const refresh = () => {window.location.reload()}
      // Wait for 500 miliseconds before running the function to send the deatch request
      setTimeout(refresh,500) 
}

/**
 * Method to create the multiplayer game
 */
createGame= () => {
  /**
   * Method to generate the GameID
   */
  const generateGameId = () => {
    const socket = io(),            // Reference to the io() function
          _this=this                // Reference to the Multiplayer Class

    // Opbservable to create a new game
    Observable.toSocketIO(socket,"new_game")

    // Create an array with boolean values
    let allocated:Array<boolean> = []
    // Initializng the first value to false
    allocated[0] = false
    // Getting the game_id from the server
    Observable.fromSocketIO(socket,document,"game_id").subscribe((res)=>(_this.updatePlayerHost(res,allocated)))

  }

  // Execute the function and create the lobby
  this.createLobby()
  // Generate the game Id for the session
  generateGameId()


}

/**
 * Method to join the multiplayer game
 */
joinGame = () => {
    // Get the game id from the user entered value
    let game_id = (<HTMLInputElement>document.getElementById("join_game_id")!).value
    // If the game id is empty
    if (game_id == "") {
      // Alert the user whether they entered the correct id
      alert("Did you enter a Game ID?")
      // Switch to single player
      Multiplayer.switchToSP()

    }else{

      const socket = io(),        // Reference to the io() function
          _this = this            // Reference to the Multiplayer Class

      // Sending a request to join the game with the game id
      Observable.toSocketIO(socket,"join_game",game_id.toString())
      // Getting the data needed from the server to update the client
      Observable.fromSocketIO(socket,document,"join").subscribe((res)=>(_this.updatePlayerClient(res)))

    }  
}

}

/**
 * Main function to run the game
 */
const main = ():void => {
  let game = new Gameplay(),                // Creating a new Gameplay instance
      html = new HTMLPage(game),            // Passing in the Gameplay class to create a new HTMLPage
      multiplayer = new Multiplayer(html);  // Creating a new Multiplayer class using the HTMLPage
}


// Calling the main function when the page runs the pong() function
main()


}

// Declaring io since socket io is a external libarary
declare let io: any
// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    pong();
  }