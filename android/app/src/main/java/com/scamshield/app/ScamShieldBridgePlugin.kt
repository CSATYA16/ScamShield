package com.scamshield.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import org.json.JSONObject

@CapacitorPlugin(
    name = "ScamShieldBridge",
    permissions = [
        Permission(
            strings = [Manifest.permission.POST_NOTIFICATIONS],
            alias = "notifications"
        )
    ]
)
class ScamShieldBridgePlugin : Plugin() {

    companion object {
        private const val TAG = "ScamShieldBridge"
    }

    override fun load() {
        super.load()
        Log.i(TAG, "ScamShieldBridgePlugin loaded.")
        // Register bridge callback for live notifications
        ScamShieldNotificationService.activeThreatListener = { threatRecord ->
            try {
                val jsObj = JSObject.fromJSONObject(threatRecord)
                notifyListeners("threatDetected", jsObj)
            } catch (e: Exception) {
                Log.e(TAG, "Error in activeThreatListener: ${e.message}", e)
            }
        }
    }

    @PluginMethod
    fun checkNotificationAccess(call: PluginCall) {
        val ctx = context ?: return call.reject("No context available")
        val pkgName = ctx.packageName
        val enabledPackages = NotificationManagerCompat.getEnabledListenerPackages(ctx)
        val isGranted = enabledPackages.contains(pkgName)
        val isConnected = ScamShieldNotificationService.isServiceConnected
        val canPostNotifications = NotificationManagerCompat.from(ctx).areNotificationsEnabled()

        Log.i(TAG, "checkNotificationAccess: listenerGranted=$isGranted, listenerConnected=$isConnected, canPostNotifs=$canPostNotifications")

        val ret = JSObject().apply {
            put("isGranted", isGranted)
            put("isConnected", isConnected)
            put("canPostNotifications", canPostNotifications)
            put("status", if (isGranted) "LISTENING" else "NOT_LISTENING")
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun requestNotificationAccess(call: PluginCall) {
        val act = activity ?: return call.reject("No activity available")
        try {
            Log.i(TAG, "Opening ACTION_NOTIFICATION_LISTENER_SETTINGS")
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            act.startActivity(intent)
            call.resolve(JSObject().put("opened", true))
        } catch (e: Exception) {
            Log.e(TAG, "Could not open notification settings: ${e.message}", e)
            call.reject("Could not open notification settings: ${e.message}")
        }
    }

    @PluginMethod
    fun checkPostNotificationPermission(call: PluginCall) {
        val ctx = context ?: return call.reject("No context available")
        val areEnabled = NotificationManagerCompat.from(ctx).areNotificationsEnabled()
        val ret = JSObject().apply {
            put("granted", areEnabled)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun requestPostNotificationPermission(call: PluginCall) {
        val ctx = context ?: return call.reject("No context available")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ctx.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                Log.i(TAG, "Requesting POST_NOTIFICATIONS runtime permission via Capacitor")
                requestPermissionForAlias("notifications", call, "notificationsPermCallback")
                return
            }
        }
        val areEnabled = NotificationManagerCompat.from(ctx).areNotificationsEnabled()
        call.resolve(JSObject().put("granted", areEnabled))
    }

    @PermissionCallback
    private fun notificationsPermCallback(call: PluginCall) {
        val ctx = context
        val areEnabled = if (ctx != null) NotificationManagerCompat.from(ctx).areNotificationsEnabled() else false
        Log.i(TAG, "notificationsPermCallback returned: areEnabled=$areEnabled")
        call.resolve(JSObject().put("granted", areEnabled))
    }

    @PluginMethod
    fun openAppNotificationSettings(call: PluginCall) {
        val ctx = context ?: return call.reject("No context available")
        try {
            Log.i(TAG, "Opening App Notification Settings for ${ctx.packageName}")
            val intent = Intent().apply {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    action = Settings.ACTION_APP_NOTIFICATION_SETTINGS
                    putExtra(Settings.EXTRA_APP_PACKAGE, ctx.packageName)
                } else {
                    action = Settings.ACTION_APPLICATION_DETAILS_SETTINGS
                    data = Uri.fromParts("package", ctx.packageName, null)
                }
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            ctx.startActivity(intent)
            call.resolve(JSObject().put("opened", true))
        } catch (e: Exception) {
            Log.e(TAG, "Could not open app notification settings: ${e.message}", e)
            call.reject("Failed to open settings: ${e.message}")
        }
    }

    @PluginMethod
    fun getPendingThreats(call: PluginCall) {
        val threatsArray = JSArray()
        for (threat in ScamShieldNotificationService.recentThreats) {
            threatsArray.put(JSObject.fromJSONObject(threat))
        }
        val ret = JSObject().apply {
            put("threats", threatsArray)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun clearPendingThreats(call: PluginCall) {
        ScamShieldNotificationService.recentThreats.clear()
        call.resolve(JSObject().put("cleared", true))
    }

    @PluginMethod
    fun simulateNativeNotification(call: PluginCall) {
        val ctx = context ?: return call.reject("No Android context available")
        val sender = call.getString("sender", "+91 98114 02918") ?: "+91 98114 02918"
        val channel = call.getString("channel", "WhatsApp") ?: "WhatsApp"
        val message = call.getString(
            "message",
            "Delhi Police Cyber Cell: You are under digital arrest for money laundering. Transfer ₹50,000 immediately to avoid arrest."
        ) ?: ""

        Log.i(TAG, "simulateNativeNotification invoked -> sender: $sender, channel: $channel, message: $message")

        // 1. Verify Android system notification permission
        val areNotificationsEnabled = NotificationManagerCompat.from(ctx).areNotificationsEnabled()
        Log.i(TAG, "Current app notifications enabled status: $areNotificationsEnabled")

        if (!areNotificationsEnabled) {
            Log.w(TAG, "App notifications are blocked in Android Settings!")
            call.reject("Android notifications are disabled for ScamShield. Please allow notifications in App Info.")
            return
        }

        try {
            // 2. Perform native scam threat analysis
            val analysis = NativeThreatAnalyzer.analyze(message, sender, channel)
            val threatId = "thr-sim-${System.currentTimeMillis()}"

            // 3. ACTUALLY FIRE THE NATIVE ANDROID SYSTEM NOTIFICATION
            val notificationId = ScamShieldNotificationService.postNativeAlert(
                context = ctx,
                threatId = threatId,
                channel = channel,
                sender = sender,
                message = message,
                analysis = analysis
            )
            Log.i(TAG, "Successfully fired native Android alert #$notificationId into status bar tray!")

            // 4. Record threat object
            val threatRecord = JSONObject().apply {
                put("id", threatId)
                put("timestamp", java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).format(java.util.Date()))
                put("channel", channel)
                put("sender", sender)
                put("message", message)
                put("packageName", if (channel == "WhatsApp") "com.whatsapp" else "com.google.android.apps.messaging")
                put("analysis", analysis.toJsonObject())
                put("protectionAction", when (analysis.riskLevel) {
                    "CRITICAL", "HIGH" -> "Simulated Block & Isolation"
                    "SUSPICIOUS" -> "Warned User"
                    else -> "Allowed (Safe)"
                })
                put("reportStatus", "Not Reported")
                put("isLiveNativeInterception", true)
            }

            // 5. Store in recent queue and notify web listeners
            ScamShieldNotificationService.recentThreats.add(0, threatRecord)
            notifyListeners("threatDetected", JSObject.fromJSONObject(threatRecord))

            val response = JSObject().apply {
                put("success", true)
                put("notificationId", notificationId)
                put("threat", JSObject.fromJSONObject(threatRecord))
            }
            call.resolve(response)

        } catch (e: Exception) {
            Log.e(TAG, "Failed to fire native notification: ${e.message}", e)
            call.reject("Failed to generate native notification: ${e.message}")
        }
    }
}
