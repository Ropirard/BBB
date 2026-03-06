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

    // Nombre de joueurs
    numPlayers = 1;
    activePlayer = 0;

    // Statistiques des joueurs
    playerStats = [
        { score: 0, lives: 3 },
        { score: 0, lives: 3 }
    ];

    // Niveau actuel
    currentLevel = 0;

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
    // Élément d'affichage du joueur
    elCurrentPlayer;
    // Élément d'affichage du score
    elScore;
    // Élément d'affichage des vies
    elLives;
    // Élément d'affichage du niveau
    elLevel;

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

        // Création du menu d'accueil
        this.StartMenu();
    }

    StartMenu() {
        this.menuDiv = document.createElement('div');
        this.menuDiv.className = 'start-menu';

        const title = document.createElement('h1');
        title.textContent = 'Arkanoïd';

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '20px';

        const btn1P = document.createElement('button');
        btn1P.className = 'start-btn';
        btn1P.textContent = '1 JOUEUR';

        const btn2P = document.createElement('button');
        btn2P.className = 'start-btn';
        btn2P.textContent = '2 JOUEURS';

        btn1P.addEventListener('click', () => {
            this.numPlayers = 1;
            this.startGame();
        });

        btn2P.addEventListener('click', () => {
            this.numPlayers = 2;
            this.startGame();
        });

        btnContainer.append(btn1P, btn2P);
        this.menuDiv.append(title, btnContainer);
        document.body.append(this.menuDiv);
    }

    startGame() {
        this.menuDiv.remove();
        this.updateUI();
        // Lancement de la boucle
        requestAnimationFrame( this.loop.bind(this) );
    }

    showEndMenu(text) {
        const endMenu = document.createElement('div');
        endMenu.className = 'start-menu';

        const title = document.createElement('h1');
        title.textContent = text;

        const scoreDisplay = document.createElement('h2');
        if (this.numPlayers === 1) {
            scoreDisplay.textContent = 'Score final : ' + this.playerStats[0].score;
        } else {
            if (this.playerStats[0].score > this.playerStats[1].score) {
                scoreDisplay.innerHTML = `Score J1 : ${this.playerStats[0].score}<br>Score J2 : ${this.playerStats[1].score}`;
            } else {
                scoreDisplay.innerHTML = `Score J2 : ${this.playerStats[1].score}<br>Score J1 : ${this.playerStats[0].score}`;
            }
        }
        scoreDisplay.className = 'end-score';
        scoreDisplay.style.textAlign = 'center';

        const restartButton = document.createElement('button');
        restartButton.className = 'start-btn';
        restartButton.textContent = 'REJOUER';

        restartButton.addEventListener('click', () => {
            location.reload(); // Recharge la page pour relancer le jeu
        });

        endMenu.append(title, scoreDisplay, restartButton);
        document.body.append(endMenu);
    }

    // Méthodes "privées"
    initHtmlUI() {
        const elH1 = document.createElement('h1');
        elH1.textContent = 'Arkanoïd';

        this.elCurrentPlayer = document.createElement('h2');
        this.elCurrentPlayer.style.color = '#e74c3c';
        
        this.elScore = document.createElement('h2');
        this.elLives = document.createElement('h2');
        this.elLevel = document.createElement('h2');

        const elCanvas = document.createElement( 'canvas' );
        elCanvas.width = this.config.canvasSize.width;
        elCanvas.height = this.config.canvasSize.height;

        // Débug box
        this.debugSpan = document.createElement( 'span' );
        
        document.body.append( elH1, this.elCurrentPlayer, this.elScore, this.elLives, this.elLevel, elCanvas, this.debugSpan );

        // Récupération du contexte de dessin
        this.ctx = elCanvas.getContext('2d');

        // Écouteur d'évènements du clavier
        document.addEventListener( 'keydown', this.handlerKeyboard.bind(this, true) );
        document.addEventListener( 'keyup', this.handlerKeyboard.bind(this, false) );
    }

    updateUI() {
        if (this.numPlayers === 1) {
            this.elCurrentPlayer.textContent = '';
            this.elScore.textContent = 'Score : ' + this.playerStats[0].score;
            this.elLives.textContent = 'Vies : ' + this.playerStats[0].lives;
        } else {
            this.elCurrentPlayer.textContent = 'AU TOUR DU JOUEUR ' + (this.activePlayer + 1);
            this.elScore.textContent = 'Score : '  + this.playerStats[this.activePlayer].score;
            this.elLives.textContent = 'Vies : ' + this.playerStats[this.activePlayer].lives;
        }
        this.elLevel.textContent = 'Niveau : ' + (this.currentLevel + 1);
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
        this.loadBricks(this.levels.data[this.currentLevel]);
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
                    this.playerStats[this.activePlayer].score += theBrick.type * 100;
                    this.updateUI();
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
                        this.playerStats[this.activePlayer].score += theBrick.type * 100;
                        this.updateUI();
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
            const powerUpTypes = ['multiBall'];
            
            // Sélection d'un type aléatoire
            const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            
            // Création du power-up (avec une taille par défaut (ici 25 par 25) que l'on peut modifier)
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
                if (this.state.balls.length > 0) {
                    // On définit la balle 'de départ'
                    const originalBall = this.state.balls[0];
                    const ballDiameter = this.config.ball.radius * 2;
                    
                    // Création de la 1ere balle
                    let angle1 = (originalBall.orientation + 30) % 360;
                    if (angle1 === 0 || angle1 === 180) angle1 += 15;

                    const ball1 = new Ball(
                        this.images.ball,
                        ballDiameter, ballDiameter,
                        angle1,
                        originalBall.speed || this.config.ball.speed
                    );
                    ball1.setPosition(originalBall.position.x, originalBall.position.y);
                    ball1.isCircular = true;
                    
                    // Puis de la seconde
                    let angle2 = (originalBall.orientation - 30 + 360) % 360;
                    if (angle2 === 0 || angle2 === 180) angle2 -= 15;

                    const ball2 = new Ball(
                        this.images.ball,
                        ballDiameter, ballDiameter,
                        angle2,
                        originalBall.speed || this.config.ball.speed
                    );
                    ball2.setPosition(originalBall.position.x, originalBall.position.y);
                    ball2.isCircular = true;

                    this.state.balls.push(ball1, ball2);
                }
                break;
            case 'largeSmall':
                console.log("Effet: largeSmall !");
                // On choisit 60 de width (petit) ou 140 (grand)
                const newWidth = Math.random() < 0.5 ? 60 : 140;
                console.log("NOUVELLE LARGEUR : ", newWidth)
                
                // On applique tout de suite la nouvelle taille à l'objet paddle
                this.state.paddle.size.width = newWidth;
                
                // Si un minuteur était déjà en cours pour remettre le paddle à 100 on l'annule 
                if (this.powerupTimers.largeSmall) {
                    clearTimeout(this.powerupTimers.largeSmall);
                }

                // On relance un nouveau minuteur complet de 7 secondes
                this.powerupTimers.largeSmall = setTimeout(() => {
                    this.state.paddle.size.width = this.config.paddleSize.width; // Remet après 7 secondes
                    this.largeSmall = false;    
                }, 7000);
                break;
            case 'perforingBall':
                console.log("Effet: perforingBall !");
                this.perforingBullet = true; 
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

        // S'il n'y a aucune balle restante, on a perdu une vie
        if( this.state.balls.length <= 0 ) {
            this.playerStats[this.activePlayer].lives--;

            let nextPlayer = this.activePlayer;
            // Si on est en 2 joueurs, on change de joueur s'il reste des vies à l'autre joueur
            if (this.numPlayers === 2) {
                const otherPlayer = (this.activePlayer + 1) % 2;
                if (this.playerStats[otherPlayer].lives > 0) {
                    nextPlayer = otherPlayer;
                }
            }
            
            this.activePlayer = nextPlayer;
            this.updateUI();

            // S'il reste des vies au joueur actif, on continue
            if (this.playerStats[this.activePlayer].lives > 0) {
                this.resetBall();
            } else {
                // Sinon, Game Over (les deux joueurs sont morts)
                console.log("Game Over!");
                this.showEndMenu('Partie terminée');
                return;
            }
        }

        // Vérification de la victoire (plus aucune brique destructible)
        const hasBreakableBricks = this.state.bricks.some( brick => brick.strength > 0 );
        if( !hasBreakableBricks ) {
            this.currentLevel++;
            if (this.currentLevel < this.levels.data.length) {
                this.updateUI();
                // Chargement du niveau suivant
                this.loadBricks(this.levels.data[this.currentLevel]);
                
                // On vide la zone de jeu des anciens pouvoirs, lasers, et on remet une balle
                this.state.powerups = [];
                this.state.lasers = [];
                this.state.balls = [];
                this.resetBall();
            } else {
                console.log("Félicitations, vous avez terminé tous les niveaux !");
                this.showEndMenu('Victoire !');
                return; // Fin du jeu
            }
        }

        // Appel de la frame suivante
        requestAnimationFrame( this.loop.bind(this) );
    }

    resetBall() {
        const ballDiameter = this.config.ball.radius * 2;
        const ball = new Ball(
            this.images.ball,
            ballDiameter, ballDiameter,
            this.config.ball.orientation,
            this.config.ball.speed
        );
        ball.isCircular = true;
        // On la colle au paddle par défaut en son centre
        ball.isStuck = true;
        ball.stuckOffset = (this.state.paddle.size.width / 2) - (ballDiameter / 2);
        ball.setPosition(
            this.state.paddle.position.x + ball.stuckOffset,
            this.state.paddle.position.y - ball.size.height
        );
        
        // Reset des timers et power-ups optionnels
        this.perforingBullet = false;
        this.stickyBall = false;
        this.state.paddle.size.width = this.config.paddleSize.width;
        
        this.state.balls.push(ball);
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