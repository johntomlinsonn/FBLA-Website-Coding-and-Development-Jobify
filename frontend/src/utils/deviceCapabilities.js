class DeviceCapabilities {
  constructor() {
    this.capabilities = {
      webgl: false,
      webgl2: false,
      performance: 'high',
      touch: false,
      reducedMotion: false
    };
    this.checkCapabilities();
  }

  checkCapabilities() {
    // Check WebGL support
    this.capabilities.webgl = this.checkWebGL();
    this.capabilities.webgl2 = this.checkWebGL2();

    // Check performance
    this.capabilities.performance = this.checkPerformance();

    // Check touch support
    this.capabilities.touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Check reduced motion preference
    this.capabilities.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Listen for changes in reduced motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.capabilities.reducedMotion = e.matches;
      this.onCapabilityChange('reducedMotion', e.matches);
    });
  }

  checkWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  checkWebGL2() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
      return false;
    }
  }

  checkPerformance() {
    if (!navigator.hardwareConcurrency) return 'low';
    
    const cores = navigator.hardwareConcurrency;
    if (cores <= 2) return 'low';
    if (cores <= 4) return 'medium';
    return 'high';
  }

  onCapabilityChange(capability, value) {
    // Dispatch custom event for capability changes
    const event = new CustomEvent('capabilityChange', {
      detail: { capability, value }
    });
    window.dispatchEvent(event);
  }

  getCapabilities() {
    return { ...this.capabilities };
  }

  shouldUseReducedMotion() {
    return this.capabilities.reducedMotion;
  }

  shouldUse3D() {
    return this.capabilities.webgl && this.capabilities.performance !== 'low';
  }

  shouldUseTouch() {
    return this.capabilities.touch;
  }
}

export const deviceCapabilities = new DeviceCapabilities(); 