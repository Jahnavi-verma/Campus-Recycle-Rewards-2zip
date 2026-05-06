import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export function playSuccessPing() {
  if (Platform.OS === "web") {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.5);
    } catch {
      // silent fail on unsupported browsers
    }
  } else {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}
