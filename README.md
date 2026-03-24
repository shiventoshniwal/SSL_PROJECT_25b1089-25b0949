# SSL_PROJECT_25b1089-25b0949

# Snake Game (Web-Based)

## Project Idea

We are building a browser-based Snake game where the user controls a
snake to eat food and increase score, while avoiding collisions.

------------------------------------------------------------------------

## Features

-   Snake movement using arrow keys
-   Random food generation
-   Score tracking
-   Collision detection (wall and self)
-   Start and end screens

------------------------------------------------------------------------

## Frontend Plan

We plan to use JavaScript to build an interactive game. Modals will be
used for game start and end screens for better UI.

Event handlers will be used to capture arrow key inputs for controlling
the snake. A coordinate system will be maintained to track snake
movement and detect collisions.

Food will be generated randomly on the grid using functions like
Math.random(). Classes may be used to define different types of food.

We may use frameworks like Bootstrap 5 or Phaser to improve styling and
add features.

Score updates will be handled using event listeners, and the Fetch API
will be used to send scores to the backend without interrupting
gameplay.

------------------------------------------------------------------------

## System Design

-   Grid-based board
-   Snake stored as list of coordinates
-   Game loop updates position at fixed intervals
-   Collision detection:
    -   Boundary
    -   Self

------------------------------------------------------------------------

## Notes

-   If Phaser is used, initial time will be spent learning basics
-   Focus will be on keeping implementation simple and modular
-   The design is kept simple initially, with scope for extensions like
    difficulty scaling and multiple food types

------------------------------------------------------------------------

## Team

-   Shiven Toshniwal (25B1089)
-   Rishabh Iyer (25B0979)
