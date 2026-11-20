# 🛡️ ScamShield — Real-Time Consumer Cybersecurity & Scam Defense

> **AI & Rule-Based Scam Defense Platform with Native Android Real-Time Notification Monitoring**  
> *Protecting everyday citizens from Digital Arrest extortion, Bank KYC phishing, OTP theft, fake job frauds, and UPI/QR payment scams.*

[![Download Android APK](https://img.shields.io/badge/Download_APK-v1.0.0_Release-22c55e?style=for-the-badge&logo=android&logoColor=white)](https://github.com/CSATYA16/ScamShield/releases/download/v1.0.0/app-release.apk)
[![GitHub Release](https://img.shields.io/github/v/release/CSATYA16/ScamShield?style=for-the-badge&color=blue)](https://github.com/CSATYA16/ScamShield/releases/tag/v1.0.0)
[![Tested on Android](https://img.shields.io/badge/Tested_Device-Motorola_Edge_50-blueviolet?style=for-the-badge&logo=android)](https://github.com/CSATYA16/ScamShield)

---

## 📌 Overview

**ScamShield** is an AI-powered consumer cybersecurity system designed to protect citizens in India and globally from digital fraud. Built as a dual-engine platform, ScamShield combines Google Gemini AI reasoning with an instant, on-device regex/heuristic rule engine that detects scam patterns in under 5 milliseconds.

During live hackathon demonstrations, ScamShield operates across two cohesive environments:
1. **A Full Web Operations Dashboard**: For cybersecurity monitoring, threat forensics, risk zone simulation, and one-tap 1930 Cybercrime report preparation.
2. **A Real Android Mobile Application**: Running natively on physical Android smartphones with an active background `NotificationListenerService` that intercepts incoming scam notifications from WhatsApp, SMS, Telegram, and Gmail with explicit user authorization, generating instant Heads-Up security alerts before victims fall for extortion or phishing links.

---

# 🎬 HOW TO DEMONSTRATE SCAMSHIELD

> [!TIP]
> **Hackathon Judges & Evaluators Quick Demonstration Walkthrough**  
> ScamShield can be evaluated either through a live physical smartphone test with incoming messaging apps or directly via the integrated Live Protection Simulator. Follow the 5 guided demonstrations below.

### 📋 Demonstration Quick Reference Table

| Demo | Target Scenario | Test Vector | Expected Output |
| :--- | :--- | :--- | :--- |
| **Demo 1** | **Bank KYC Phishing** | Live WhatsApp notification from another phone | **CRITICAL (88/100)** Heads-Up alert, Bank KYC classified |
| **Demo 2** | **Digital Arrest Extortion** | In-app Simulator or live message | **CRITICAL (96/100)** Stop instructions, police extortion breakdown |
| **Demo 3** | **Legitimate Safe Message** | Courier / doctor appointment update | **SAFE (0/100)** No alert, allowed through |
| **Demo 4** | **QR Shield UPI Trap** | Malicious UPI QR scan / upload | **DANGEROUS** Reversal warning, PIN trap flagged |
| **Demo 5** | **1930 Cybercrime Report** | One-tap complaint generator | Structured PDF/Portal draft with user review verification |

---

### Demo 1 — Real-Time WhatsApp Scam Detection (Live Physical Device)

1. **Open ScamShield** on the Android phone.
2. Verify in the **Live Protection** tab that Notification Access is enabled and status displays **`LISTENING (ACTIVE)`**.
3. From a second smartphone or web chat, send this exact test message to the test phone via **WhatsApp**:
   ```
   Your bank account will be blocked today. Complete KYC immediately or your account will be suspended. Verify now.
   ```
4. Observe the incoming WhatsApp notification.
5. Watch ScamShield automatically intercept the notification in background and fire a high-priority native **ScamShield Heads-Up Security Alert**:
   > **🚨 ScamShield Alert: Bank KYC / Account Phishing**  
   > *[CRITICAL RISK via WhatsApp] STOP! Urgent KYC threat detected.*
6. Open **ScamShield** to view the live threat breakdown:
   - **Extracted Message Content**: Verified string captured from notification extras.
   - **Risk Score**: **`88/100 (CRITICAL RISK)`**.
   - **Classification**: `Bank KYC / Account Phishing`.
   - **Critical Warning**: Plain-language explanation of urgency tactics and phishing threats.
   - **Protective Instructions**: 1-2-3 actionable advice (*"Never click unverified links"*, *"Call your bank branch directly"*).
7. **Technical Explanation**: ScamShield uses Android's official permission-based `NotificationListenerService` (`ScamShieldNotificationService.kt`) with deep `Notification.MessagingStyle` extraction to parse notification bodies securely without reading private device storage.

---

### Demo 2 — Digital Arrest Scam (Simulator / Live Message)

Use the app's built-in **Live Protection Simulator** (or send via SMS/WhatsApp) to test India's fastest-growing cyber threat:

```
You are under digital arrest. A police officer will arrest you unless you transfer ₹50,000 immediately. Do not tell anyone.
```

- **Output**: Generates an immediate **CRITICAL RISK (96/100)** alert.
- **Red Flags Highlighted**: Fraudulent claim of "Digital Arrest" (no Indian law enforcement agency conducts arrests over video calls), intimidation extortion, secrecy demand (*"Do not tell anyone"*), and illicit fund transfer demand.
- **Safety Instructions**: Clear multi-lingual guidance to immediately hang up and inform local police.

---

### Demo 3 — Safe Message (Zero False-Positive Verification)

Test a legitimate service delivery or appointment message to verify that ScamShield avoids unnecessarily flagging ordinary everyday communication:

```
Your order #94821 from FreshGroceries has been dispatched and will arrive by 4:00 PM today.
```

- **Output**: Classified as **`SAFE (Risk Score: 0/100)`**.
- **Result**: No alarm sound or heads-up vibration triggered. Marked as "Allowed (Safe)", confirming high precision without alarm fatigue.

---

### Demo 4 — QR Shield (Malicious UPI & Phishing QR Inspection)

1. Switch to the **QR Shield** tab in ScamShield.
2. Scan or load a fraudulent UPI payment QR code requesting money under the pretext of a "Refund" or "Lottery Prize":
   ```
   upi://pay?pa=fraudulentmerchant@okaxis&pn=RefundDesk&am=5000&cu=INR
   ```
3. **Analysis Result**:
   - Flagged as **`DANGEROUS`**.
   - Alerts the user: *"STOP! Scanning this QR code or entering your UPI PIN will DEBIT ₹5,000 from your account, NOT credit it. You never need to enter a UPI PIN to receive money."*

---

### Demo 5 — Reporting & Protection (1930 Portal Complaint Draft)

1. From any detected threat record, tap **"Prepare 1930 Report"**.
2. **Examine Complaint Draft**:
   - ScamShield formats a structured complaint according to the specifications of the National Cyber Crime Reporting Portal.
   - Evidence summary, sender identity, suspect URL, timestamp, and incident category are compiled into an organized dossier.
   - Features one-click hotlink to **[cybercrime.gov.in](https://cybercrime.gov.in)** and speed-dialing for **National Cyber Financial Fraud Helpline 1930**.
3. **User Action Disclosure**:
   > [!IMPORTANT]
   > Reports are prepared as a verified draft for the user and require human review. ScamShield **does not falsely claim automatic submission**—citizens retain full review and legal control before transmitting complaints to law enforcement authorities.

---

### ⚠️ IMPORTANT DEMO NOTE: WhatsApp Group Bundling & Notifications

WhatsApp and other messaging platforms may bundle multiple incoming messages into aggregated summary notifications (e.g., *"100 messages from 4 chats"*). 

- When deep message extras (`android.messages`) are available, ScamShield extracts and analyzes the individual text.
- If individual content is completely obscured by OEM OS privacy locks, ScamShield transparently flags the event as **`MANUAL REVIEW NEEDED`** rather than producing a false "SAFE" result.
- **For a guaranteed, deterministic live demonstration during hackathon judging, use the custom message simulator in the Live Protection tab or send a fresh single chat message.**

---

## 📱 Install ScamShield on Android

### Direct APK Installation — Recommended for Judges

> 📥 **[Download ScamShield.apk (Official Release v1.0.0)](https://github.com/CSATYA16/ScamShield/releases/download/v1.0.0/app-release.apk)**  
> *(Signed, standalone Android package from the official [GitHub Releases Page](https://github.com/CSATYA16/ScamShield/releases/tag/v1.0.0))*

1. Download the latest `ScamShield.apk` from the GitHub Releases section (link above) directly on your Android phone.
2. Open the downloaded APK on your Android phone.
3. If Android asks, allow installation from that source.
4. Tap **Install**.
5. Open **ScamShield**.
6. Grant **Notification Access** through Android Settings if you want real-time notification monitoring.
7. Return to ScamShield and verify the protection status displays **`LISTENING (ACTIVE)`**.

> [!NOTE]
> **Transparent Security Note for Judges & Evaluators:**  
> ScamShield is a hackathon prototype distributed outside the Google Play Store. Android or Google Play Protect may display security warnings. Review the source and permissions before installation. Notification Access is user-controlled and required for notification monitoring. If prompted during installation, tap **"More details"** ➔ **"Install anyway"**.

---

### Optional Developer Installation — USB/ADB

Judges do **not** need USB, ADB, Developer Options, or a laptop to install the app. This method is **OPTIONAL FOR DEVELOPERS**:

1. Enable **Developer Options** and **USB Debugging** on your Android phone.
2. Connect your phone to your computer via USB cable.
3. Verify connection via `adb devices`.
4. Install the release APK directly from the repository root:
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

---

## ✨ Features

- **🚨 Live Scam Detection & Isolation**:
  - Automatically intercepts and inspects incoming messages.
  - Classifies threats across 5 risk levels: `SAFE`, `LOW`, `SUSPICIOUS`, `HIGH`, and `CRITICAL`.
  - Explains the scam in everyday plain language (removing technical jargon).
  - Outlines concrete 1-2-3 protective instructions (e.g., *"DO NOT TRANSFER MONEY"*, *"DO NOT SHARE OTP"*).

- **📱 Real Android Notification Monitoring**:
  - Native Kotlin `NotificationListenerService` monitoring supported messaging channels (WhatsApp, Google Messages, Samsung Messages, Telegram, Gmail).
  - Deep `Notification.MessagingStyle` extraction to parse individual incoming message bodies.
  - Generates native Android Heads-Up Notifications on critical threats with sound, vibration, and deep-link tap actions.

- **🌐 Indian & Global Scam Pattern Coverage**:
  - **Digital Arrest Extortion**: Impersonation of police, CBI, customs, telecom regulatory authority (TRAI), or court summons.
  - **Bank KYC Phishing**: Threats of account suspension, pan card expiration, or debit card deactivation with malicious credential-harvesting links.
  - **OTP Hijacking**: Urgent requests to share 6-digit codes or verification PINs.
  - **Fake Job / Task Fraud**: "Work from home", paying upfront fees for YouTube likes or merchant reviews.
  - **Lottery & Prize Fraud**: Fake KBC lucky draws or unsolicited reward schemes.
  - **UPI / QR Fraud**: Deceptive claims that scanning a QR code or entering a UPI PIN receives refunds or cashbacks.
  - **Legitimate Message Safeguards**: Distinguishes normal appointment confirmations and routine delivery updates without false positives.

- **🔍 QR Shield**:
  - Webcam / file-based QR code analyzer.
  - Parses UPI payment URIs (`upi://pay`), validates destination handles, and flags fraudulent refund/PIN traps.
  - Inspects URLs for suspicious TLDs (`.xyz`, `.top`, `.click`, `.apk`), IP hosts, and URL shorteners.

- **🗺️ Risk Zones**:
  - Interactive map displaying high-risk cyber fraud hotspots (e.g., Central Market ATM clusters, transit hubs) with geo-fenced safety tips.

- **📋 One-Tap Cybercrime Reporting (Helpline 1930)**:
  - Formats structured complaint drafts conforming to the National Cyber Crime Reporting Portal (`cybercrime.gov.in`).
  - Pre-fills threat evidence, timestamps, sender handles, financial loss indicators, and emergency helpline (1930) dialing.

- **🗣️ Trilingual Accessibility & Voice Alerts**:
  - Full UI and voice warnings supported in **English**, **Hindi (हिन्दी)**, and **Telugu (తెలుగు)**.
  - "Simple Language Mode" designed for citizens with low digital literacy.

---

## 🏛️ System Architecture

```
                          ┌──────────────────────────────────────┐
                          │    ScamShield Frontend (React 19)    │
                          │   Tailwind CSS v4 + Framer Motion    │
                          └──────────────────┬───────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          [Web Browser / Laptop Mode]                [Native Android Hybrid Mode]
      Vite 8 + Express 4 Backend Server             Capacitor Shell + Native Kotlin
                       │                                           │
         ┌─────────────┴─────────────┐              ┌──────────────┴──────────────┐
         ▼                           ▼              ▼                             ▼
Google Gemini AI API        Heuristic Rule Engine  ScamShieldNotificationService  Native Alert Manager
(gemini-4-hydrogen)         threatAnalyzer.ts      (NotificationListenerService) (High-Priority Heads-Up)
         │                           │              │                             │
         └─────────────┬─────────────┘              └──────────────┬──────────────┘
                       │                                           │
                       ▼                                           ▼
             Real-Time Threat Breakdown                 On-Device Phone Notification
             Red Flags + 1930 Complaint                 "🚨 Digital Arrest Detected"
```

---

## 🔒 Privacy & Permissions

ScamShield is engineered with a strict **Privacy-First** architecture:
1. **Explicit User Consent Only**: ScamShield works solely after the user explicitly enables Notification Access in Android Settings (`Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS`).
2. **Zero Database Access**: ScamShield **never** accesses app databases, chat histories, or storage of third-party apps. It only reads active notification headers in real time.
3. **No Outgoing Message Interception**: ScamShield never reads personal typed text or outgoing messages.
4. **Local Fallback**: Full threat pattern analysis executes entirely offline on-device using regex and heuristics—zero messages are leaked to third-party tracking servers.

---

## 🛠️ How to Build from Source

### Prerequisites
- **Node.js**: v20+ or v22+
- **JDK**: OpenJDK 17
- **Android SDK**: API Platform 35 (`android-35`), Build-tools 35.0.0
- **Gradle**: 8.14 (included via `./gradlew` wrapper)

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Run the Web Dashboard
```bash
npm run dev
# Server running on http://localhost:3000
```

### Step 3: Compile Web Assets
```bash
npm run build
```

### Step 4: Sync & Build the Android APK
```bash
npx cap sync android
cd android
./gradlew assembleRelease
```
The compiled release APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

### Step 5: Run Automated Logic Tests
```bash
npx tsx src/logic/scamshield.test.ts
```
*(All 11 unit tests pass verifying Digital Arrest, KYC, OTP, UPI QR, and legitimate messages).*

---

## ⚠️ Known Limitations

- **WhatsApp Notification Bundling**: When an Android device has numerous unread group chats, WhatsApp bundles notifications into a summary count (e.g. *"100 messages from 4 chats"*). ScamShield extracts individual messages via `Notification.MessagingStyle`, and if content is completely obscured by Android OS privacy policies, responsibly flags it as **`MANUAL REVIEW`** rather than returning a false sense of security.
- **Android Battery Optimization**: Certain aggressive OEM Android skins (Xiaomi MIUI, Oppo ColorOS) may sleep background listener services after extended inactivity unless battery optimization is set to "Unrestricted" for ScamShield.

---

## ⚖️ License & Disclaimer

Built for public cybersecurity defense and hackathon presentation. ScamShield does not replace official law enforcement agencies. In case of financial fraud, immediately dial **1930** or report to **[cybercrime.gov.in](https://cybercrime.gov.in)**.
