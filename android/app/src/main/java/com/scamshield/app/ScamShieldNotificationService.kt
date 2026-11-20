package com.scamshield.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import androidx.core.app.NotificationCompat
import org.json.JSONObject
import java.util.concurrent.CopyOnWriteArrayList

class ScamShieldNotificationService : NotificationListenerService() {

    companion object {
        private const val TAG = "ScamShieldNotification"
        const val CHANNEL_ID = "scamshield_threat_alerts"
        const val CHANNEL_NAME = "ScamShield Threat Alerts"

        // Thread-safe in-memory cache of intercepted threats for the UI
        val recentThreats = CopyOnWriteArrayList<JSONObject>()

        // Active listener callback to bridge directly to Capacitor
        var activeThreatListener: ((JSONObject) -> Unit)? = null
        var isServiceConnected = false

        fun mapPackageToChannel(pkg: String): String {
            return when {
                pkg.contains("whatsapp") -> "WhatsApp"
                pkg.contains("messaging") || pkg.contains("mms") || pkg.contains("sms") -> "SMS"
                pkg.contains("telegram") -> "Telegram"
                pkg.contains("gm") || pkg.contains("email") || pkg.contains("mail") -> "Email"
                else -> "SMS"
            }
        }

        fun postNativeAlert(
            context: Context,
            threatId: String,
            channel: String,
            sender: String,
            message: String,
            analysis: NativeAnalysisResult
        ): Int {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // Create high-importance channel on Android 8+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channelObj = NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "High-priority security alerts for detected digital scams and threats."
                    enableVibration(true)
                    setShowBadge(true)
                }
                notificationManager.createNotificationChannel(channelObj)
            }

            // Tap intent to open ScamShield app with threat details
            val openIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("THREAT_ID", threatId)
                putExtra("THREAT_SENDER", sender)
                putExtra("THREAT_CHANNEL", channel)
                putExtra("THREAT_MESSAGE", message)
                putExtra("THREAT_RISK", analysis.riskLevel)
                putExtra("THREAT_CATEGORY", analysis.scamCategory)
            }

            val pendingIntent = PendingIntent.getActivity(
                context,
                threatId.hashCode(),
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
            )

            val title = "🚨 ScamShield Alert: ${analysis.scamCategory}"
            val bodyText = "[${analysis.riskLevel} RISK via $channel] ${analysis.simpleExplanation}"

            val builder = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.stat_sys_warning)
                .setContentTitle(title)
                .setContentText(bodyText)
                .setStyle(NotificationCompat.BigTextStyle().bigText("$bodyText\n\nIncoming from: $sender\n\"$message\""))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setVibrate(longArrayOf(0, 400, 200, 400))

            val alertNotificationId = (1000..9999).random()
            notificationManager.notify(alertNotificationId, builder.build())
            Log.i(TAG, "Fired ScamShield native alert #$alertNotificationId for $threatId")
            return alertNotificationId
        }
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        isServiceConnected = true
        Log.i(TAG, "ScamShield NotificationListenerService successfully connected and active.")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        isServiceConnected = false
        Log.w(TAG, "ScamShield NotificationListenerService disconnected.")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return

        try {
            val packageName = sbn.packageName ?: return

            // Avoid self-monitoring or system noise
            if (packageName == applicationContext.packageName) return
            if (packageName.startsWith("com.android.systemui")) return
            if (packageName.startsWith("android")) return

            val notification = sbn.notification ?: return

            // Skip ongoing background playback or sticky notifications
            val isOngoing = (notification.flags and android.app.Notification.FLAG_ONGOING_EVENT) != 0
            if (isOngoing) return

            val extras = notification.extras ?: return
            val isGroupSummaryFlag = (notification.flags and android.app.Notification.FLAG_GROUP_SUMMARY) != 0

            var sender = extras.getCharSequence(android.app.Notification.EXTRA_TITLE)?.toString()?.trim()
                ?: extras.getCharSequence(android.app.Notification.EXTRA_TITLE_BIG)?.toString()?.trim()
                ?: "Unknown Contact"
            var messageText = ""
            var sourceField = "UNKNOWN"

            // 1. Try MessagingStyle ("android.messages") - WhatsApp, Telegram, Google Messages
            val messagesObj = extras.get("android.messages")
            if (messagesObj is Array<*> && messagesObj.isNotEmpty()) {
                for (i in messagesObj.indices.reversed()) {
                    val item = messagesObj[i]
                    if (item is android.os.Bundle) {
                        val text = item.getCharSequence("text")?.toString()?.trim()
                        val msgSender = item.getCharSequence("sender")?.toString()?.trim()
                        if (!text.isNullOrBlank() && !NativeThreatAnalyzer.isSummaryNotification(text)) {
                            messageText = text
                            if (!msgSender.isNullOrBlank()) {
                                sender = msgSender
                            }
                            sourceField = "EXTRA_MESSAGES[#$i]"
                            Log.d(TAG, "Extracted individual message from $sourceField: $messageText (sender: $sender)")
                            break
                        }
                    }
                }
            }

            // 2. Try EXTRA_BIG_TEXT
            if (messageText.isBlank()) {
                val bigText = extras.getCharSequence(android.app.Notification.EXTRA_BIG_TEXT)?.toString()?.trim()
                if (!bigText.isNullOrBlank() && !NativeThreatAnalyzer.isSummaryNotification(bigText)) {
                    messageText = bigText
                    sourceField = "EXTRA_BIG_TEXT"
                    Log.d(TAG, "Extracted real message from $sourceField: $messageText")
                }
            }

            // 3. Try EXTRA_TEXT_LINES (InboxStyle lines of messages)
            if (messageText.isBlank()) {
                val lines = extras.getCharSequenceArray(android.app.Notification.EXTRA_TEXT_LINES)
                if (lines != null && lines.isNotEmpty()) {
                    for (i in lines.indices.reversed()) {
                        val line = lines[i]?.toString()?.trim()
                        if (!line.isNullOrBlank() && !NativeThreatAnalyzer.isSummaryNotification(line)) {
                            val colon = line.indexOf(':')
                            if (colon in 1..40) {
                                sender = line.substring(0, colon).trim()
                                messageText = line.substring(colon + 1).trim()
                            } else {
                                messageText = line
                            }
                            sourceField = "EXTRA_TEXT_LINES[#$i]"
                            Log.d(TAG, "Extracted real message from $sourceField: $messageText (sender: $sender)")
                            break
                        }
                    }
                }
            }

            // 4. Fall back to standard EXTRA_TEXT
            if (messageText.isBlank()) {
                val stdText = extras.getCharSequence(android.app.Notification.EXTRA_TEXT)?.toString()?.trim()
                if (!stdText.isNullOrBlank()) {
                    messageText = stdText
                    sourceField = "EXTRA_TEXT"
                }
            }

            // 5. Fall back to EXTRA_SUB_TEXT
            if (messageText.isBlank()) {
                val subText = extras.getCharSequence(android.app.Notification.EXTRA_SUB_TEXT)?.toString()?.trim()
                if (!subText.isNullOrBlank()) {
                    messageText = subText
                    sourceField = "EXTRA_SUB_TEXT"
                }
            }

            if (messageText.isBlank()) return

            val isSummaryOnly = isGroupSummaryFlag || NativeThreatAnalyzer.isSummaryNotification(messageText)
            val channel = mapPackageToChannel(packageName)
            Log.i(TAG, "Intercepted from $channel ($sender) via $sourceField (isSummaryOnly=$isSummaryOnly): $messageText")

            // Real-time ScamShield Scam Analysis
            val analysis = NativeThreatAnalyzer.analyze(messageText, sender, channel)

            val threatId = "thr-live-${System.currentTimeMillis()}-${(1000..9999).random()}"
            val threatRecord = JSONObject().apply {
                put("id", threatId)
                put("timestamp", java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).format(java.util.Date()))
                put("channel", channel)
                put("sender", sender)
                put("message", messageText)
                put("packageName", packageName)
                put("diagnosticSource", "$sourceField" + (if (isSummaryOnly) " (GROUP SUMMARY)" else ""))
                put("rawExtractedText", messageText)
                put("isSummaryOnly", isSummaryOnly)
                put("analysis", analysis.toJsonObject())
                put("protectionAction", when (analysis.riskLevel) {
                    "CRITICAL", "HIGH" -> "Simulated Block & Isolation"
                    "SUSPICIOUS" -> if (isSummaryOnly) "Monitoring Off — Manual Review" else "Warned User"
                    else -> "Allowed (Safe)"
                })
                put("reportStatus", "Not Reported")
                put("isLiveNativeInterception", true)
            }

            // Always retain in recent queue (keep last 50)
            recentThreats.add(0, threatRecord)
            if (recentThreats.size > 50) {
                recentThreats.removeAt(recentThreats.size - 1)
            }

            // Forward immediately to active Capacitor UI if open
            activeThreatListener?.invoke(threatRecord)

            // If threat is SUSPICIOUS, HIGH, or CRITICAL and NOT a mere summary -> Generate real native Android alert!
            if (!isSummaryOnly && (analysis.riskLevel == "CRITICAL" || analysis.riskLevel == "HIGH" || analysis.riskLevel == "SUSPICIOUS")) {
                postNativeAlert(
                    context = applicationContext,
                    threatId = threatId,
                    channel = channel,
                    sender = sender,
                    message = messageText,
                    analysis = analysis
                )
            }

        } catch (e: Exception) {
            Log.e(TAG, "Error handling incoming notification: ${e.message}", e)
        }
    }
}
