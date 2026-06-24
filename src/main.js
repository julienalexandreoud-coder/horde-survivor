import { Game } from './game.js';
import { initSDK, getSDK } from './sdk/crazygames.js';

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);

async function main() {
    try {
        await initSDK();
        const sdk = getSDK();
        if (sdk) {
            sdk.game.loadingStart();
        }
    } catch (e) {
        console.log('SDK not available, running without it');
    }
    game.start();
}

main();

export { game };
