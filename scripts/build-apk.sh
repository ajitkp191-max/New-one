#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🐾 VetPulse Pro - Android APK Compiler"
echo "=========================================="

echo "Step 1: Building web production bundle..."
npm run build

echo "Step 2: Syncing Capacitor Android assets..."
npx cap sync android

echo "Step 3: Checking Gradle and Android environment..."
if command -v java >/dev/null 2>&1 && [ -f "./android/gradlew" ]; then
    echo "Compiling native Android APK..."
    cd android
    chmod +x gradlew
    ./gradlew assembleDebug
    echo "=========================================="
    echo "✅ APK compilation successful!"
    echo "Artifact: android/app/build/outputs/apk/debug/app-debug.apk"
    echo "=========================================="
else
    echo "Notice: Native JDK / Android SDK not found in this cloud environment."
    echo "You can compile the APK through either of these methods:"
    echo "  Method A (1-Click Cloud): Export to GitHub via AI Studio settings. GitHub Actions will build and release the APK automatically."
    echo "  Method B (Android Studio): Open the './android' directory in Android Studio and click Build > Build APK."
    echo "  Method C (PWABuilder): Generate signed APK from the live URL: https://www.pwabuilder.com"
fi
