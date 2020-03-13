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

- [x] Select maximum limit of players for multiplayer **4**
- [x] Choose sprites for players
- [x] Kill-by-Jump-On-Head Feature
- [ ] Score Board
- [ ] Lobby
- [ ] Find game map + Create
- [ ] Design: Center canvas + set the copyrights
- [ ] Kill-by-Arrow Feature
- [ ] Find sprites for arrow
- [ ] Add sounds
- [ ] Add more Bonuses: Wings (maybe?!?!)... TBA

## TODO in Depth

- [x] Add animation on kill
- [ ] Delete branches of done features
- [ ] What the fuck is : `.setScale(2).refreshBody();` applied on bottom platform?
- [ ] Add Scoring Board (lateral / top)
- [ ] Add lobby
- [ ] Double jump
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
