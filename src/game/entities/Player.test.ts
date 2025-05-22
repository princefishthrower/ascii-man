import Player from './Player';
import * as PIXI from 'pixi.js';

// Mock PIXI.Application
jest.mock('pixi.js', () => {
  const originalModule = jest.requireActual('pixi.js');
  return {
    ...originalModule,
    Application: jest.fn().mockImplementation(() => ({
      stage: {
        addChild: jest.fn(),
        removeChild: jest.fn(),
      },
      ticker: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      // Add any other properties/methods that Player constructor might use
    })),
    Container: jest.fn().mockImplementation(() => ({
      addChild: jest.fn(),
      removeChild: jest.fn(),
      position: {
        set: jest.fn(),
      },
    })),
    Text: jest.fn().mockImplementation(() => ({
      // Mock Text properties and methods if needed
    })),
  };
});

describe('Player', () => {
  let app: PIXI.Application;
  let player: Player;

  beforeEach(() => {
    // Create a new mocked PIXI.Application for each test
    app = new PIXI.Application() as unknown as PIXI.Application; // Type assertion
    player = new Player(app, { x: 0, y: 0 });
  });

  describe('land()', () => {
    it('should correctly position the player on a platform and reset jump state', () => {
      const platformY = 550;
      const playerCollisionHeight = player.getSize().height;

      // Simulate player jumping before landing
      player.update(1, { left: false, right: false, jump: true, shoot: false }); // Make isJumping true
      
      player.land(platformY);

      // Assert that player.getPosition().y is equal to platformY - playerCollisionHeight - 25 (due to existing offset in land method).
      // The land method calculates: this.state.position.y = platformY - this.state.size.height - 25;
      // And getPosition().y returns this.state.position.y + 25
      // So, getPosition().y should be (platformY - this.state.size.height - 25) + 25 = platformY - this.state.size.height
      expect(player.getPosition().y).toBe(platformY - playerCollisionHeight);
      
      expect(player.getVelocity().y).toBe(0);
      expect(player.isJumping()).toBe(false);
    });
  });
});
