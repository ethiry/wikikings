export class Queue<T> {
  private items: T[] = [];
  public alreadyProcessed = new Set<T>();
  public totalAdded = 0;

  public info(): string {
    return `Queue:${this.size} added:${this.totalAdded} already:${this.alreadyProcessed.size}`;
  }

  // Ajouter un élément à la fin de la file d'attente
  enqueue(item: T): void {
    if (this.alreadyProcessed.has(item)) {
      console.log(`${item} already processed`);
      return;
    }
    console.log(`${item} enqueued`);
    this.totalAdded++;
    this.items.push(item);
  }

  enqueueAll(items: T[]): void {
    for (const item of items) {
      this.enqueue(item);
    }
  }

  // Retirer un élément du début de la file d'attente
  dequeue(): T | undefined {
    const item = this.items.shift();
    if (item) {
      this.alreadyProcessed.add(item);
    }
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
