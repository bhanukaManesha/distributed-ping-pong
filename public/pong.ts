// FIT2102 2018 Assignment 1
// https://docs.google.com/document/d/1woMAgJVf1oL3M49Q8N3E1ykTuTu5_r28_MQPVS5QIVo/edit?usp=sharing

function pong() {
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in pong.html, animate them, and make them interactive.
  // Study and complete the tasks in basicexamples.ts first to get ideas.

  // You will be marked on your npfunctional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.


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
    "game_speed" : 1,                               // Initializing the game speed as 1, this is the rate in which all of the Observable.intervals will fire data 
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

        /**
         * Function used to get the ball direction if the trajectory is blocked by a paddle, if there is not collison ot will just keep on moving in the same gradients
         */
        const getBallDirection = (x_cord:string,y_cord:string,paddle:Elem) : {x:string,y:string}=>{

            /**
             * Function used to calculate whether there is a collision with the paddle
             */
            const paddle_collison = ():boolean=>{

                                // If the ball center + radius is inside the limits of a paddle, then it is considered to be a paddle collision
                                return (Number(x_cord) - Number(this.ball.attr("r")) < Number(paddle.attr("x"))+ Number(paddle.attr("width"))
                                && Number(x_cord) + Number(this.ball.attr("r")) >Number(paddle.attr("x"))-Number(paddle.attr("width"))
                                && Number(y_cord) + Number(this.ball.attr("r")) > Number(paddle.attr("y")) 
                                && Number(y_cord) < Number(paddle.attr("y"))+Number(paddle.attr("height")) + Number(this.ball.attr("r")))
            }
            /**
             * This fucntion is used if there is a paddle collision, to calculate where the ball is colliding with the paddle and to take the appropirate direction change accordingly
             */
            const direction_change = ():{x:string,y:string}=>{
                              // If there is a paddle collision to play the collision sound
                              GameSound.game_sound.collision.play()
                              // Check whether the collision is in the bottom 45% of the paddle
                              if (Number(y_cord)>  Number(paddle.attr("y")) + (Number(paddle.attr("height"))/2 + (Number(paddle.attr("height"))/2)*0.05)   ){
                                // Check whether the collision is in the bottom 5% of the paddle
                                if (Number(y_cord)>  Number(paddle.attr("y")) + (Number(paddle.attr("height"))/2 + Number(paddle.attr("height"))*0.45)   ){   
                                  // If it is in the bottom 5% then increase the ball speed by 0.5
                                  return (x_change = (-x_change*gradients[4]),y_change = gradients[4],{x:x_cord,y:y_cord})
                                }else{
                                  // If it is in the bottom 40% from the center then increase then jusr change the direction of the ball
                                  return (x_change = (-x_change),y_change = gradients[2],{x:x_cord,y:y_cord})
                                }
                              // Check whether the collision is in the top 45% of the paddle
                              } else if (Number(y_cord)<Number(paddle.attr("y")) + (Number(paddle.attr("height"))/2 - (Number(paddle.attr("height"))/2)*0.05) ){
                                // Check whether the collision is in the top 5% of the paddle
                                if (Number(y_cord)<Number(paddle.attr("y")) + (Number(paddle.attr("height"))/2 - Number(paddle.attr("height"))*0.45) ) {
                                  // If it is in the bottom 5% then increase the ball speed by 0.5
                                  return (x_change = (-x_change*gradients[4]),y_change = gradients[3],{x:x_cord,y:y_cord})
                                }else{
                                  // If it is in the top 40% from the center then increase then jusr change the direction of the ball
                                  return (x_change = (-x_change),y_change = gradients[1],{x:x_cord,y:y_cord})
                                }
                              }else{
                                // If it is in the middle 10% of the paddle get a random y change (eg.0,1,-1) to randomize the game
                                return (x_change = (-x_change),y_change = gradients[Math.floor((Math.random() * 3))],{x:x_cord,y:y_cord})
                              }
            }
            // Check whether there's paddle collison if so return the changed direction cordinates or just return the coordinates
          return paddle_collison() ? 
                (direction_change())
                :
                  {x:x_cord,y:y_cord}
          }
        // Ball movement is based on a Observable sending data every millisecond decided by the user
        return Observable.interval(Settings.settings.game_speed)
        .map(s=>(
          {x:this.ball.attr('cx'),y:this.ball.attr('cy') }))
        // Check if the ball is colliding with the left paddle
        .map(
            ({x,y})=> getBallDirection(x,y,SessionData.session_data.current_paddle!))
        // Check if the ball is colliding with the right paddle 
        .map(
            ({x,y})=> getBallDirection(x,y,SessionData.session_data.opponent_paddle!))
        // Calculating the bottom side to change the direction of the ball
        .map(
            ({x,y})=> Number(y)>Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.ball.attr("r")) ? 
                // Play game sound for collision
                (GameSound.game_sound.collision.play(),
                // Negating the y change value
                y_change = (-y_change),
                  {x:x,y:y}
                )
                :
                (y_change = y_change,
                  {x:x,y:y}
                ))
        // Calculating the top side to change the direction of the ball
        .map(
            ({x,y})=> Number(y)<Settings.settings.padding+Number(this.ball.attr("r")) ? 
                // Play game sound for collision
                (GameSound.game_sound.collision.play(),
                // Negating the y change value
                y_change = (-y_change),
                  {x:x,y:y}
                )
                :
                (y_change = y_change,
                  {x:x,y:y}
                ))      
        // Adding the current change to the new change 
        .map(({x,y})=>(
          {x:x_change+Number(x) ,y:y_change+Number(y) }))

        // Subscribing to chnage the ball x attribute and y attribute
        .subscribe(({x,y})=>(
          this.ball.attr('cx', x),
          this.ball.attr('cy', y))
      );
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
    const paddle_increment = Settings.settings.ball_speed,

    /**
     * Function used to increament the paddle according to the ball movement
     */
    increment = (y:number) =>
    {
      // Check If the center of the paddle is less than the center of the ball
      if (Number(this.paddle!.attr("y")) + Number(this.paddle!.attr("height"))/2 <y){
        // if the center of the paddle is less than the center of the ball then increase the 
        // paddle y value inorder for the paddle to go down
        return Number(this.paddle!.attr("y")) + paddle_increment 
      // Check If the center of the paddle is greater than the center of the ball
      }else if (Number(this.paddle!.attr("y")) + Number(this.paddle!.attr("height"))/2 >y){
        // if the center of the paddle is greater than the center of the ball then decrease the 
        // paddle y value inorder for the paddle to go up
        return Number(this.paddle!.attr("y")) - paddle_increment
      }else{
        // If the paddle center is equal to the ball center, then the paddle attribute is not changed
        return Number(this.paddle!.attr("y")) 
      }
    }
  
    // Using an observable to update the AI every (decided by the user) milliseconds
    return Observable.interval(Settings.settings.game_speed)
          // Getting the y axis of the ball and mapping it to an object {y}
          .map(s=>(
            {y:SessionData.session_data.current_ball!.getBall().attr('cy') }))
          // Filtering the values that are greater than the limits of the canvas area in order to prevent the AI from 
          // going out of bounds
          .filter((y) => !(Number(y) <= (Number(HTMLPage.svg.getAttribute("height"))) - (Number(this.paddle!.attr("height"))/2) - Settings.settings.padding) && !(Number(y) >= Settings.settings.padding))  
          // Getting the paddle increment to change the location of the paddle
          .map(({y})=>(
            {y:increment(Number(y))}))
          // Changing the y axis of the paddle
          .subscribe(({y})=>(
            this.paddle!.attr("y",y.toString())))

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
    .filter(s=>!Multiplayer.MULTIPLAYER_STATUS)
    // Check if the previous round has ended
    .filter((s=>!this.game_data.round_started))
    // If all the above conditions past then, start the round
    .subscribe(s=>this.startRound())

    // Creating an observable that fires every game (Userdefined framerate) milliseconds
    this.session_data.gameplay_main = Observable.interval(Settings.settings.game_speed)
    // Using the current ball reference stored in the class attribute, we get the x axis values for the ball
    .map(s=>({x:this.session_data.current_ball!.getBall().attr('cx')}))
    // Calling the subscribe function to check whether the ball is in bounds are if not calculating the points
    .subscribe(
      ({x})=>{
        // Checking if the x value of the ball is less than the left bound
        if (Number(x) < (Number(HTMLPage.svg.getAttribute("x"))-Number(this.session_data.current_ball!.getBall().attr("r")))) {
                // Play the sound for the ball going out of bounds 
                GameSound.game_sound.fail.play()
                // Increase the score of the right side player by one
                this.game_data.score_right+=1
                // Update the GUI score
                document.getElementById("score2")!.textContent = (this.game_data.score_right).toString()
                // End the ball movement observable
                this.session_data.end_ball_movement()
                // End the AI Paddle movement
                this.session_data.end_cpu_paddle_movement()
                // Generating the random value to be used as the starting position for the next round
                this.session_data.current_ball!.getBall()
                  .attr("cy",Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.session_data.current_ball!.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                  .attr("cx",Number(HTMLPage.svg.getAttribute("width"))/2)
                // Setting the flag to start the next round as false
                this.game_data.round_started = false
                // Changing the direction of the ball so that it moves towards the left player
                this.game_data.start_direction = -1
                // Update the GUI Element to indicate which side is serving
                this.htmlPage!.getGameBanner().textContent = "Right is Serving"

        }else if (Number(x) > (Number(HTMLPage.svg.getAttribute("x"))+Number(this.session_data.current_ball!.getBall().attr("r")) + Number(HTMLPage.svg.getAttribute("width") ))){
                // Play the sound for the ball going out of bounds 
                GameSound.game_sound.fail.play()
                // Increase the score of the left side player by one
                this.game_data.score_left +=1
                // Update the GUI score
                document.getElementById("score1")!.textContent = (this.game_data.score_left).toString()
                // End the ball movement observable
                this.session_data.end_ball_movement()
                // End the AI Paddle movement
                this.session_data.end_cpu_paddle_movement()
                // Generating the random value to be used as the starting position for the next round
                this.session_data.current_ball!.getBall()
                  .attr("cy",Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(this.session_data.current_ball!.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                  .attr("cx",Number(HTMLPage.svg.getAttribute("width"))/2)
                // Setting the flag to start the next round as false
                this.game_data.round_started = false
                // Changing the direction of the ball so that it moves towards the right player
                this.game_data.start_direction = 1
                // Update the GUI Element to indicate which side is serving
                this.htmlPage!.getGameBanner().textContent = "Left is Serving"
      }
      // Checking after increasing score whether any player has reached the game point
      if (this.game_data.score_left >= Settings.settings.game_point || this.game_data.score_right >= Settings.settings.game_point){
        // Calling the unsubscribe function for the main gameplay
        this.session_data.gameplay_main()
        // Ending the mouse up observable so that it wont start a new game
        mouseup()
        // Calling the unsubscribe function to end the ball movement
        this.session_data.end_ball_movement()
        // Calling the unsubscribe function to end the cpu paddle movement
        this.session_data.end_cpu_paddle_movement()
        // Setting the radius of the ball to 0 to hide the ball
        this.session_data.current_ball!.getBall().attr("r",0)
        // Updating the GUI to ask the user to play again
        this.htmlPage!.getPlayerTurn().textContent = "Wanna play again?"
        // Check which player won and update the GUI accordingly 
        this.game_data.score_left>this.game_data.score_right?this.htmlPage!.getGameBanner().textContent = "Left Won the Game":this.htmlPage!.getGameBanner().textContent = "Right Won the Game"
        // Update the GUI button to display paly again
        document.getElementById("start")!.textContent = "Play Again"
        // Set the flag to true to stop the game from starting
        this.game_data.round_started = true
      }
      
      })

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
   * Function used to update the settings in the game
   */
  update = ():void => {
    // Getting a reference to the svg 
    let svg = document.getElementById("canvas")!,
    
    // Function to update the game and restart it 
    const updategame = () => {
      let pongTable = new PongTable(HTMLPage.svg)
      pongTable.move_paddle(SessionData.session_data.current_paddle!)
    }

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
    undefined

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




// ******************************************************************************************************************************************************************************************************  //
// ******************************************************************************************************************************************************************************************************  //
// ******************************************************************************************************************************************************************************************************  //






class Multiplayer {

  static MULTIPLAYER_STATUS = false;

  private GAMEID:string|null;
  private SOCKETID:string|null;

  private USERS:Array<string>

  private html_page:HTMLPage;
  
  constructor(htmlPage:HTMLPage){
    // this.STATUS = false
    document.getElementById("creategame")!.onclick = this.createGame
    document.getElementById("joingame")!.onclick = this.joinGame

    this.USERS = []
    this.GAMEID = null
    this.SOCKETID = null
    this.html_page = htmlPage
  }

  private createLobby(game_id = undefined) {
    document.getElementById("lobby")!.style.display = "block"
    document.getElementById("game")!.style.display = "none"
    document.getElementById("options")!.style.display = "none"
    document.getElementById("singleplayer")!.style.display = "block"
    document.getElementById("multiplayer")!.style.display = "none"

    Multiplayer.MULTIPLAYER_STATUS = true
    
    game_id?document.getElementById("gameid")!.textContent = "Game ID :" + game_id:undefined
    
    this.updateLobbyPlayers()
  }

  private updateLobbyPlayers() {    
      // document.getElementById("gameid")!.textContent = "Game ID : "+res.gameid
      const _this = this,
          socket = io()
      
      let trying_count = [0]
  
      Observable.fromSocketIO(socket,document,"player_update").subscribe((res)=>_this.updateLobbyTable(res,socket,trying_count))
      // socket.on('player_update',function(res:any){
      //   _this.updateLobbyTable(res,socket,trying_count)
      // });

      
      
    }

  startMultiplayerGame() {

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
      document.getElementById("start")!.style.display = "none"

      // Creating all the elements in the pong table
      let pongTable = new PongTable(HTMLPage.svg);


      // Getting a reference to the socket from the server
      let socket = io()
      const observableSocket = Observable



      // Sending the paddle movements to the server to be sent back to all the clients
      let o = Observable
      .fromEvent<MouseEvent>(document, "mousemove")
      .map(({clientY})=>({y: clientY}))
      .map(({y}) => ({y: y-HTMLPage.svg.getBoundingClientRect().top}))
      .filter(({y}) => y <= (Number(HTMLPage.svg.getAttribute("height"))) - Number(SessionData.session_data.current_paddle!.attr("height")) - Settings.settings.padding && y >= Settings.settings.padding)  
      .map((y)=> ({gameid : this.GAMEID, y:y.y,socket:this.SOCKETID } ))
      .subscribe(s=>(observableSocket.toSocketIO(socket,'movement', s)))
      // .subscribe(s=>(socket.emit('movement', s)))
      
      // Updating the paddle movements from the users to be displayed
      const _this = this;

      Observable.fromSocketIO(socket,document,"player_movement").subscribe((res)=>_this.updatePaddles(res,pongTable))
      // socket.on('player_movement',function(res:any){
      //   _this.updatePaddles(res,pongTable)}
      // );


      // Hiding cursor when over the svg
      o = Observable
          .fromEvent<MouseEvent>(HTMLPage.svg, "mousemove")
          .map(({clientX, clientY})=>({x: clientX, y: clientY}))
          .subscribe(_=>HTMLPage.svg.style.cursor = "none")
      
       console.log(this.USERS)
      // Host sending the cordinates to update the ball
      if (this.SOCKETID === this.USERS[0]){
          Observable.interval(Settings.settings.game_speed)
          .map(s=>({
            gameid:this.GAMEID,
            x:SessionData.session_data.current_ball!.getBall().attr("cx"),
            y:SessionData.session_data.current_ball!.getBall().attr("cy")}))
          .subscribe(s => Observable.toSocketIO(socket,'ball', s))
          // .subscribe(s => socket.emit('ball', {gameid:this.GAMEID,x:SessionData.session_data.current_ball!.getBall().attr("cx"),y:SessionData.session_data.current_ball!.getBall().attr("cy"), player_one:this.USERS[0], socket: this.SOCKETID}))
        }

      // Client updating the ball
      if (this.SOCKETID === this.USERS[1]){
        Observable.fromSocketIO(socket,document,"ball_move").subscribe((res)=>this.ballLocation(res))
        // socket.on('ball_move',(res:any) =>this.ballLocation(res));

      }

      if (this.SOCKETID === this.USERS[1]){
        Observable.fromSocketIO(socket,document,"update_score").subscribe((res)=>this.updateScore(res))
        // socket.on('update_score', this.updateScore)
      }

      // SessionData.session_data.end_ball_movement= Ball.ball_movement(SessionData.game_data.start_direction)
      // if (Multiplayer.SOCKETID === Multiplayer.USERS[0]){
        this.host_gameplay()
      // }
      

  }

  private ballLocation(data:any) {
    if (data.gameid == this.GAMEID){
      SessionData.session_data.current_ball!.getBall().attr("cx",data.x)
      SessionData.session_data.current_ball!.getBall().attr("cy",data.y)
    }

  }

  private updateScore = (res:any) => {
    
    if (res.game_id == this.GAMEID) {
      
     
      SessionData.game_data.score_left = res.score_1
      SessionData.game_data.score_right = res.score_2
      this.html_page.getPlayerTurn().textContent =res.message

      document.getElementById("score1")!.textContent = (SessionData.game_data.score_left).toString()
      document.getElementById("score2")!.textContent = (SessionData.game_data.score_right).toString()

      if (res.status == 1){
        document.getElementById("loader2")!.style.display = "block"
        document.getElementById("singleplayer_button")!.style.display = "none"
        SessionData.game_data.score_left>SessionData.game_data.score_right?this.html_page.getGameBanner().textContent = "Left Won the Game":this.html_page.getGameBanner().textContent = "Right Won the Game"
        SessionData.game_data.round_started = true
        io().emit("detach",this.GAMEID)
        const refresh = () => {window.location.reload()}
        setTimeout(refresh,5000)

      }
    }
  }

  private host_gameplay = <T>() =>{
  
    let mouseup:() => void = () => null
    if (this.SOCKETID === this.USERS[0]){
        mouseup = Observable.fromEvent<MouseEvent>(HTMLPage.svg, 'mouseup')
        .filter((s=>!SessionData.game_data.round_started))
        .subscribe(s=>(SessionData.game_data.round_started = true, SessionData.session_data.end_ball_movement= SessionData.session_data.current_ball!.ball_movement(SessionData.game_data.start_direction)))
    
  
    SessionData.session_data.gameplay_main = Observable.interval(10)
    .map(s=>({x:SessionData.session_data.current_ball!.getBall().attr('cx')}))
    .subscribe(
      ({x})=>{
      
        if (Number(x) < (Number(HTMLPage.svg.getAttribute("x"))-Number(SessionData.session_data.current_ball!.getBall().attr("r")))) {
                
                GameSound.game_sound.fail.play()
                SessionData.game_data.score_right+=1
                document.getElementById("score2")!.textContent = (SessionData.game_data.score_right).toString()
                SessionData.session_data.end_ball_movement()
                SessionData.game_data.round_started = false
                SessionData.game_data.start_direction = -1
                this.html_page.getPlayerTurn().textContent = "Right is Serving"
                SessionData.session_data.current_ball!.getBall().attr("cy",Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(SessionData.session_data.current_ball!.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                .attr("cx",Number(HTMLPage.svg.getAttribute("width"))/2)

                let res = {
                  "status" : 0,
                  "game_id" : this.GAMEID,
                  "score_1" : SessionData.game_data.score_left,
                  "score_2" : SessionData.game_data.score_right,
                  "message" : "Right is Serving"
                }
                io().emit("score_update",res)
  
                
              }else if (Number(x) > (Number(HTMLPage.svg.getAttribute("x"))+Number(SessionData.session_data.current_ball!.getBall().attr("r")) + Number(HTMLPage.svg.getAttribute("width") ))){
                
                GameSound.game_sound.fail.play()
                SessionData.game_data.score_left +=1
                document.getElementById("score1")!.textContent = (SessionData.game_data.score_left).toString()
                SessionData.session_data.end_ball_movement()
                SessionData.game_data.round_started = false
                SessionData.game_data.start_direction = 1
                this.html_page.getPlayerTurn().textContent = "Left is Serving"
                SessionData.session_data.current_ball!.getBall().attr("cy",Math.floor(Math.random() * (Number(HTMLPage.svg.getAttribute("height")) - Settings.settings.padding - Number(SessionData.session_data.current_ball!.getBall().attr("r")) - Settings.settings.padding - 1) + Settings.settings.padding))
                .attr("cx",Number(HTMLPage.svg.getAttribute("width"))/2)

                let res = {
                  "status" : 0,
                  "game_id" : this.GAMEID,
                  "score_1" : SessionData.game_data.score_left,
                  "score_2" : SessionData.game_data.score_right,
                  "message" : "Left is Serving"
                }
                io().emit("score_update",res)
      }
      
      if (SessionData.game_data.score_left >= Settings.settings.game_point || SessionData.game_data.score_right >= Settings.settings.game_point){
        
              document.getElementById("singleplayer_button")!.style.display = "none"
              document.getElementById("loader2")!.style.display = "block"
              GameSound.game_sound.fail.play()
              SessionData.session_data.gameplay_main()
              if (this.SOCKETID === this.USERS[0]){
                  mouseup()
              }
              SessionData.session_data.end_ball_movement()
              
              SessionData.session_data.current_ball!.getBall().attr("r",0)
              this.html_page.getPlayerTurn().textContent = "Thank You for Playing Multiplayer Pong. You will be redirected to single player is 5 seconds."
              SessionData.game_data.score_left>SessionData.game_data.score_right?this.html_page.getGameBanner().textContent = "Left Won the Game":this.html_page.getGameBanner().textContent = "Right Won the Game"
              // document.getElementById("player_turn")!.style.display = "none"
              SessionData.game_data.round_started = true

              let res = {
                "status" : 1,
                "game_id" : this.GAMEID,
                "score_1" : SessionData.game_data.score_left,
                "score_2" : SessionData.game_data.score_right,
                "message" : "Thank You for Playing Multiplayer Pong. You will be redirected to single player is 5 seconds."
              }
              io().emit("score_update",res)

              io().emit("detach",this.GAMEID)

              const refresh = () => {window.location.reload()}
              setTimeout(refresh,5000)
             
              
              
  
      }
    

  
  
      
      })
    
    }
  }

private updateLobbyTable(res:any,socket:any,trying_count:Array<number>) {
  if (res.game_data !== undefined){
    console.log("its hereee")
    document.getElementById("gameid")!.textContent = "Game ID : "+res.game
    if (res.game == this.GAMEID){
      
      if (res.socket == this.SOCKETID || this.SOCKETID == null || Object.keys((res.game_data)).length === 2){
    
        trying_count[0]++
      
        document.getElementById("player_wait_banner")!.textContent! =  "Waiting for players (Session will be terminated in 60 seconds) (" + trying_count + "/60)"
      
        if (trying_count[0]>60){
          trying_count[0] = 0
          document.getElementById("player_wait_banner")!.textContent! =  ""
          
          Observable.toSocketIO(socket,"stop_searching_for_players",this.GAMEID)
          // socket.emit("stop_searching_for_players",this.GAMEID)
      
          this.GAMEID = null
          this.SOCKETID = null

          //switch to singleplayer mode
          Multiplayer.switchToSP()
          alert("Timed Out. Please try again.")
        }
        
        if (Object.keys(res.game_data).length <= 2){
          
      
            let table_div = document.getElementById("player_table")!;
            table_div.removeChild(table_div.childNodes[0])
      
            let table = document.createElement("table"),
                tr = document.createElement("tr"),
                td_0 = document.createElement("td"),
                td_1 = document.createElement("td"),
                td_2 = document.createElement("td"),
                text_0 = document.createTextNode("Player Side"),
                text_1 = document.createTextNode("Socket ID"),
                text_2 = document.createTextNode("Ready")
      
            td_0.appendChild(text_0);
            td_1.appendChild(text_1);
            td_2.appendChild(text_2);
      
            tr.appendChild(td_0);
            tr.appendChild(td_1);
            tr.appendChild(td_2);
            table.appendChild(tr);
      
      
            let count = 0;
      
            for (const [key, value] of Object.entries(res.game_data)) {
              if (this.USERS[0] != key)
                  this.USERS.push(key)
            }
            
            for (let i = 0; i <= 1; i++) {
                let tr = document.createElement("tr"),
      
                  td_0 = document.createElement("td"),
                  td_1 = document.createElement("td"),
                  td_2 = document.createElement("td"),
              
                  text_1:Text|undefined = undefined,
                  tick:HTMLImageElement|undefined = undefined,

                  side = document.createTextNode((count === 0)?"Left Side":"Right Side"),
                
                  if (this.USERS[i] !== undefined){
                    text_1 = document.createTextNode(this.USERS[i])
                    tick = document.createElement("img")

                    tick.setAttribute("src","img/tick.png")
                  }else{
                    text_1 = document.createTextNode("Waitng...")
                    tick = document.createElement("img")

                    tick.setAttribute("src","img/tick.png")
                  }
                  
      
              tick!.setAttribute("height","80px")
              tick!.setAttribute("weight","1000px")
              
      
              td_0.appendChild(side);
              td_1.appendChild(text_1!);
              td_2.appendChild(tick!);
      
              tr.appendChild(td_0);
              tr.appendChild(td_1);
              tr.appendChild(td_2);
      
              table.appendChild(tr);
              count++
                
            }
            
      
            
            table_div.appendChild(table)
      
            

            if ((Object.keys(res.game_data).length === 2)){
              document.getElementById("loader")!.style.display = "none"
            document.getElementById("player_wait_banner")!.style.display = "block"
            document.getElementById("player_wait_banner")!.textContent = "Both Players Connected. To Start the Game, the Host has to click on the table."
            
            this.startMultiplayerGame()
            
            if (!socket.sentMydata) {
        
              // socket.emit("stop_searching_for_players")
              Observable.toSocketIO(socket,"stop_searching_for_players")
              socket.sentMydata = true;
            }
          }
            
        }
      }
    }
  }
  
   
    
  
}

private updatePaddles(res:any,pongTable:PongTable) {

  let left_paddle = SessionData.session_data.current_paddle!
  // left_paddle.attr("y", res[this.GAMEID!][this.USERS[0]])

  let right_paddle = SessionData.session_data.opponent_paddle!
  // right_paddle.attr("y", res[this.GAMEID!][this.USERS[1]])

  
  pongTable.paddle_movement(left_paddle)(res[this.GAMEID!][this.USERS[0]])
  pongTable.paddle_movement(right_paddle)(res[this.GAMEID!][this.USERS[1]])


  
}
/**
 * 
 * 
 * 
 * 
 * 
 * */ 
private updatePlayerHost(res:any,allocated:Array<boolean>) {

  if (res.code == 200){ 
    if (this.GAMEID == undefined || this.GAMEID == res.gameid){
      allocated[0] = true       
      this.GAMEID = res.gameid
      this.SOCKETID = res.socket_id
      console.log("ha")
      console.log(res.gameid)
      document.getElementById("gameid")!.textContent = "Game ID : "+ res.gameid
      document.getElementById("player_wait_banner")!.style.display = "block"    
    }
  }else if (res.code == 404){
    if (allocated[0] == false){
      Multiplayer.switchToSP()
      alert(res.message)
    }
  }
}

private updatePlayerClient(res:any) {
  if (res.code === 200) {
    if (this.GAMEID == undefined || this.GAMEID == res.gameid){
    this.GAMEID = res.gameid
    this.SOCKETID = res.socket_id
    this.createLobby(res.gameid)
    
    document.getElementById("gameid")!.textContent = "Game ID : "+res.gameid
    }
  }else{
    alert(res.message)
  }

}


static switchToSP = () => {

      
      io().emit("detach","check")

      // document.getElementById("lobby")!.style.display = "none"
      // document.getElementById("game")!.style.display = "block"
      // document.getElementById("options")!.style.display = "block"
      // document.getElementById("singleplayer")!.style.display = "none"
      // document.getElementById("multiplayer")!.style.display = "block"
      // console.log("ran")

      const refresh = () => {window.location.reload()}

      setTimeout(refresh,500)
      
}


createGame= () => {

  
  const generateGameId = () => {
    const socket = io(),
          _this=this

    Observable.toSocketIO(socket,"new_game")
    // socket.emit('new_game');

    let allocated:Array<boolean> = []
    allocated[0] = false
    Observable.fromSocketIO(socket,document,"game_id").subscribe((res)=>(_this.updatePlayerHost(res,allocated)))

    // socket.on('game_id',function(res:any){
    //   console.log("res")
    //   _this.updatePlayerHost(res,allocated)}
    // );

  }

  // Execute the function and create the lobby
  this.createLobby()
  // Generate the game Id for the session
  generateGameId()


}

joinGame = () => {
    let game_id = (<HTMLInputElement>document.getElementById("join_game_id")!).value
    if (game_id == "") {
      alert("Did you enter a Game ID?")
      Multiplayer.switchToSP()

    }else{
      const socket = io(),
          _this = this

      // socket.emit('join_game',);

      Observable.toSocketIO(socket,"join_game",game_id.toString())
      
      Observable.fromSocketIO(socket,document,"join").subscribe((res)=>(_this.updatePlayerClient(res)))
      // socket.on('join', function(res:any){
      //   _this.updatePlayerClient(res)}
      // );

    }




  
}



}


const main = () => {
  let game = new Gameplay(),
      html = new HTMLPage(game),
      multiplayer = new Multiplayer(html);




  
}

main()





}



  













  



// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    pong();

  }

 

 