export class QueueItem<T> {
  public data: T;
  public level: number;

  constructor(data: T, level: number) {
    this.data = data;
    this.level = level;
  }
}

export class Queue<T> {
  private items: QueueItem<T>[] = [];
  public alreadyQueued = new Set<T>();

  public info(): string {
    return `Queue:${this.size};${this.alreadyQueued.size}`;
  }

  // Ajouter un élément à la fin de la file d'attente
  enqueue(item: T, level: number, priority: boolean = true): void {
    if (this.alreadyQueued.has(item)) {
      console.log(`${item} already`);
      return;
    }
    if (level === 0) {
      console.log(`${item} zero`);
      return;
    }
    this.alreadyQueued.add(item);
    console.log(`${item} enqueued ${priority ? "prio" : "reg"} (${level})`);
    if (priority) {
      this.items.unshift(new QueueItem<T>(item, level));
    } else {
      this.items.push(new QueueItem<T>(item, level));
    }
  }

  enqueueAll(priority: T[], regular: T[], level: number): void {
    for (const item of priority) {
      this.enqueue(item, level, true);
    }
    for (const item of regular) {
      this.enqueue(item, level - 1, false);
    }
  }

  // Retirer un élément du début de la file d'attente
  dequeue(): QueueItem<T> | undefined {
    const item = this.items.shift();
    console.log(`${item?.data} dequeued (${item?.level})`);
    return item;
  }

  // Vérifier si la file d'attente est vide
  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Obtenir la taille de la file d'attente
  get size(): number {
    return this.items.length;
  }
}
