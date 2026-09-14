# 📦 VetPulse Pro - Android APK Release Guide

This repository contains the complete native Android codebase and automated release configurations for **VetPulse Pro**.

---

## 🚀 Option 1: Instant Cloud APK (Signed & Play Store Ready)
You can generate a signed `.apk` and `.aab` (Android App Bundle) directly from the live deployed URL with **0 setup and no Android Studio needed**:

1. Open **[PWABuilder](https://www.pwabuilder.com)**
2. Paste the application URL:
   `https://ais-pre-b7sde7b6keot4avrcvhxmh-713845383221.asia-southeast1.run.app`
3. Click **Start**, verify the manifest checks (all green).
4. Click **Package For Stores** > **Android** > **Download Package / Generate APK**.
5. Transfer the `.apk` directly to your phone and install!

---

## ⚡ Option 2: Automated GitHub Actions APK Release
We have integrated `.github/workflows/build-apk.yml` into this project.

1. In AI Studio, click the menu in the top right > **Export to GitHub** (or push to your Git repo).
2. Go to the **Actions** tab on your GitHub repository.
3. The **Build VetPulse Pro APK** workflow runs automatically on Ubuntu with JDK 17 & Android SDK.
4. Once completed, you can:
   - Download the APK directly from the **Artifacts** section: `VetPulse-Pro-APK.zip`
   - Or download `VetPulse-Pro-release.apk` from the automated **GitHub Releases** page.

---

## 💻 Option 3: Local Build (Capacitor & Android Studio)
The native Android project is located in `/android`:

### 1. Build and sync web assets:
```bash
npm run build:android
```

### 2. Compile APK with Gradle:
```bash
cd android
./gradlew assembleDebug
```
Your compiled APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Open in Android Studio:
```bash
npx cap open android
```
Inside Android Studio, navigate to:
**Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 📱 Sideloading on Android
1. Download `VetPulse-Pro-debug.apk` or `VetPulse-Pro-release.apk` onto your Android phone.
2. Tap the downloaded file in your Files / Downloads app.
3. If prompted, toggle **Allow from this source** in Android Settings.
4. Tap **Install** and launch **VetPulse Pro**!
