let AMOUNT_COOKIES = 35;

/*class Inicio extends Phaser.Scene {
      constructor(){
          super({key:'Inicio'});
         
      }

     create(){
        let texto= this.add.text(game.config.width/2, game.config.height/2, 'Iniciar',{
            fontSize: '40px',
            fill: '#FFF',
            aling: 'center'
        }).setOrigin(0.5).setInteractive();
        texto.on('pointerdown', () => {
            this.scene.start('GamePlayManager');
        });
    }
     update(){

     }
}*/
GamePlayManager = {
     Extends: Phaser.Scene,
    init: function(){
        function Principal(){
            Phaser.Scene.call(this,{key: 'GamePlayManager'});
        }
     game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
     game.scale.pageAlignHorizontally = true;//aliniamos la pantalla
     game.scale.pageAlignVertically = true;

     this.flagFirstMouseDown = false;
     this.amountCookiesCaught = 0;
     this.endGame = false;

     this.countSmile = -1;

    },
    preload: function(){
        game.load.image('fondo','assets/image/fondo3.png');
       game.load.spritesheet('troya','assets/image/troyas3.png',84, 130, 2);
       game.load.spritesheet('galletas','assets/image/Galletas2.png',81,84,4);
       game.load.spritesheet('explosion','assets/image/explosion.png');
       game.load.spritesheet('nubes','assets/image/nubes.png');
       game.load.spritesheet('gato','assets/image/gato.png');

       game.load.audio('gameOver','assets/sounds/GameOver.mp3');
       game.load.audio('congrats','assets/sounds/levelComplete.mp3');
       game.load.audio('bite','assets/sounds/bite.mp3');
       game.load.audio('music','assets/sounds/musicTroya.wav');
    },
    create: function(){
        game.add.sprite(0,0,'fondo');
        this.nubes = game.add.sprite(0,20,'nubes');
        this.troya = game.add.sprite(0,0,'troya');
        this.gato = game.add.sprite(1240,450,'gato');
        this.troya.frame = 0;
        this.troya.x = game.width/2;
        this.troya.y = game.height/2;    
        this.troya.anchor.setTo(0);

        game.input.onDown.add(this.onTap, this);

        this.cookies = [];
        // Creacion de las galletas
        for(let i = 0; i < AMOUNT_COOKIES; i++){
           let cookie = game.add.sprite(100,100,'galletas');
           cookie.frame = game.rnd.integerInRange(0,3);
           cookie.scale.setTo(0.30 + game.rnd.frac());
           cookie.anchor.setTo(0.5);
           cookie.x = game.rnd.integerInRange(50, 1050);//se agregan galletas al azar en el eje x
           cookie.y = game.rnd.integerInRange(50, 600);//se agregan galletas al azar en el eje y

           this.cookies[i] = cookie;

           let rectCurrentCookie = this.getBoundsCookie(cookie);
           let rectTroya = this.getBoundsCookie(this.troya);
           let rectGato = this.getBoundsCookie(this.gato);

           while(this.isOverlapingOtherCookie(i, rectCurrentCookie) || 
           this.isRectanglesOverlapping(rectTroya, rectCurrentCookie)){
            
            cookie.x = game.rnd.integerInRange(50,1050);
            cookie.y = game.rnd.integerInRange(50,600);
            rectCurrentCookie = this.getBoundsCookie(cookie);

           }
        }

        this.explosionGroup = game.add.group();

        for(let i = 0; i < 10; i++){
          this.explosion = this.explosionGroup.create(200,200, 'explosion');
          this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
            x:[0.4, 0.8, 0.4],
            y:[0.4, 0.8, 0.4]//determina la entrada del efecto
          }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

          this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
              alpha: [1, 0.6, 0]
          },600, Phaser.Easing.Exponential.Out, false, 0, 0, false);
          this.explosion.anchor.setTo(0.5);
          this.explosion.kill();
        }

        this.currentScore = 0;

        let style = {
            font: 'bold 30pt Arial',
            fill:'#FFFFFF',
            aling: 'center'
        }
        this.scoreText = game.add.text(game.width/2, 40, '0', style);//agregamos texto al juego
        this.scoreText.anchor.setTo(0.5);

        this.totalTime = 30;
        this.timerText = game.add.text(1080, 40, '0', style);//agregamos el timer
        this.timerText.anchor.setTo(0.5);

        // condicion de game over
       this.timerGameOver =  game.time.events.loop(Phaser.Timer.SECOND, function(){
        if(this.flagFirstMouseDown){
            this.totalTime--;
            this.timerText.text = this.totalTime+'';//convertimos a string
            if(this.totalTime <= 0 && this.isRectanglesOverlapping(rectTroya, rectGato)){
                this.music.stop();
               let gameOver = new Phaser.Sound(this,'gameOver',0.5);
               gameOver.play();
                game.time.events.remove(this.timerGameOver);//removemos el timer
                this.endGame = true;
                this.showFinalMessage('GAME OVER');
               
            }
        }   
       },this);

    }, 
    increaseScore: function(){
        let bite = new Phaser.Sound(this,'bite',0.4);
         bite.play();
        this.countSmile = 0;
        this.troya.frame = 1;
   
         this.currentScore += 100;
         this.scoreText.text = this.currentScore;
   
         this.amountCookiesCaught += 1;
         
         if( this.amountCookiesCaught >= AMOUNT_COOKIES){
           let congrats = new Phaser.Sound(this,'congrats');
           congrats.play();
           this.music.stop();
           game.time.events.remove(this.timerGameOver);
             this.endGame = true;
             this.showFinalMessage('CONGRATULATIONS',0.7);
         }
       },
       showFinalMessage: function(msg){
        // this.tweenMollusk.stop();

     let bgAlpha = game.add.bitmapData(game.width, game.height);
     bgAlpha.ctx.fillStyle = '#000000';
     bgAlpha.ctx.fillRect(0,0,game.width,game.height);

     let bg = game.add.sprite(0,0,bgAlpha);
     bg.alpha = 0.5;

     let style = {
         font: 'bold 60pt Arial',
         fill: '#FFFFFF',
         aling: 'center'
     }

     this.textFieldFinalMsg = game.add.text(game.width/2, game.height/2, msg, style);
     this.textFieldFinalMsg.anchor.setTo(0.5);
    },
    onTap: function(){
        
         this.music = new Phaser.Sound(this,'music',0.5,1);
        this.music.play();
        
      if(!this.flagFirstMouseDown){
          
      }
      this.flagFirstMouseDown = true;
    },
    getBoundsCookie: function(currentCookie){
      return new Phaser.Rectangle(currentCookie.left, currentCookie.top, currentCookie.width,
        currentCookie.height);
    },
    isRectanglesOverlapping: function(rect1,rect2){
        if(rect1.x > rect2.x+rect2.width || rect2.x > rect1.x+rect1.width){
            return false;
        }
        if(rect1.y > rect2.y+rect2.height || rect2.y > rect1.y+rect1.height){
            return false;
        }
        return true;
    }, 
    isOverlapingOtherCookie: function(index, rect2){
         for(i = 0; i < index; i++){
             let rect1 = this.getBoundsCookie(this.cookies[i]);
             if(this.isRectanglesOverlapping(rect1, rect2)){
                 return true;
             }
         }
         return false;
    },
    getBoundsTroya: function(){
       let x0 = this.troya.x - Math.abs(this.troya.width)/4;
       let width = Math.abs(this.troya.width)/2;
       let y0 = this.troya.y - this.troya.height/2;
       let height = this.troya.height;

       return new Phaser.Rectangle(x0, y0, width, height);
    },
    getBoundsGato: function(){
        let x0 = this.gato.x - Math.abs(this.gato.width)/4;
        let width = Math.abs(this.gato.width)/2;
        let y0 = this.gato.y - this.gato.height/2;
        let height = this.gato.height;
 
        return new Phaser.Rectangle(x0, y0, width, height);
     },
    // Funcion que nos permite ver el rectangulo del sprite
    render: function(){
    //  game.debug.spriteBounds(this.troya);
    //  game.debug.spriteBounds(this.gato);
    },
    update: function(){
        // El if es la parte importante para que el scrit se mueva hasta que demos un click
        if(this.flagFirstMouseDown && !this.endGame){


            if(this.countSmile >= 0){
                this.countSmile++;
                if(this.countSmile >50){
                    this.countSmile = -1;
                    this.troya.frame = 0;
                }
            }

            this.nubes.x += 0.3;
            if(this.nubes.x >= 1300){
                this.nubes.x = -300;
            }

            this.gato.x += -0.3;
            if(this.game.x >= 1300){
              this.gato.x = 300;
            }
            
            let pointerX = game.input.x;
            let pointerY = game.input.y;
     
            let distX = pointerX - this.troya.x;
            let distY = pointerY - this.troya.y;
     
            if(distX > 0){
                this.troya.scale.setTo(1,1);
            }else{
                this.troya.scale.setTo(-1,1);
            }
     
            this.troya.x += distX * 0.02;
            this.troya.y += distY * 0.02;

            for(let i = 0; i < AMOUNT_COOKIES; i++){
              let rectTroya = this.getBoundsTroya();
              let rectGato = this.getBoundsGato();
              let rectCookie = this.getBoundsCookie(this.cookies[i]);

              if(this.isRectanglesOverlapping(rectTroya, rectGato)){
                  this.music.stop();
                  let gameOver = new Phaser.Sound(this,'gameOver',0.1);
               gameOver.play();
                game.time.events.remove(this.timerGameOver);//removemos el timer
                this.endGame = true;
                this.showFinalMessage('YOU LOSE');
              }
              if(this.cookies[i].visible && this.isRectanglesOverlapping(rectTroya, rectCookie)){
                  this.increaseScore();
                  this.cookies[i].visible = false;

                  let explosion = this.explosionGroup.getFirstDead();
                  if(explosion != null){

                    explosion.reset(this.cookies[i].x, this.cookies[i].y);
                    explosion.tweenScale.start();
                    explosion.tweenAlpha.start();

                    explosion.tweenAlpha.onComplete.add(function(currentTarget, currentTween){
                       currentTarget.kill();
                    },this);
                  }
              }
            }
        }

    }

}
let config = {
    type: Phaser.AUTO,
    width: 1350,
    height: 680,
    scene: [GamePlayManager]
}
let game = new Phaser.Game(config);

game.state.add('gameplay', GamePlayManager);
game.state.start('gameplay');
