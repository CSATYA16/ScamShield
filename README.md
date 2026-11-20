# ⚡ JUDGE DEMO — START HERE

> **Welcome Hackathon Judges!** Follow this 6-step walkthrough to evaluate ScamShield's real-time scam interception and on-device protection.

### 🎬 Demonstration Sequence

- **Step 1 — Install**  
  Download the ScamShield APK ([Download APK](https://github.com/CSATYA16/ScamShield/releases/download/v1.0.0/app-release.apk)) and install it directly on Android. If Google Play Protect warns about an unverified app, explain this is a hackathon-built prototype distributed outside the Play Store. Only proceed if the user trusts the source (tap **"More details"** ➔ **"Install anyway"**).

- **Step 2 — Enable Android Protection**  
  Open ScamShield ➔ **Live Protection** ➔ **Grant Notification Access** ➔ enable ScamShield in Android Notification Access settings ➔ return to the app (status will display **`LISTENING (ACTIVE)`**).

- **Step 3 — Test a Real Scam**  
  Send this WhatsApp message to the demo phone:  
  > *"Your bank account will be blocked today. Complete KYC immediately or your account will be suspended. Verify now."*  
  
  Show the native ScamShield alert and the **HIGH/CRITICAL (88/100)** risk classification.  
  *(Note: If WhatsApp only provides a grouped notification summary, explain the privacy limitation and use the app's custom message testing/injector instead. DO NOT claim that a summary was analyzed as the actual message).*

- **Step 4 — QR Shield**  
  Open **QR Shield** ➔ tap the **"Fake Refund UPI QR"** demo sample (or use **Scan with Camera** / **Upload QR Image**) ➔ show **DANGEROUS** classification and explanation.

- **Step 5 — Show the Protection Flow**  
  ```
  DETECT ➔ ALERT ➔ ISOLATE ➔ EXPLAIN ➔ PROTECT ➔ REPORT
  ```

- **Step 6 — Reporting**  
  Open **Report & Protect** ➔ show the prepared cybercrime report and explain that the user must confirm submission. Mention India cybercrime portal (**[cybercrime.gov.in](https://cybercrime.gov.in)**) and **Helpline 1930** for financial cyber fraud.

---

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

## 📱 Install on Android — Direct APK

### Direct APK Installation — Recommended for Judges

> 📥 **[Download ScamShield.apk (Official Release v1.0.0)](https://github.com/CSATYA16/ScamShield/releases/download/v1.0.0/app-release.apk)**  
> *(Signed, standalone Android package from the official [GitHub Releases Page](https://github.com/CSATYA16/ScamShield/releases/tag/v1.0.0))*

1. **Download `app-release.apk`** from the link above (or the GitHub Releases page) directly on your Android phone.
2. **Open the downloaded APK** on your Android phone.
3. If Android prompts you, allow **"Install unknown apps"** for the browser or file manager used to open the APK.
4. Tap **Install**.
5. Open **ScamShield**.
6. Grant **Notification Access** through Android Settings when prompted.
7. Return to ScamShield and verify the protection status displays **`LISTENING (ACTIVE)`**.

> [!NOTE]
> **Transparent Security Note for Judges & Evaluators:**  
> ScamShield is a hackathon prototype distributed outside the Google Play Store. Android or Google Play Protect may display security warnings. Review the source and permissions before installation. If prompted during installation, tap **"More details"** ➔ **"Install anyway"**. Notification Access is user-controlled and required for notification monitoring.

---

### Optional Advanced Installation — USB/ADB

Judges do **not** need USB, ADB, Developer Options, or a laptop. This method is **OPTIONAL FOR DEVELOPERS**:

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

- **🔍 QR Shield (Live Camera Scanner & Image Inspector)**:
  - Live native camera QR scanner with on-device camera permissions and WebRTC fallback.
  - File upload inspection for QR screenshots.
  - Built-in demo QR samples for instant evaluation (Fake Refund UPI QR, Phishing URL, Safe Website).
  - Parses UPI payment URIs (`upi://pay`), validates destination handles, and flags fraudulent refund/PIN traps.

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
2. **Camera Permission on Demand**: Camera access is requested strictly for QR Shield scanning and operates entirely on-device without recording or cloud streaming.
3. **Zero Database Access**: ScamShield **never** accesses app databases, chat histories, or storage of third-party apps. It only reads active notification headers in real time.
4. **No Outgoing Message Interception**: ScamShield never reads personal typed text or outgoing messages.
5. **Local Fallback**: Full threat pattern analysis executes entirely offline on-device using regex and heuristics—zero messages are leaked to third-party tracking servers.

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
