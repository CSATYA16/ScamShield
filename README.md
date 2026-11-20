# 🛡️ ScamShield — Real-Time Consumer Cybersecurity & Scam Defense

> **AI & Rule-Based Scam Defense Platform with Native Android Real-Time Notification Monitoring**  
> *Protecting everyday citizens from Digital Arrest extortion, Bank KYC phishing, OTP theft, fake job frauds, and UPI/QR payment scams.*

---

## 📌 Overview

**ScamShield** is an AI-powered consumer cybersecurity system designed to protect citizens in India and globally from digital fraud. Built as a dual-engine platform, ScamShield combines Google Gemini AI reasoning with an instant, on-device regex/heuristic rule engine that detects scam patterns in under 5 milliseconds.

During live hackathon demonstrations, ScamShield runs both as:
1. **A Full Web Operations Dashboard**: For cybersecurity monitoring, threat forensics, risk zone simulation, and one-tap 1930 Cybercrime report preparation.
2. **A Real Android Mobile Application**: Running natively on physical Android smartphones with a background `NotificationListenerService` that intercepts incoming scam notifications from WhatsApp, SMS, Telegram, and Gmail with explicit user authorization, generating instant Heads-Up security alerts before victims fall for extortion or phishing links.

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

## 📲 How to Install the Android APK

### Option A: Install via ADB (Recommended)
1. Enable **Developer Options** and **USB Debugging** on your Android phone.
2. Connect your phone via USB.
3. Run from the project root:
   ```bash
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Option B: Direct Device Install
1. Transfer `android/app/build/outputs/apk/debug/app-debug.apk` to your phone via Google Drive, WhatsApp, or Quick Share.
2. Tap the APK file and select **Install** (allow "Install unknown apps" if prompted).

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
./gradlew assembleDebug
```
The compiled APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Step 5: Run Automated Logic Tests
```bash
npx tsx src/logic/scamshield.test.ts
```
*(All 11 unit tests pass verifying Digital Arrest, KYC, OTP, UPI QR, and legitimate messages).*

---

## 🎬 Live Hackathon Demo Sequence

1. **Launch the Web Operations Center:**
   - Run `npm run dev` on your presentation laptop to display the ScamShield Cybercrime Operations Dashboard on the big screen.
2. **Open the Android App:**
   - Launch **ScamShield** on the physical Android phone.
   - In the **Live Protection** tab, verify the status displays **`LISTENING (ACTIVE)`**.
3. **Test Real Scams Live:**
   - Have a teammate send an actual WhatsApp or SMS message to the phone:
     > *"Delhi Police Cyber Cell: You are under digital arrest for money laundering. Contact immediately or face arrest."*
   - Or Bank KYC scam:
     > *"Your bank account will be blocked today. Complete KYC immediately or your account will be suspended. Verify now."*
4. **Experience the Instant Phone Alert:**
   - The phone vibrates and fires a high-priority Heads-Up Notification:
     > **🚨 ScamShield Alert: Digital Arrest & Extortion Scam**  
     > *[CRITICAL RISK via WhatsApp] STOP! This message is trying to trick or threaten you.*
5. **Inspect & Report:**
   - Tap the alert to open ScamShield: it reveals red flags, triggers voice guidance in Hindi/Telugu/English, and generates a formatted 1930 Cybercrime complaint with one tap.

---

## ⚠️ Known Platform Limitations

- **WhatsApp Group Summaries**: When an Android device has numerous unread group chats, WhatsApp bundles notifications into a summary count (e.g. *"100 messages from 4 chats"*). ScamShield identifies this summary, extracts individual messages via `Notification.MessagingStyle`, and if content is completely obscured by Android OS privacy policies, responsibly flags it as **`MANUAL REVIEW`** rather than returning a false sense of security.
- **Android Battery Optimization**: Certain aggressive OEM Android skins (Xiaomi MIUI, Oppo ColorOS) may sleep background listener services after extended inactivity unless battery optimization is set to "Unrestricted" for ScamShield.

---

## ⚖️ License & Disclaimer

Built for public cybersecurity defense and hackathon presentation. ScamShield does not replace official law enforcement agencies. In case of financial fraud, immediately dial **1930** or report to **[cybercrime.gov.in](https://cybercrime.gov.in)**.
