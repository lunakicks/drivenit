# Android App Deployment Guide (Capacitor)

Build and deploy your app to Google Play Store while keeping the web version on Netlify.

---

## Architecture Overview

```
Web Users → Netlify (React App) ────┐
                                     ├──→ Supabase (Backend)
Mobile Users → Android App (APK) ────┘
```

**One codebase, three platforms!**
- 🌐 Web: Netlify
- 📱 Android: Google Play Store  
- 🔧 Backend: Supabase (shared)

---

## Prerequisites

- ✅ Node.js installed
- ✅ Android Studio installed
- ✅ Java JDK 17+ installed
- ✅ Google Play Console account ($25 one-time fee)

---

## Step 1: Install Android Studio

### 1.1 Download and Install

1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. Install with default settings
3. Open Android Studio
4. Go to: **Tools** → **SDK Manager**
5. Install:
   - ✅ Android SDK Platform 33 (or latest)
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools

### 1.2 Set Environment Variables

**Windows:**
```bash
# Add to System Environment Variables:
ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk

# Add to Path:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

**Verify:**
```bash
adb --version  # Should show version
```

---

## Step 2: Configure Android Project ✅ (Already Done!)

Your `android/` folder already exists. Let's verify the configuration:

### 2.1 Update `capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.quizapp',  // ← Change this!
  appName: 'Quiz Master',             // ← Change this!
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

**Important:**
- `appId`: Must be unique (e.g., `com.yourname.quizapp`)
- `appName`: What users see on their phone

### 2.2 Update `android/app/build.gradle`

Open `android/app/build.gradle` and update:

```gradle
android {
    namespace "com.yourcompany.quizapp"  // Must match appId
    compileSdk 33
    
    defaultConfig {
        applicationId "com.yourcompany.quizapp"  // Must match appId
        minSdk 22
        targetSdk 33
        versionCode 1      // Increment for each release
        versionName "1.0.0"
    }
}
```

---

## Step 3: Build Your App

### 3.1 Build React App

```bash
npm run build
```

### 3.2 Sync with Capacitor

```bash
npx cap sync android
```

This copies your built React app into the Android project.

### 3.3 Open in Android Studio

```bash
npx cap open android
```

Android Studio will open with your project.

---

## Step 4: Generate Signing Key

### 4.1 Create Keystore

```bash
# Windows (in PowerShell)
cd android/app
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Save these!** You'll need them:
- Keystore password
- Key alias: `my-key-alias`
- Key password (can be same as keystore)

### 4.2 Configure Signing

Create `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=my-key-alias
storeFile=my-release-key.keystore
```

**Important:** Add to `.gitignore`:
```
android/app/my-release-key.keystore
android/key.properties
```

### 4.3 Update `android/app/build.gradle`

Add before `android {`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add inside `android {` block:

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

---

## Step 5: Build Release APK/AAB

### Option A: Build AAB (for Play Store)

```bash
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Option B: Build APK (for testing)

```bash
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

**AAB vs APK:**
- **AAB** (Android App Bundle): Required for Play Store
- **APK**: For testing on your device

---

## Step 6: Test on Device

### 6.1 Enable Developer Mode

On your Android phone:
1. Settings → About Phone
2. Tap "Build Number" 7 times
3. Go back → Developer Options
4. Enable "USB Debugging"

### 6.2 Install APK

```bash
# Connect phone via USB
adb install android/app/build/outputs/apk/release/app-release.apk
```

Or drag the APK to your phone and install.

---

## Step 7: Prepare for Play Store

### 7.1 Create Assets

**App Icon:**
- Size: 512x512 px
- Format: PNG
- No transparency

**Screenshots:**
- At least 2 screenshots
- Recommended: 1080x1920 px (phone)
- Show actual app screens

**Feature Graphic:**
- Size: 1024x500 px
- Used in Play Store listing

### 7.2 Create Privacy Policy

**Required!** Host a privacy policy page (can be on Netlify):

```html
<!DOCTYPE html>
<html>
<head>
    <title>Privacy Policy - Quiz Master</title>
</head>
<body>
    <h1>Privacy Policy</h1>
    <p>Last updated: [DATE]</p>
    
    <h2>Information We Collect</h2>
    <p>We collect email addresses for authentication via Supabase.</p>
    
    <h2>How We Use Your Information</h2>
    <p>User data is stored securely in Supabase and used only for app functionality.</p>
    
    <h2>Contact</h2>
    <p>Email: your-email@example.com</p>
</body>
</html>
```

Host at: `https://your-netlify-app.netlify.app/privacy-policy.html`

---

## Step 8: Upload to Play Store

### 8.1 Create Google Play Console Account

1. Go to [play.google.com/console](https://play.google.com/console)
2. Pay $25 one-time registration fee
3. Fill in developer profile

### 8.2 Create New App

1. Click "Create app"
2. Fill in:
   - App name: "Quiz Master"
   - Default language: English
   - App/Game: App
   - Free/Paid: Free

### 8.3 Complete Store Listing

**Main store listing:**
- App name
- Short description (80 chars)
- Full description
- App icon
- Feature graphic
- Screenshots

**App category:**
- Education

**Contact details:**
- Email
- Privacy policy URL

### 8.4 Upload AAB

1. Go to "Production" → "Create new release"
2. Upload your AAB file: `android/app/build/outputs/bundle/release/app-release.aab`
3. Fill in release notes
4. Review and roll out

### 8.5 Complete Content Rating

1. Go to "Content rating"
2. Fill out questionnaire
3. Get rating (likely E for Everyone)

### 8.6 Submit for Review

Click "Submit app for review"

**Review time:** 1-7 days

---

## Step 9: Updating Your App

### 9.1 For Web (Netlify)

```bash
git add .
git commit -m "Update feature"
git push
# Netlify auto-deploys! ✅
```

### 9.2 For Android (Play Store)

```bash
# 1. Update version in android/app/build.gradle
versionCode 2       # Increment by 1
versionName "1.0.1"

# 2. Build React app
npm run build

# 3. Sync Capacitor
npx cap sync android

# 4. Build new AAB
cd android
./gradlew bundleRelease

# 5. Upload to Play Store
# Go to Play Console → Production → Create new release
# Upload new AAB
```

---

## Common Issues & Solutions

### Build Fails - Gradle Error

**Solution:**
```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

### App Crashes on Launch

**Check logs:**
```bash
adb logcat | grep -i "capacitor"
```

**Common fix:** Update `capacitor.config.ts` with correct `webDir: 'dist'`

### Supabase Auth Not Working

**Check:** `capacitor.config.ts` has:
```typescript
server: {
  androidScheme: 'https'
}
```

---

## Development Workflow

```bash
# Daily development
npm run dev  # Test in browser

# Ready to test on Android
npm run build
npx cap sync android
npx cap run android  # Opens in emulator/device

# Ready to release
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
# Upload to Play Store
```

---

## Costs

- ✅ Netlify: Free
- ✅ Supabase: Free
- 💰 Play Store: $25 one-time fee
- ✅ Total recurring: $0/month

---

## Next Steps

1. ✅ Android platform already added!
2. 📝 Update `capacitor.config.ts` (appId, appName)
3. 🔨 Build: `npm run build && npx cap sync android`
4. 🔑 Generate signing key
5. 📦 Build AAB: `cd android && ./gradlew bundleRelease`
6. 💰 Create Play Console account
7. 🎨 Prepare assets
8. 🚀 Upload to Play Store
9. 🎉 Get approved!

Your app will be available on:
- 🌐 Web: `https://your-app.netlify.app`
- 📱 Android: Google Play Store

All powered by the same Supabase backend! 🚀
