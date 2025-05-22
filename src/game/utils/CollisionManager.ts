export default class CollisionManager {
  checkCollision(
    entity1: { 
      getPosition: () => { x: number; y: number }; 
      getSize: () => { width: number; height: number } 
    },
    entity2: { 
      getPosition: () => { x: number; y: number }; 
      getSize: () => { width: number; height: number } 
    }
  ): boolean {
    const pos1 = entity1.getPosition();
    const size1 = entity1.getSize();
    const pos2 = entity2.getPosition();
    const size2 = entity2.getSize();
    
    return (
      pos1.x < pos2.x + size2.width &&
      pos1.x + size1.width > pos2.x &&
      pos1.y < pos2.y + size2.height &&
      pos1.y + size1.height > pos2.y
    );
  }
}