import { Capacitor, registerPlugin } from '@capacitor/core';
import type { ThreatRecord } from '../types/scamshield';

export interface NotificationAccessStatus {
  isGranted: boolean;
  isConnected: boolean;
  canPostNotifications: boolean;
  status: 'LISTENING' | 'NOT_LISTENING' | 'WEB_SIMULATION';
}

export interface NativeTestResult {
  success: boolean;
  notificationId?: number;
  threat?: ThreatRecord;
  error?: string;
  needsPermission?: boolean;
}

interface ScamShieldBridgePluginInterface {
  checkNotificationAccess(): Promise<{
    isGranted: boolean;
    isConnected: boolean;
    canPostNotifications?: boolean;
    status: string;
  }>;
  requestNotificationAccess(): Promise<{ opened: boolean }>;
  checkPostNotificationPermission(): Promise<{ granted: boolean }>;
  requestPostNotificationPermission(): Promise<{ granted: boolean }>;
  openAppNotificationSettings(): Promise<{ opened: boolean }>;
  checkCameraPermission?(): Promise<{ granted: boolean }>;
  requestCameraPermission?(): Promise<{ granted: boolean }>;
  getPendingThreats(): Promise<{ threats: ThreatRecord[] }>;
  clearPendingThreats(): Promise<{ cleared: boolean }>;
  simulateNativeNotification(params?: {
    sender?: string;
    channel?: string;
    message?: string;
  }): Promise<{ success: boolean; notificationId?: number; threat?: ThreatRecord }>;
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
      canPostNotifications: true,
      status: 'WEB_SIMULATION',
    };
  }

  try {
    const res = await ScamShieldBridge.checkNotificationAccess();
    return {
      isGranted: Boolean(res.isGranted),
      isConnected: Boolean(res.isConnected),
      canPostNotifications: res.canPostNotifications ?? true,
      status: res.isGranted ? 'LISTENING' : 'NOT_LISTENING',
    };
  } catch (err) {
    console.warn('[ScamShieldBridge] checkNotificationAccess error:', err);
    return {
      isGranted: false,
      isConnected: false,
      canPostNotifications: false,
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

export async function requestPostNotificationPermission(): Promise<boolean> {
  if (!isNativeAndroid()) return true;
  try {
    const res = await ScamShieldBridge.requestPostNotificationPermission();
    return Boolean(res.granted);
  } catch (err) {
    console.error('[ScamShieldBridge] requestPostNotificationPermission error:', err);
    return false;
  }
}

export async function openAppNotificationSettings(): Promise<boolean> {
  if (!isNativeAndroid()) return true;
  try {
    const res = await ScamShieldBridge.openAppNotificationSettings();
    return Boolean(res.opened);
  } catch (err) {
    console.error('[ScamShieldBridge] openAppNotificationSettings error:', err);
    return false;
  }
}

export async function requestAndroidCameraPermission(): Promise<boolean> {
  if (!isNativeAndroid()) return true;
  try {
    const res = await ScamShieldBridge.requestCameraPermission?.();
    return Boolean(res?.granted);
  } catch (err) {
    console.warn('[ScamShieldBridge] requestCameraPermission error:', err);
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
}): Promise<NativeTestResult> {
  if (!isNativeAndroid()) {
    return {
      success: true,
      error: undefined,
    };
  }

  try {
    // 1. Ensure Android 13+ POST_NOTIFICATIONS is requested if needed
    await requestPostNotificationPermission();

    // 2. Fire the native notification
    const res = await ScamShieldBridge.simulateNativeNotification(params);
    return {
      success: Boolean(res.success),
      notificationId: res.notificationId,
      threat: res.threat,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[ScamShieldBridge] simulateNativeNotification error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
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
