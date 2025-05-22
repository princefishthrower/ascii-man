interface GameInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  shoot: boolean;
}

export default class InputManager {
  private keys: Record<string, boolean> = {};
  
  constructor() {
    // Set up event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  private handleKeyDown(e: KeyboardEvent): void {
    this.keys[e.code] = true;
    e.preventDefault(); // Prevent default browser behavior for game controls
  }
  
  private handleKeyUp(e: KeyboardEvent): void {
    this.keys[e.code] = false;
    e.preventDefault(); // Prevent default browser behavior for game controls
  }
  
  getInput(): GameInput {
    return {
      left: !!this.keys['ArrowLeft'],
      right: !!this.keys['ArrowRight'],
      jump: !!this.keys['Space'],
      shoot: !!this.keys['KeyZ']
    };
  }
  
  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}