# antiamigo

Multiplayer browser game based on idea of Towerfall Ascension, implemented using Phaser, WebSockets

## General TODO

- [ ] Design the minimum functionality:

  1. Multiplayer
  2. Different sprite for each player
  3. Side screen with all players (box containing player's information [nr. of arrows, points])
  4. Game mode: TimeAttack / Points
  5. Bonuses (treasure): More arrows
  6. 3 States: `Start Game`, `Game`, `End Game`
  7. Low light (simulate towerfall light conditions)

- [ ] Download all js libraries and store offline (rexui, phaser)
- [ ] Handle one single game (one room for 4 players) => TODO: Handle more parallel games
- [x] Select maximum limit of players for multiplayer **4**
- [x] Choose sprites for players
- [x] Kill-by-Jump-On-Head Feature
- [x] Remove world bounds
- [x] Lobby
- [ ] Score Board
- [ ] Find game map + Create
- [ ] Design: Center canvas + set the copyrights
- [ ] Kill-by-Arrow Feature
- [ ] Find sprites for arrow
- [ ] Add sounds
- [ ] Add more Bonuses: Wings, Bonus Arrow, Speedies... TBA
- [x] Split in modules

## TODO in Depth

- [ ] Stop filling players when limit == 4 achieved.
- [ ] Solve crashes that appear sometimes when someone is leaving lobby
- [x] Handle already Started Game - don't allow other players to connect
- [ ] Do not destroy "dissapear" sprite each time (just on endgame)
- [ ] Handle Death ? (Do not detroy player, just kill)
- [ ] Add text on main screen + mock img + show joined players + setPlayerName
- [ ] What the fuck is : `.setScale(2).refreshBody();` applied on bottom platform?
- [ ] Add Scoring Board (lateral / top)
- [x] Fix right/left move when player is jumping
- [x] Add loading bar in Preloader
- [x] Add animation on kill
- [x] Delete branches of done features
- [x] Add lobby
- [x] Double jump
- [x] Fix jump on head
- [x] Add bounce when player kills oponent jumping on head

## Resources

- https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-1/
- https://www.youtube.com/watch?v=PfSwUOBL1YQ&list=PLcIaPHraYF7k4FbeGIDY-1mZZdjTu9QyL&index=1
- https://github.com/nishmeht7/ArrowStorm
- https://github.com/jvelez523/IronFightr
- https://www.codeandweb.com/physicseditor/tutorials/phaser-p2-physics-example-tutorial (**Physics**)
- https://www.emanueleferonato.com/2018/05/03/the-basics-behind-jumping-on-enemies-feature-explained-with-phaser-and-arcade-physics-updated-to-phaser-3/ (**On-Head-Jump**)
- https://socket.io/docs/emit-cheatsheet/ (**Socket.IO**)
- https://www.html5gamedevs.com/topic/38994-phaser3-game-example-using-scenes-a-preloader-and-a-loading-bar/?tab=comments#comment-222636 (**States**)
- https://www.dynetisgames.com/2018/02/01/deploy-multiplayer-phaser-game-heroku/ (**Heroku**)
- https://phaser.discourse.group/t/phaser-3-real-time-multiplayer-game-with-physics/1739 (**Multiple Scenes handled**)
- https://yocton.ru/phaser3/sozdanie-mnogopolzovatelskoi-igry-v-phaser-3-s-socket-io-chast-2 (**Multiplayer Approach**)
