# Wordle

A simple implementation of the popular word game Wordle, built with a Node.js and Express backend, and a plain HTML, CSS, and JavaScript frontend.

## About The Project

This project is a web-based version of Wordle. The backend server handles game logic like providing the word of the day, while the frontend provides the user interface for playing the game.

## Project Structure

- `server.js`: The main backend file, running an Express server.
- `public/`: This directory contains all the frontend files.
  - `index.html`: The main HTML file for the game.
  - `style.css`: The stylesheet for the game.
  - `script.js`: The JavaScript file containing the game logic.
- `package.json`: Defines the project dependencies and scripts.
- `README.md`: This file.

## Getting Started

This project is also deployed as a Docker image on Docker Hub. You can find the image at: [https://hub.docker.com/r/adithya3403/wordle-app](https://hub.docker.com/r/adithya3403/wordle-app)

### Running with Docker

To run the application using Docker, ensure you have Docker installed on your machine.

1. Pull the Docker image:
   ```sh
   docker pull adithya3403/wordle-app
   ```
2. Run the Docker container:
   ```sh
   docker run -p 3000:3000 adithya3403/wordle-app
   ```
   The application will be accessible at `http://localhost:3000` in your web browser.

### Local Development

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

#### Prerequisites

You need to have Node.js and npm installed on your machine.

* [Node.js](https://nodejs.org/)
* [npm](https://www.npmjs.com/get-npm)

#### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/adithya3403/wordle.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

## Usage

To start the server, run the following command:

```sh
npm start
```

The server will start, and you can play the game by navigating to `http://localhost:3000` in your web browser.

## Dependencies

### Backend
* [axios](https://www.npmjs.com/package/axios): Promise based HTTP client for the browser and node.js
* [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for node.

### Frontend
This project uses no external frontend libraries. It is built with plain HTML, CSS and JavaScript.