class Mutex {
  private isLocked = false
  private queue: (() => unknown)[] = []

  lock(): Promise<void> {
    return new Promise<void>((resolve) => {
      const acquireLock = () => {
        if (!this.isLocked) {
          this.isLocked = true
          resolve()
        } else {
          this.queue.push(acquireLock)
        }
      }

      acquireLock()
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