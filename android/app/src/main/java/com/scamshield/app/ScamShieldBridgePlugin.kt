package com.scamshield.app

import android.content.Intent
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONObject

@CapacitorPlugin(name = "ScamShieldBridge")
class ScamShieldBridgePlugin : Plugin() {

    override fun load() {
        super.load()
        // Register bridge callback for live notifications
        ScamShieldNotificationService.activeThreatListener = { threatRecord ->
            try {
                val jsObj = JSObject.fromJSONObject(threatRecord)
                notifyListeners("threatDetected", jsObj)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    @PluginMethod
    fun checkNotificationAccess(call: PluginCall) {
        val context = context ?: return call.reject("No context available")
        val pkgName = context.packageName
        val enabledPackages = NotificationManagerCompat.getEnabledListenerPackages(context)
        val isGranted = enabledPackages.contains(pkgName)
        val isConnected = ScamShieldNotificationService.isServiceConnected

        val ret = JSObject().apply {
            put("isGranted", isGranted)
            put("isConnected", isConnected)
            put("status", if (isGranted) "LISTENING" else "NOT_LISTENING")
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun requestNotificationAccess(call: PluginCall) {
        val activity = activity ?: return call.reject("No activity available")
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            activity.startActivity(intent)
            call.resolve(JSObject().put("opened", true))
        } catch (e: Exception) {
            call.reject("Could not open notification settings: ${e.message}")
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
        val sender = call.getString("sender", "+91 98765 43210") ?: "+91 98765 43210"
        val channel = call.getString("channel", "WhatsApp") ?: "WhatsApp"
        val message = call.getString("message", "Delhi Police Cyber Cell: Your Aadhaar is linked to money laundering. Digital arrest warrant issued. Contact immediately.") ?: ""

        val analysis = NativeThreatAnalyzer.analyze(message, sender, channel)
        val threatId = "thr-sim-${System.currentTimeMillis()}"

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

        ScamShieldNotificationService.recentThreats.add(0, threatRecord)
        notifyListeners("threatDetected", JSObject.fromJSONObject(threatRecord))

        call.resolve(JSObject().apply {
            put("success", true)
            put("threat", JSObject.fromJSONObject(threatRecord))
        })
    }
}
