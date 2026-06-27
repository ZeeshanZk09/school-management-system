/**
 * Triggers a subtle haptic vibration if supported by the device.
 * @param type 'success' | 'error' | 'warning' | 'light'
 */
export const triggerHaptic = (type: "error" | "light" | "success" | "warning" = "light") => {
  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
    switch (type) {
      case "success":
        window.navigator.vibrate([10, 30, 10]);
        break;
      case "error":
        window.navigator.vibrate([50, 50, 50]);
        break;
      case "warning":
        window.navigator.vibrate([30, 30]);
        break;
      case "light":
      default:
        window.navigator.vibrate(10);
        break;
    }
  }
};

/**
 * Plays a subtle success sound.
 * Using a minimal base64 encoded "pop" sound.
 */
export const playSuccessSound = () => {
  if (typeof window !== "undefined") {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAD///8A",
    );
    audio.volume = 0.2;
    audio.play().catch(() => {
      // Ignore errors if audio cannot be played due to browser restrictions
    });
  }
};

export const feedback = {
  success: () => {
    triggerHaptic("success");
    playSuccessSound();
  },
  error: () => {
    triggerHaptic("error");
  },
  warning: () => {
    triggerHaptic("warning");
  },
  light: () => {
    triggerHaptic("light");
  },
};
