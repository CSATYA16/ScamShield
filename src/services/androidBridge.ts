import { Capacitor, registerPlugin } from '@capacitor/core';
import type { ThreatRecord } from '../types/scamshield';

export interface NotificationAccessStatus {
  isGranted: boolean;
  isConnected: boolean;
  status: 'LISTENING' | 'NOT_LISTENING' | 'WEB_SIMULATION';
}

interface ScamShieldBridgePluginInterface {
  checkNotificationAccess(): Promise<{ isGranted: boolean; isConnected: boolean; status: string }>;
  requestNotificationAccess(): Promise<{ opened: boolean }>;
  getPendingThreats(): Promise<{ threats: ThreatRecord[] }>;
  clearPendingThreats(): Promise<{ cleared: boolean }>;
  simulateNativeNotification(params?: {
    sender?: string;
    channel?: string;
    message?: string;
  }): Promise<{ success: boolean; threat: ThreatRecord }>;
  addListener(
    eventName: 'threatDetected',
    listenerFunc: (threat: ThreatRecord) => void
  ): Promise<{ remove: () => void }>;
}

const ScamShieldBridge = registerPlugin<ScamShieldBridgePluginInterface>('ScamShieldBridge');

export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export async function checkAndroidNotificationAccess(): Promise<NotificationAccessStatus> {
  if (!isNativeAndroid()) {
    return {
      isGranted: true,
      isConnected: false,
      status: 'WEB_SIMULATION',
    };
  }

  try {
    const res = await ScamShieldBridge.checkNotificationAccess();
    return {
      isGranted: res.isGranted,
      isConnected: res.isConnected,
      status: res.isGranted ? 'LISTENING' : 'NOT_LISTENING',
    };
  } catch (err) {
    console.warn('[ScamShieldBridge] checkNotificationAccess error:', err);
    return {
      isGranted: false,
      isConnected: false,
      status: 'NOT_LISTENING',
    };
  }
}

export async function requestAndroidNotificationAccess(): Promise<boolean> {
  if (!isNativeAndroid()) {
    return true;
  }
  try {
    const res = await ScamShieldBridge.requestNotificationAccess();
    return Boolean(res.opened);
  } catch (err) {
    console.error('[ScamShieldBridge] requestNotificationAccess error:', err);
    return false;
  }
}

export async function getPendingNativeThreats(): Promise<ThreatRecord[]> {
  if (!isNativeAndroid()) return [];
  try {
    const res = await ScamShieldBridge.getPendingThreats();
    return res.threats || [];
  } catch (err) {
    console.warn('[ScamShieldBridge] getPendingThreats error:', err);
    return [];
  }
}

export async function triggerNativeTestNotification(params: {
  sender: string;
  channel: string;
  message: string;
}): Promise<ThreatRecord | null> {
  if (!isNativeAndroid()) return null;
  try {
    const res = await ScamShieldBridge.simulateNativeNotification(params);
    return res.threat || null;
  } catch (err) {
    console.error('[ScamShieldBridge] simulateNativeNotification error:', err);
    return null;
  }
}

export function subscribeToNativeThreats(
  onThreat: (threat: ThreatRecord) => void
): () => void {
  if (!isNativeAndroid()) {
    return () => {};
  }

  let cleanup: (() => void) | null = null;
  ScamShieldBridge.addListener('threatDetected', (threat: ThreatRecord) => {
    onThreat(threat);
  }).then((handle) => {
    cleanup = () => handle.remove();
  }).catch((err) => {
    console.warn('[ScamShieldBridge] addListener error:', err);
  });

  return () => {
    if (cleanup) cleanup();
  };
}
