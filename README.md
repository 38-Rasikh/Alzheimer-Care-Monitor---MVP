# 🏥 Alzheimer Care Monitor - MVP Complete

> **Real-time monitoring and AI-powered insights for Alzheimer caregivers**

[![Status](https://img.shields.io/badge/Status-MVP-blue)]()
[![Platform](https://img.shields.io/badge/platform-android%20%7C%20ios-blue)]()
[![Framework](https://img.shields.io/badge/framework-React%20Native%20%7C%20React-61DAFB)]()
[![Cloud](https://img.shields.io/badge/cloud-Azure-0078D4)]()

## 🎉 Project Status

**MVP Development**:

- Mobile app (iOS & Android)
- Mock API with realistic data

---

## 📦 Project Structure

```
d:\SE\Alz\
├── app/
│   ├── mobile/          # React Native app (Expo)
│   │   ├── src/         # 50+ components, 6 screens
│   │   ├── App.tsx
│   │   └── package.json
│   └── mock-api/        # Express mock backend
│       ├── src/         # 10 REST endpoints, WebSocket
└──     └── package.json

```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or higher
- Expo Go app (for mobile) OR iOS Simulator / Android Emulator

### Installation

```powershell
# 1. Install dependencies for all apps
cd d:\SE\Alz\app\mock-api
npm install

cd ..\mobile
npm install

cd ..\web
npm install
```

### Running the Apps

Open **2 separate terminals**:

#### Terminal 1: Mock API (Required!)
```powershell
cd d:\SE\Alz\app\mock-api
npm run dev
```
Server runs on http://localhost:3001

#### Terminal 2: Mobile App
```powershell
cd d:\SE\Alz\app\mobile
npm start
```
- Press **`i`** for iOS simulator (macOS only)
- Press **`a`** for Android emulator
- Scan QR code with Expo Go app

---

## 🎬 Demo Instructions

**Best Demo Patient**: Eleanor Williams (p126)  
**Best Demo Time**: 6 PM (sundowning behavior)

### 4-5 Minute Walkthrough
1. **Dashboard** (20s) - Show 4 patients, Eleanor has high-severity alert
2. **Alerts** (40s) - Sundowning detection, haptic feedback on acknowledge
3. **Medications** (30s) - 4 meds with adherence, log dose
4. **Behaviors** (30s) - Weekly summary with AI insights
5. **Web Charts** (60s) - Interactive hover, heart rate spike at 6 PM
6. **AI Insights** (30s) - 3 recommendations

---
