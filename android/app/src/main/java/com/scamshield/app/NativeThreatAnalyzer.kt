package com.scamshield.app

import org.json.JSONArray
import org.json.JSONObject
import java.util.regex.Pattern

data class NativeAnalysisResult(
    val riskLevel: String, // SAFE, LOW, SUSPICIOUS, HIGH, CRITICAL
    val riskScore: Int,
    val scamCategory: String,
    val explanation: String,
    val simpleExplanation: String,
    val redFlags: List<String>,
    val recommendedActions: List<String>,
    val shouldBlock: Boolean,
    val suspiciousUrls: List<String>
) {
    fun toJsonObject(): JSONObject {
        val obj = JSONObject()
        obj.put("riskLevel", riskLevel)
        obj.put("riskScore", riskScore)
        obj.put("scamCategory", scamCategory)
        obj.put("explanation", explanation)
        obj.put("simpleExplanation", simpleExplanation)
        val rfArray = JSONArray()
        for (rf in redFlags) {
            val item = JSONObject()
            item.put("id", "rf-" + rf.hashCode())
            item.put("label", rf)
            item.put("simpleLabel", rf)
            item.put("detail", rf)
            rfArray.put(item)
        }
        obj.put("redFlags", rfArray)
        val actArray = JSONArray()
        for (act in recommendedActions) {
            actArray.put(act)
        }
        obj.put("recommendedActions", actArray)
        val stepArray = JSONArray()
        for ((idx, act) in recommendedActions.withIndex()) {
            stepArray.put("Step ${idx + 1}: $act")
        }
        obj.put("oneStepInstructions", stepArray)
        obj.put("confidenceLevel", "High")
        val urlArray = JSONArray()
        for (url in suspiciousUrls) {
            urlArray.put(url)
        }
        obj.put("suspiciousUrls", urlArray)
        obj.put("shouldBlock", shouldBlock)
        obj.put("analysisSource", "rule-engine")
        return obj
    }
}

object NativeThreatAnalyzer {

    private val URL_PATTERN = Pattern.compile("(?:https?://|www\\.)[^\\s<>()\"']+", Pattern.CASE_INSENSITIVE)

    fun isSummaryNotification(text: String): Boolean {
        val lower = text.lowercase().trim()
        if (lower.matches(Regex(".*\\b\\d+\\s+messages?\\s+from\\s+\\d+\\s+chats?\\b.*"))) return true
        if (lower.matches(Regex(".*\\b\\d+\\s+new\\s+messages?\\b.*"))) return true
        if (lower.matches(Regex(".*\\b\\d+\\s+unread\\s+messages?\\b.*"))) return true
        if (lower.matches(Regex("^\\d+\\s+messages?$"))) return true
        if (lower == "new messages" || lower == "new message") return true
        if (lower.contains("messages from") && lower.contains("chat")) return true
        return false
    }

    fun extractUrls(text: String): List<String> {
        val urls = mutableListOf<String>()
        val matcher = URL_PATTERN.matcher(text)
        while (matcher.find()) {
            val raw = matcher.group().replace(Regex("[.,;!?]+$"), "")
            urls.add(raw)
        }
        return urls
    }

    fun analyze(message: String, sender: String = "Unknown", channel: String = "SMS"): NativeAnalysisResult {
        // 0. Safeguard: Notification summary counts (never classify as SAFE)
        if (isSummaryNotification(message)) {
            return NativeAnalysisResult(
                riskLevel = "SUSPICIOUS",
                riskScore = 50,
                scamCategory = "Notification Summary — Content Hidden by App",
                explanation = "Android intercepted a grouped notification summary (\"$message\") instead of individual message text. WhatsApp bundled multiple chats together, hiding individual message content from the notification header.",
                simpleExplanation = "⚠️ Group notification summary: \"$message\". WhatsApp hid the individual message content. Please open WhatsApp to read the chat directly.",
                redFlags = listOf(
                    "WhatsApp bundled multiple messages into a group count",
                    "Individual message text not exposed in notification shade"
                ),
                recommendedActions = listOf(
                    "Open WhatsApp directly to view the sender's unread message",
                    "If suspicious, copy the message text and paste it into ScamShield Custom Analyzer"
                ),
                shouldBlock = false,
                suspiciousUrls = emptyList()
            )
        }

        val combined = "$message $sender".lowercase()
        val text = message.lowercase()
        val urls = extractUrls(message)
        val redFlags = mutableListOf<String>()
        var score = 0
        var category = "Legitimate Message"

        // 1. Digital Arrest / Law Enforcement Extortion
        val digitalArrestTerms = listOf(
            "digital arrest", "police officer", "cbi", "cyber crime", "cyber cell",
            "arrest warrant", "will arrest you", "customs department", "narcotics",
            "court summons", "supreme court", "trai", "telecom regulatory"
        )
        var hasDigitalArrest = false
        for (term in digitalArrestTerms) {
            if (combined.contains(term)) {
                hasDigitalArrest = true
                break
            }
        }
        if (hasDigitalArrest) {
            score += 92
            category = "Digital Arrest & Extortion Scam"
            redFlags.add("Impersonation of law enforcement or police authority")
            if (combined.contains("video call") || combined.contains("skype") || combined.contains("whatsapp call")) {
                score += 8
                redFlags.add("Demanding isolation or video interrogation")
            }
            if (combined.contains("money") || combined.contains("fee") || combined.contains("transfer") || combined.contains("clearance")) {
                score += 10
                redFlags.add("Illegal financial extortion demand")
            }
        }

        // 2. OTP Theft & Hijacking
        val otpKeywords = listOf("otp", "one time password", "verification code", "6-digit", "security pin")
        val otpDemand = listOf("share", "send", "tell", "forward", "verify", "enter", "disclose")
        var hasOtp = false
        for (kw in otpKeywords) {
            if (combined.contains(kw)) {
                hasOtp = true
                break
            }
        }
        var hasDemand = false
        for (d in otpDemand) {
            if (combined.contains(d)) {
                hasDemand = true
                break
            }
        }
        if (hasOtp && hasDemand) {
            score = maxOf(score, 94)
            category = "OTP Hijacking Scam"
            redFlags.add("Urgent demand to disclose private one-time password (OTP)")
            redFlags.add("Banks and legitimate services NEVER ask for OTP over chat or call")
        }

        // 3. Bank KYC Phishing
        val kycTerms = listOf("kyc", "pan card", "aadhaar", "bank account", "bank", "debit card", "credit card", "netbanking", "account")
        val kycAlert = listOf(
            "suspended", "blocked", "expired", "deactivated", "update immediately",
            "complete kyc", "verify identity", "within 24 hours", "verify now", "account will be", "action required"
        )
        var matchesKyc = false
        for (k in kycTerms) {
            if (combined.contains(k)) {
                for (a in kycAlert) {
                    if (combined.contains(a)) {
                        matchesKyc = true
                        break
                    }
                }
            }
            if (matchesKyc) break
        }
        if (matchesKyc) {
            score = maxOf(score, 88)
            category = "Bank KYC / Account Phishing"
            redFlags.add("False threat of bank account or KYC suspension")
            if (urls.isNotEmpty()) {
                score += 8
                redFlags.add("Directs to unverified credential harvesting link")
            }
        }

        // 4. Fake Job / Task Scam
        val jobTerms = listOf(
            "part time job", "work from home", "daily earning", "daily salary", "like youtube videos",
            "telegram job", "review merchant", "prepaid task", "rating task", "per day 5000", "daily 3000"
        )
        for (j in jobTerms) {
            if (combined.contains(j)) {
                score = maxOf(score, 82)
                category = "Fake Job & Advance-Fee Scam"
                redFlags.add("Unrealistic income promise for low-effort online tasks")
                break
            }
        }

        // 5. Lottery & Cash Prize
        val lotteryTerms = listOf("congratulations you won", "lottery prize", "kbc lucky draw", "won 25 lakh", "claim reward", "cash prize")
        for (l in lotteryTerms) {
            if (combined.contains(l)) {
                score = maxOf(score, 85)
                category = "Lottery & Prize Fraud"
                redFlags.add("Unsolicited prize or lottery claim requiring contact or fee")
                break
            }
        }

        // 6. UPI / QR Payment Fraud
        val upiTerms = listOf("scan qr to receive", "enter pin to receive", "receive refund", "upi pin to credit", "collect request")
        for (u in upiTerms) {
            if (combined.contains(u)) {
                score = maxOf(score, 90)
                category = "UPI / QR Payment Fraud"
                redFlags.add("Deceptive claim that entering UPI PIN or scanning QR receives money")
                break
            }
        }

        // 7. Check for suspicious shorteners & URL patterns
        val suspiciousDomains = listOf("bit.ly", "tinyurl.com", "t.co", "rb.gy", "cutt.ly", ".xyz", ".top", ".click", "ngrok", ".apk")
        for (url in urls) {
            for (susp in suspiciousDomains) {
                if (url.lowercase().contains(susp)) {
                    score = maxOf(score, 68)
                    if (category == "Legitimate Message") {
                        category = "Suspicious Phishing Link"
                    }
                    redFlags.add("Contains obfuscated or suspicious link: $url")
                    break
                }
            }
        }

        // 8. Legitimate routine filter (Avoid false positives)
        val appointmentTerms = listOf("appointment confirmed", "doctor appointment", "booking confirmed", "scheduled for")
        val deliveryTerms = listOf("out for delivery", "has been shipped", "package arriving", "delivered today")
        var isRoutine = false
        for (ap in appointmentTerms) {
            if (combined.contains(ap) && !hasOtp && !hasDigitalArrest && urls.isEmpty()) {
                isRoutine = true
                break
            }
        }
        for (del in deliveryTerms) {
            if (combined.contains(del) && !hasOtp && !combined.contains("pay") && !combined.contains("charge") && !combined.contains("fee")) {
                isRoutine = true
                break
            }
        }
        if (isRoutine && score < 70) {
            score = 5
            category = "Legitimate Routine Notification"
            redFlags.clear()
        }

        val finalScore = minOf(100, maxOf(0, score))
        val riskLevel = when {
            finalScore >= 82 -> "CRITICAL"
            finalScore >= 62 -> "HIGH"
            finalScore >= 38 -> "SUSPICIOUS"
            finalScore >= 16 -> "LOW"
            else -> "SAFE"
        }

        val recommendedActions = when (riskLevel) {
            "CRITICAL" -> listOf(
                "DO NOT transfer any funds or join video calls",
                "DO NOT share your OTP, PIN, or password with anyone",
                "Report immediately to National Cyber Crime Portal (1930)"
            )
            "HIGH" -> listOf(
                "DO NOT click any embedded links",
                "DO NOT share personal banking or KYC credentials",
                "Verify directly with the official bank branch or service provider"
            )
            "SUSPICIOUS" -> listOf(
                "Verify the sender identity through official channels",
                "Do not download attachments or visit shortened links"
            )
            else -> listOf(
                "No threat detected. Message appears to be routine communication."
            )
        }

        val explanation = when (riskLevel) {
            "CRITICAL" -> "Critical threat detected ($category). High indicator of targeted extortion or credential theft."
            "HIGH" -> "High risk detected ($category). Unverified claims attempting to harvest personal information or payments."
            "SUSPICIOUS" -> "Suspicious characteristics detected. Proceed with caution."
            else -> "Standard routine message with no identified scam patterns."
        }

        val simpleExplanation = when (riskLevel) {
            "CRITICAL" -> "STOP! This message is trying to trick or threaten you. Never send money or share your secret PIN."
            "HIGH" -> "Be careful! This message looks like a scam trying to steal your account or money."
            "SUSPICIOUS" -> "Warning: This message contains unverified links or claims."
            else -> "Safe: This message appears to be normal."
        }

        return NativeAnalysisResult(
            riskLevel = riskLevel,
            riskScore = finalScore,
            scamCategory = category,
            explanation = explanation,
            simpleExplanation = simpleExplanation,
            redFlags = redFlags,
            recommendedActions = recommendedActions,
            shouldBlock = riskLevel == "CRITICAL" || riskLevel == "HIGH",
            suspiciousUrls = urls
        )
    }
}
