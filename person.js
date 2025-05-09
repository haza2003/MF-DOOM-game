class person extends GameObject {
    constructor (config) {
        super (config);
        this.movingProgressRemaining = 0;
        this.isStanding = false;
        this.map = null;

        this.isPlayerControlled = config.isPlayerControlled || false;

        this.directionUpdate = {
            "up": ["y",-1],
            "down": ["y",1],
            "left": ["x",-1],
            "right": ["x",1],
        }
    }

    update(state) {
        this.map = state.map;
        
        if (this.movingProgressRemaining > 0 ) {
         this.updatePosition();
        } else {

            if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
                this.startBehaviour (state, {
                  type: "walk",
                  direction: state.arrow
                })
            }
            this.updateSprite(state);
        }
    }

    startBehaviour (state, behaviour){

        this.direction = behaviour.direction;
        if (behaviour.type === "walk") {


            if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {

                behaviour.retry && setTimeout (() => {
                    this.startBehaviour (state, behaviour)
                }, 10)
            return;
            }

          
            state.map.moveWall(this.x, this.y, this.direction);
            this.movingProgressRemaining = 16;
            this.updateSprite(state);
        }

        if (behaviour.type === "stand") {
            this.isStanding = true;
            setTimeout(() => {
              this.emitEvent("PersonStandComplete", {
                whoId: this.id
              })
              this.isStanding = false;
            }, behaviour.time)
          }
    }

    updatePosition() {
        const [property, change] = this.directionUpdate[this.direction];
        this[property] += change;
        this.movingProgressRemaining -= 1;
    
        //console.log(`NPC ${this.id} moving. Steps remaining: ${this.movingProgressRemaining}`);
    
        if (this.movingProgressRemaining === 0) {
            //console.log(`NPC ${this.id} finished walking, emitting event.`);
    
            this.emitEvent("PersonWalkingComplete", {
                whoId: this.id
            })
        }
    }

    updateSprite(){

        if (this.movingProgressRemaining > 0 ) {
            this.sprite.setAnimation("walk-"+this.direction);
            return;
        }
        this.sprite.setAnimation("idle-"+this.direction);
    }
}