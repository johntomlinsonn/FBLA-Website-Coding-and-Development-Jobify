class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      memory: 0,
      loadTime: 0
    };
    this.lastTime = performance.now();
    this.frames = 0;
    this.isMonitoring = false;
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.monitorFPS();
    this.monitorMemory();
  }

  stopMonitoring() {
    this.isMonitoring = false;
  }

  monitorFPS() {
    if (!this.isMonitoring) return;

    const now = performance.now();
    this.frames++;

    if (now >= this.lastTime + 1000) {
      this.metrics.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
      this.frames = 0;
      this.lastTime = now;

      // Emit performance warning if FPS is too low
      if (this.metrics.fps < 30) {
        this.onPerformanceWarning('fps', this.metrics.fps);
      }
    }

    requestAnimationFrame(() => this.monitorFPS());
  }

  monitorMemory() {
    if (!this.isMonitoring) return;

    if (performance.memory) {
      this.metrics.memory = performance.memory.usedJSHeapSize;
      
      // Emit warning if memory usage is too high
      if (this.metrics.memory > 500 * 1024 * 1024) { // 500MB
        this.onPerformanceWarning('memory', this.metrics.memory);
      }
    }

    setTimeout(() => this.monitorMemory(), 1000);
  }

  onPerformanceWarning(type, value) {
    // Dispatch custom event for performance warnings
    const event = new CustomEvent('performanceWarning', {
      detail: { type, value }
    });
    window.dispatchEvent(event);
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

export const performanceMonitor = new PerformanceMonitor(); 