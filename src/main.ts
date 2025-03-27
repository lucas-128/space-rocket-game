import Game from './components/Game';

// Hide loading screen immediately
document.getElementById('loading-screen')?.classList.add('hidden');

// Start the game immediately with a default username
const game = new Game();
game.init();

// Handle window resize
window.addEventListener('resize', () => {
    game.handleResize();
});
