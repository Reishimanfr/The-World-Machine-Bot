class Mutex {
  private isLocked = false;
  private queue: (() => any)[] = [];

  lock(): Promise<void> {
    return new Promise<void>((resolve) => {
      const aquireLock = () => {
        if (!this.isLocked) {
          this.isLocked = true
          resolve()
        } else {
          this.queue.push(aquireLock)
        }
      }

      aquireLock();
    })
  }

  unlock(): void {
    if (this.isLocked) {
      this.isLocked = false

      const nextLock = this.queue.shift()
      if (nextLock) {
        nextLock()
      }
    }
  }
}

export default Mutex