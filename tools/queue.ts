export class Queue<T> {
  private items: T[] = [];
  public alreadyQueued = new Set<T>();

  public info(): string {
    return `Queue:${this.size};${this.alreadyQueued.size}`;
  }

  // Ajouter un élément à la fin de la file d'attente
  enqueue(item: T, priority: boolean = true): void {
    if (this.alreadyQueued.has(item)) {
      console.log(`${item} already`);
      return;
    }
    this.alreadyQueued.add(item);
    console.log(`${item} enqueued`);
    if (priority) {
      this.items.unshift(item);
    } else {
      this.items.push(item);
    }
  }

  enqueueAll(priority: T[], regular: T[]): void {
    for (const item of priority) {
      this.enqueue(item, true);
    }
    for (const item of regular) {
      this.enqueue(item, false);
    }
  }

  // Retirer un élément du début de la file d'attente
  dequeue(): T | undefined {
    const item = this.items.shift();
    console.log(`${item} dequeued`);
    return item;
  }

  // Vérifier si la file d'attente est vide
  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Obtenir l'élément au début de la file d'attente sans le retirer
  peek(): T | undefined {
    return this.items[0];
  }

  // Obtenir la taille de la file d'attente
  get size(): number {
    return this.items.length;
  }
}
