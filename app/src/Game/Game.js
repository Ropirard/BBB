// Import de la feuille de style
import '../assets/css/style.css';
// Import des données de configuration
import customConfig from '../config.json';
import levelsConfig from '../levels.json';
// Import des assets de sprite
import ballImgSrc from '../assets/img/ball.png';
import paddleImgSrc from '../assets/img/paddle.png';
import brickImgSrc from '../assets/img/brick.png';
import unbreakableBrickImgSrc from '../assets/img/unbreakableBrick.png';
import edgeImgSrc from '../assets/img/edge.png';
import Ball from './Ball';
import GameObject from './GameObject';
import CollisionType from './DataType/CollisionType';
import Paddle from './Paddle';
import Brick from './Brick';
import PowerUp from './PowerUp';
// Import des assets des pouvoirs
import stickyBallImgSrc from '../assets/img/powerup/SB_powerup.png';
import multiBallImgSrc from '../assets/img/powerup/MB_powerup.png';
import laserImgSrc from '../assets/img/powerup/L_powerup.png';
import laserShootImgSrc from '../assets/img/laser.png';
import largeSmallImgSrc from '../assets/img/powerup/LS_powerup.png';
import perforingBallImgSrc from '../assets/img/powerup/PB_powerup.png';

// Import de la classe Laser
import Laser from './Laser';

class Game
{
    config = {
        canvasSize: {
            width: 800,
            height: 600
        },
        ball: {
            radius: 10,
            orientation: 45,
            speed: 3,
            position: {
                x: 400,
                y: 300
            },
            angleAlteration: 30
        },
        paddleSize: {
            width: 100,
            height: 20
        }

    };
    
    // Données des niveaux
    levels;

    // Score du joueur
    score = 0;

    // Probabilité de faire tomber un power-up
    probability = 3;

    // Pouvoirs
    perforingBullet = false;
    stickyBall = false;
    laser = 0;
    
    // Minuteurs pour les pouvoirs à durée limitée
    powerupTimers = {};

    laserCooldown = 0;

    // Contexte de dessin du canvas
    ctx;

    // Timestamp haute résolution de la boucle d'animation 
    currentLoopStamp;

    // <span> de débug
    debugSpan;
    debugInfo = '';
    // Élément d'affichage du score
    elScore;

    // Images
    images = {
        ball: null,
        paddle: null,
        brick: null,
        edge: null
    };

    // State (un objet qui décrit l'état actuel du jeu, les balles, les briques encore présentes, etc.)
    state = {
        // Balles (plusieurs car possible multiball)
        balls: [],
        // Briques
        bricks: [],
        // Bordure de la mort
        deathEdge: null,
        // Bordures à rebond
        bouncingEdges: [],
        // Paddle
        paddle: null,
        // Bonus actifs
        powerups: [],
        // Lasers
        lasers: [],
        // Entrées utilisateur
        userInput: {
            paddleLeft: false,
            paddleRight: false,
            shoot: false
        }
    };

    constructor( customConfig = {}, levelsConfig = [] ) {
        // Object.assign() permet de fusionner deux objets littéraux (seulement le premier niveau)
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
        Object.assign( this.config, customConfig );

        this.levels = levelsConfig;
    }

    start() {
        console.log('Jeu démarré ...');
        // Initialisation de l'interface HTML
        this.initHtmlUI();
        // Initialisation des images
        this.initImages();
        // Initialisation des objets du jeu
        this.initGameObjects();
        // Lancement de la boucle
        requestAnimationFrame( this.loop.bind(this) );
        // Après la boucle
    }

    // Méthodes "privées"
    initHtmlUI() {
        const elH1 = document.createElement('h1');
        elH1.textContent = 'Arkanoïd';

        this.elScore = document.createElement('h2');
        this.elScore.textContent = 'Score : ' + this.score;

        const elCanvas = document.createElement( 'canvas' );
        elCanvas.width = this.config.canvasSize.width;
        elCanvas.height = this.config.canvasSize.height;

        // Débug box
        this.debugSpan = document.createElement( 'span' );
        
        document.body.append( elH1, this.elScore, elCanvas, this.debugSpan );

        // Récupération du contexte de dessin
        this.ctx = elCanvas.getContext('2d');

        // Écouteur d'évènements du clavier
        document.addEventListener( 'keydown', this.handlerKeyboard.bind(this, true) );
        document.addEventListener( 'keyup', this.handlerKeyboard.bind(this, false) );
    }

    // Création des images
    initImages() {
        // Balle
        const imgBall = new Image();
        imgBall.src = ballImgSrc;
        this.images.ball = imgBall;

        // Paddle
        const imgPaddle = new Image();
        imgPaddle.src = paddleImgSrc;
        this.images.paddle = imgPaddle;

        // Brique
        const imgBrick = new Image();
        imgBrick.src = brickImgSrc;
        this.images.brick = imgBrick;

        // Brique incassable
        const imgUnbreakableBrick = new Image();
        imgUnbreakableBrick.src = unbreakableBrickImgSrc;
        this.images.unbreakableBrick = imgUnbreakableBrick;

        // Bordure
        const imgEdge = new Image();
        imgEdge.src = edgeImgSrc;
        this.images.edge = imgEdge;

        // POUVOIRS
        // Balle collante
        const imgStickyBallPowerup = new Image();
        imgStickyBallPowerup.src = stickyBallImgSrc;
        this.images.stickyBall = imgStickyBallPowerup;

        // Laser
        const imgLaserPowerup = new Image();
        imgLaserPowerup.src = laserImgSrc;
        this.images.laser = imgLaserPowerup;

        // Laser Projectile
        const imgLaserShoot = new Image();
        imgLaserShoot.src = laserShootImgSrc;
        this.images.laserShoot = imgLaserShoot;

        // Balle perforante
        const imgPerforingBallPowerup = new Image();
        imgPerforingBallPowerup.src = perforingBallImgSrc;
        this.images.perforingBall = imgPerforingBallPowerup;

        // Changement de taille du paddle
        const imgLargeSmallPowerup = new Image();
        imgLargeSmallPowerup.src = largeSmallImgSrc;
        this.images.largeSmall = imgLargeSmallPowerup;

        // Multi-balle
        const imgMultiBallPowerup = new Image();
        imgMultiBallPowerup.src = multiBallImgSrc;
        this.images.multiBall = imgMultiBallPowerup;
    }

    // Mise en place des objets du jeu sur la scene
    initGameObjects() {
        // Balle
        const ballDiamater = this.config.ball.radius * 2;
        const ball = new Ball(
            this.images.ball,
            ballDiamater, ballDiamater,
            this.config.ball.orientation,
            this.config.ball.speed
        );
        ball.setPosition(
            this.config.ball.position.x,
            this.config.ball.position.y
        );
        ball.isCircular = true;
        this.state.balls.push( ball );

        // Bordure de la mort
        const deathEdge = new GameObject(
            this.images.edge,
            this.config.canvasSize.width,
            20
        );
        deathEdge.setPosition(
            0,
            this.config.canvasSize.height + 30
        );
        this.state.deathEdge = deathEdge;

        // -- Bordures à rebond
        // Haut
        const edgeTop = new GameObject(
            this.images.edge,
            this.config.canvasSize.width,
            20
        );
        edgeTop.setPosition(0, 0);

        // Droite
        const edgeRight = new GameObject(
            this.images.edge,
            20,
            this.config.canvasSize.height + 10
        );
        edgeRight.setPosition(
            this.config.canvasSize.width - 20,
            20
        );
        edgeRight.tag = 'RightEdge';

        // Gauche
        const edgeLeft = new GameObject(
            this.images.edge,
            20,
            this.config.canvasSize.height + 10
        );
        edgeLeft.setPosition(0, 20);
        edgeLeft.tag = 'LeftEdge';

        // Ajout dans la liste des bords
        this.state.bouncingEdges.push(edgeTop, edgeRight, edgeLeft);

        // Paddle
        const paddle = new Paddle(
            this.images.paddle,
            this.config.paddleSize.width,
            this.config.paddleSize.height,
            0,
            0
        );
        paddle.setPosition(
            (this.config.canvasSize.width / 2) - ( this.config.paddleSize.width / 2),
            this.config.canvasSize.height - this.config.paddleSize.height - 20
        );
        this.state.paddle = paddle;

        // Chargement de briques
        this.loadBricks(this.levels.data[0]);
    }

    // Création des briques
    loadBricks( levelArray ) {
        // Lignes
        for( let line = 0; line < levelArray.length; line ++ ) {
            // Colonnes
            for( let column = 0; column < levelArray[line].length; column ++ ) {
                let brickType = levelArray[line][column];
                // Si la valeur trouvée est 0, c'est un espace vide, donc on passe à la colonne suivante
                if( brickType == 0 ) continue;

                // Choix de l'image selon le type
                let brickImage = brickType < 0 ? this.images.unbreakableBrick : this.images.brick;

                // Si on a bien une brique, on la crée et on la met dans le state
                const brick = new Brick( brickImage, 50, 25, brickType );
                brick.setPosition(
                    20 + (50 * column),
                    20 + (25 * line)
                );

                this.state.bricks.push( brick );
            }
        }
    }


    // Cycle de vie: 1- Entrées Utilisateur
    checkUserInput() {
        // -- Paddle
        // On analyse quel commande de mouvement est demandée pour le paddle
        // Droite
        if( this.state.userInput.paddleRight ) {
            this.state.paddle.orientation = 0;
            this.state.paddle.speed = 7;
        }
        // Gauche
        if( this.state.userInput.paddleLeft ) {
            this.state.paddle.orientation = 180;
            this.state.paddle.speed = 7;
        }
        // Ni Droite Ni Gauche
        if( ! this.state.userInput.paddleRight && ! this.state.userInput.paddleLeft ) {
            this.state.paddle.speed = 0;
        }

        // Mise à jour de la position
        this.state.paddle.update();
    }

    // Cycle de vie: 2- Collisions et calculs qui en découlent
    checkCollisions() {

        // Collisions du paddle avec les bords
        this.state.bouncingEdges.forEach( theEdge => {
            const collisionType = this.state.paddle.getCollisionType( theEdge );

            // Si aucune collision ou autre que horizontal, on passe au edge suivant
            if( collisionType !== CollisionType.HORIZONTAL ) return;

            // Si la collision est horizontale, on arrête la vitesse du paddle
            this.state.paddle.speed = 0;

            // On récupère les limites de theEdge
            const edgeBounds = theEdge.getBounds();

            // Si on a touché la bordure de droite
            if( theEdge.tag === "RightEdge" ) {
                this.state.paddle.position.x = edgeBounds.left - 1 - this.state.paddle.size.width;
            }
            // Si on a touché la bordure de gauche
            else if( theEdge.tag === "LeftEdge" ) {
                this.state.paddle.position.x = edgeBounds.right + 1;
            }

            // Mise à jour de la position
            this.state.paddle.update();
        });

        // Collisions des balles avec tous les objets
        // On crée un tableau pour stocker les balles non-perdues
        const savedBalls = [];

        this.state.balls.forEach( theBall => {
            
            // Collision de la balle avec le bord de la mort
            if( theBall.getCollisionType( this.state.deathEdge ) !== CollisionType.NONE ) {
                return;
            }

            // On sauvegarde la balle en cours (car si on est là, c'est qu'on a pas tapé le bord de la mort)
            savedBalls.push( theBall );

            // Collisions de la balle avec les bords rebondissants
            this.state.bouncingEdges.forEach( theEdge => {
                const collisionType = theBall.getCollisionType( theEdge );

                switch( collisionType ) {
                    case CollisionType.NONE:
                        return;

                    case CollisionType.HORIZONTAL:
                        theBall.reverseOrientationX();
                        break;

                    case CollisionType.VERTICAL:
                        theBall.reverseOrientationY();
                        break;

                    default:
                        break;
                }
            });

            // Collisions de la balle avec les briques
            this.state.bricks.forEach( theBrick => {
                const collisionType = theBall.getCollisionType( theBrick );

                switch( collisionType ) {
                    case CollisionType.NONE:
                        return;

                    case CollisionType.HORIZONTAL:
                        if (!this.perforingBullet) {
                            theBall.reverseOrientationX();
                        }
                        break;

                    case CollisionType.VERTICAL:
                        if (!this.perforingBullet) {
                            theBall.reverseOrientationY();
                        }
                        break;

                    default:
                        break;
                }

                // Ici on a forcément une collision (car la première clause du switch fait un return)
                // Décrément du compteur de résistance de la brique
                theBrick.strength--;
                // Ajout du score si la brique atteint 0 (se casse)
                if (theBrick.strength === 0) {
                    this.score += 100;
                    if (this.elScore) {
                        this.elScore.textContent = 'Score : ' + this.score;
                    }
                    this.powerUp(theBrick.position.x, theBrick.position.y);
                }
            });

            // Collision avec le paddle
            const paddleCollisionType = theBall.getCollisionType( this.state.paddle );
            
            // Si la balle touche le paddle, on désactive le pouvoir perforant
            if (paddleCollisionType !== CollisionType.NONE && this.perforingBullet) {
                this.perforingBullet = false;
                console.log("Pouvoir perforingBall terminé !");
            }

            // Si la balle touche le paddle avec stickyBall, on arrête la balle
            if (paddleCollisionType !== CollisionType.NONE && this.stickyBall) {
                // On n'annule pas this.stickyBall ici, pour que le bonus puisse rester si besoin,
                // ou on l'annule si on ne veut qu'un seul collage. Pour l'instant on laisse.
                this.stickyBall = false;
                theBall.isStuck = true;
                theBall.stuckOffset = theBall.position.x - this.state.paddle.position.x;
                theBall.speed = 0;
            }

            if (!theBall.isStuck) {
                switch( paddleCollisionType ) {
                    case CollisionType.HORIZONTAL:
                        theBall.reverseOrientationX();
                        break;

                    case CollisionType.VERTICAL:
                         // Altération de l'angle en fonction du movement du paddle
                        let alteration = 0;
                        if( this.state.userInput.paddleRight )
                            alteration = -1 * this.config.ball.angleAlteration;
                        else if( this.state.userInput.paddleLeft )
                            alteration = this.config.ball.angleAlteration;

                        theBall.reverseOrientationY(alteration);
                        
                        // Correction pour un résultat de 0 et 180 pour éviter une trajectoire horizontale
                        if( theBall.orientation === 0 )
                            theBall.orientation = 10;
                        else if( theBall.orientation === 180 )
                            theBall.orientation = 170;

                        break;

                    default:
                        break;
                }
            }
        });

        // Collisions des lasers avec les briques
        this.state.lasers.forEach(laser => {
            let hit = false;
            this.state.bricks.forEach(theBrick => {
                if (hit || theBrick.strength === 0) return; // Si déjà touché
                
                const collisionType = laser.getCollisionType(theBrick);
                if (collisionType !== CollisionType.NONE) {
                    hit = true;
                    // On casse la brique (ou on la blesse)
                    theBrick.strength--;
                    if (theBrick.strength === 0) {
                        this.score += 100;
                        if (this.elScore) {
                            this.elScore.textContent = 'Score : ' + this.score;
                        }
                        this.powerUp(theBrick.position.x, theBrick.position.y);
                    }
                }
            });
            if (hit) {
                // Pour le retirer
                laser.position.y = -1000;
            }
        });

        // Mise à jour du state.balls avec savedBalls
        this.state.balls = savedBalls;

        // Collisions des power-ups avec le paddle
        this.state.powerups = this.state.powerups.filter( powerup => {
            const paddleBounds = this.state.paddle.getBounds();
            const powerupBounds = powerup.getBounds();

            // Vérification simple de superposition (AABB)
            const isIntersecting = (
                paddleBounds.left < powerupBounds.right &&
                paddleBounds.right > powerupBounds.left &&
                paddleBounds.top < powerupBounds.bottom &&
                paddleBounds.bottom > powerupBounds.top
            );

            if (isIntersecting) {
                console.log("Power-up attrapé :", powerup.type);
                // On active l'effet du pouvoir immédiatement
                this.applyPowerUp(powerup.type);
                return false; // on le supprime de l'écran et du tableau
            }

            // On retire également le pouvoir s'il sort par le bas de l'écran
            if (powerupBounds.top > this.config.canvasSize.height) {
                return false;
            }

            return true;
        });
    }

    powerUp(x, y) {
        const roll = Math.random();
        if (roll < 1/this.probability) {
            // Liste des types de pouvoir correspondant aux clés dans this.images
            const powerUpTypes = ['stickyBall'];
            
            // Sélection d'un type aléatoire
            const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            
            // Création du power-up (avec une taille par défaut de 30x30, à adapter)
            const newPowerUp = new PowerUp(this.images[randomType], 25, 25, randomType);
            
            // Positionnement du power-up
            if (x !== undefined && y !== undefined) {
                newPowerUp.setPosition(x, y);
            }
            
            // Ajout au state pour pouvoir le gérer ensuite
            this.state.powerups.push(newPowerUp);
            console.log("POUVOIR CREE :", randomType);
        } 
    }

    applyPowerUp(type) {
        switch (type) {
            case 'multiBall':
                console.log("Effet: multiBall !");
                // Logique pour dupliquer les balles
                break;
            case 'largeSmall':
                console.log("Effet: largeSmall !");
                // On choisit 60 (petit) ou 140 (grand)
                const newWidth = Math.random() < 0.5 ? 60 : 140;
                console.log("NOUVELLE LARGEUR : ", newWidth)
                
                // On applique tout de suite la nouvelle taille à l'objet paddle
                this.state.paddle.size.width = newWidth;
                
                // Si un minuteur était déjà en cours pour remettre le paddle à 100, on l'annule !
                if (this.powerupTimers.largeSmall) {
                    clearTimeout(this.powerupTimers.largeSmall);
                }

                // On relance un nouveau minuteur complet de 5 secondes
                this.powerupTimers.largeSmall = setTimeout(() => {
                    this.state.paddle.size.width = this.config.paddleSize.width; // Remet après 7 secondes
                    this.largeSmall = false;    
                }, 7000);
                break;
            case 'perforingBall':
                console.log("Effet: perforingBall !");
                this.perforingBullet = true; // Exemple: activation du pouvoir
                break;
            case 'laser':
                console.log("Effet: laser !");
                this.laser += 5;
                break;
            case 'stickyBall':
                console.log("Effet: stickyBall !");
                this.stickyBall = true;
                break;
            default:
                break;
        }
    }

    // Cycle de vie: 3- Mise à jours des données des GameObjects
    updateObjects() {
        // Balles
        let hasReleasedBall = false;

        this.state.balls.forEach( theBall => {
            if (theBall.isStuck) {
                // Suivre le paddle
                theBall.position.x = this.state.paddle.position.x + theBall.stuckOffset;
                theBall.position.y = this.state.paddle.position.y - theBall.size.height;

                // Si le joueur tire, on libère la balle
                if (this.state.userInput.shoot) {
                    theBall.isStuck = false;
                    theBall.speed = this.config.ball.speed;
                    // On lance la balle de manière parfaitement verticale (vers le haut)
                    theBall.orientation = 90;
                    theBall.position.y -= 5; // Décolle légèrement la balle pour éviter de refaire collision avec le paddle à la prochaine frame
                    hasReleasedBall = true;
                    theBall.update();
                }
            } else {
                theBall.update();
            }
        });

        // Si on a libéré une balle, on empêche de tirer un laser en même temps (un seul effet par espace)
        if (hasReleasedBall) {
            this.state.userInput.shoot = false;
        }

        // Power-ups
        this.state.powerups.forEach( powerup => {
            powerup.update();
        });

        // Lasers
        this.state.lasers.forEach( laser => {
            laser.update();
        });
        // On retire les lasers qui dépassent en haut
        this.state.lasers = this.state.lasers.filter( laser => laser.position.y + laser.size.height > 0);

        // Briques
        // On ne conserve dans le state que les briques dont strength est différent de 0
        this.state.bricks = this.state.bricks.filter( theBrick => theBrick.strength !== 0 );
    
        // Paddle
        this.state.paddle.updateKeyframe();

        // Gestion du cooldown laser
        if (this.laserCooldown > 0) {
            this.laserCooldown--;
        }

        // Tir de laser
        if (this.state.userInput.shoot && this.laser > 0 && this.laserCooldown <= 0) {
            const paddle = this.state.paddle;
            // On le fait partir du centre du paddle, orientation 90 degs (vers le haut), vitesse 4
            const laserObj = new Laser(this.images.laserShoot, 5, 20, 90, 4);
            laserObj.setPosition(paddle.position.x + paddle.size.width / 2 - 2, paddle.position.y);
            this.state.lasers.push(laserObj);

            this.laser--; // on consomme un laser
            this.laserCooldown = 30; // on attend avant le prochain
            this.state.userInput.shoot = false; // on oblige à relâcher la touche, ou alors on laisse rafale ? On laisse tir par tir
        }
    }

    // Cycle de vie: 4- Rendu graphique des GameObjects
    renderObjects() {
        // On efface tous le canvas
        this.ctx.clearRect(
            0,
            0,
            this.config.canvasSize.width,
            this.config.canvasSize.height
        );

        // Dessin des bordures à rebond
        this.state.bouncingEdges.forEach( theEdge => {
            theEdge.draw();
        });

        // Dessin des briques
        this.state.bricks.forEach( theBrick => {
            theBrick.draw();
        });

        // Dessin des lasers
        this.state.lasers.forEach( laser => {
            laser.draw();
        });

        // Dessin des power-ups
        this.state.powerups.forEach( powerup => {
            if (powerup.active) {
                powerup.draw(this.ctx);
            }
        });

        // Dessin du paddle
        this.state.paddle.draw();

        // Dessin des balles
        this.state.balls.forEach( theBall => {
            theBall.draw();
        });

    }

    // Boucle d'animation
    loop(stamp) {
        // Enregistrement du stamp actuel
        this.currentLoopStamp = stamp;
        
        // Cycle 1
        this.checkUserInput();

        // Cycle 2
        this.checkCollisions();

        // Cycle 3
        this.updateObjects();

        // Cycle 4
        this.renderObjects();

        // S'il n'y a aucune balle restante, on a perdu
        if( this.state.balls.length <= 0 ) {
            console.log( "Kaboooooooom !!!");
            // On sort de loop()
            return;
        }

        // Appel de la frame suivante
        requestAnimationFrame( this.loop.bind(this) );
    }

    // Fonction de test inutile dans le jeu
    drawTest() {
        this.ctx.beginPath();
        this.ctx.fillStyle = '#fc0';
        this.ctx.arc(400, 300, 100, 0, Math.PI * 2 - Math.PI / 3);
        this.ctx.closePath();
        this.ctx.fill();
    }

    // debug info
    addDebugInfo( label, value ) {
        this.debugInfo += label + ': ' + value + '<br>';
    }

    // Gestionnaires d'événement DOM
    handlerKeyboard( isActive, evt ) {
        // Pour certains navigateurs anciens les noms sont différents, la doc :
        // https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
        
        // Flèche droite
        if( evt.key === 'Right' || evt.key === 'ArrowRight' ) {
            // Si on souhaite activer "droite" mais que gauche est déjà activé, on désactive gauche
            if( isActive && this.state.userInput.paddleLeft )
                this.state.userInput.paddleLeft = false;

            this.state.userInput.paddleRight = isActive;
        }
        // Flèche gauche
        else if( evt.key === 'Left' || evt.key === 'ArrowLeft' ) {
            // Si on souhaite activer "gauche" mais que droite est déjà activé, on désactive droite
            if( isActive && this.state.userInput.paddleRight )
                this.state.userInput.paddleRight = false;

            this.state.userInput.paddleLeft = isActive;
        }
        else if( evt.key === ' ' || evt.key === 'Spacebar' ) {
            this.state.userInput.shoot = isActive;
        }

    }
}

const theGame = new Game(customConfig, levelsConfig);

export default theGame;