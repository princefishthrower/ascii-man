interface GameInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  shoot: boolean;
}

export default class InputManager {
  private keys: Record<string, boolean> = {};
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleKeyUp: (e: KeyboardEvent) => void;
  
  constructor() {
    // Bind methods once and store the bound functions
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    
    // Set up event listeners
    window.addEventListener('keydown', this.boundHandleKeyDown);
    window.addEventListener('keyup', this.boundHandleKeyUp);
    
    // Debug message confirming InputManager is initialized
    console.log('InputManager initialized');
  }
  
  private handleKeyDown(e: KeyboardEvent): void {
    // Always log key events for debugging
    console.log('Key pressed:', e.code);
    
    // For Z key, add extra logging
    if (e.code === 'KeyZ') {
      console.log('Z key pressed - should fire weapon');
    }
    
    this.keys[e.code] = true;
    
    // Only prevent default for arrow keys and space to avoid interfering with other keys
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'ArrowUp' || 
        e.code === 'ArrowDown' || e.code === 'Space') {
      e.preventDefault();
    }
  }
  
  private handleKeyUp(e: KeyboardEvent): void {
    console.log('Key released:', e.code);
    this.keys[e.code] = false;
    
    // Only prevent default for arrow keys and space
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'ArrowUp' || 
        e.code === 'ArrowDown' || e.code === 'Space') {
      e.preventDefault();
    }
  }
  
  getInput(): GameInput {
    const input = {
      left: !!this.keys['ArrowLeft'],
      right: !!this.keys['ArrowRight'],
      jump: !!this.keys['Space'],
      shoot: !!this.keys['KeyZ']
    };
    
    // Log when shoot is true
    if (input.shoot) {
      console.log('Shoot input detected in getInput()');
    }
    
    return input;
  }
  
  destroy(): void {
    window.removeEventListener('keydown', this.boundHandleKeyDown);
    window.removeEventListener('keyup', this.boundHandleKeyUp);
  }
}