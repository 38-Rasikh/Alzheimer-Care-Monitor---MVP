# 🏥 Alzheimer Care Monitor - MVP Complete

> **Real-time monitoring and AI-powered insights for Alzheimer caregivers**

[![Status](https://img.shields.io/badge/status-MVP%20Complete-success)]()
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-blue)]()
[![Framework](https://img.shields.io/badge/framework-React%20Native%20%7C%20React-61DAFB)]()
[![Cloud](https://img.shields.io/badge/cloud-Azure-0078D4)]()

## 🎉 Project Status

**MVP Development**: ✅ **COMPLETE** (4 weeks, November 1-28, 2025)

- ✅ Mobile app (iOS & Android)
- ✅ Web dashboard
- ✅ Mock API with realistic data
- ✅ 20,000+ words of documentation
- ✅ Demo script for Imagine Cup
- ✅ Backend handoff package

---

## 📦 Project Structure

```
d:\SE\Alz\
├── app/
│   ├── mobile/          # React Native app (Expo)
│   │   ├── src/         # 50+ components, 6 screens
│   │   ├── App.tsx
│   │   └── package.json
│   ├── web/             # React web dashboard (Vite)
│   │   ├── src/         # 3 pages, interactive charts
│   │   ├── index.html
│   │   └── package.json
│   └── mock-api/        # Express mock backend
│       ├── src/         # 10 REST endpoints, WebSocket
│       └── package.json
├── docs/                # 📚 Complete documentation (10 files)
│   ├── QUICK-START.md           # ⭐ Start here!
│   ├── DEMO-SCRIPT.md           # Imagine Cup presentation
│   ├── BACKEND-HANDOFF.md       # Backend implementation guide
│   ├── MOBILE-USER-GUIDE.md     # End-user documentation
│   ├── KNOWN-LIMITATIONS.md     # Limitations + roadmap
│   ├── WEEK4-COMPLETE.md        # Week 4 summary
│   ├── openapi-spec.yaml        # API specification
│   ├── API-INTEGRATION-GUIDE.md # Integration guide
│   ├── AZURE-DEPLOYMENT.md      # Cloud deployment
│   └── .env.template            # Configuration reference
└── versions/            # Week 1, 2, 3 snapshots
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

Open **3 separate terminals**:

#### Terminal 1: Mock API (Required!)
```powershell
cd d:\SE\Alz\app\mock-api
npm start
```
✅ Server runs on http://localhost:3001

#### Terminal 2: Mobile App
```powershell
cd d:\SE\Alz\app\mobile
npm start
```
- Press **`i`** for iOS simulator (macOS only)
- Press **`a`** for Android emulator
- Scan QR code with Expo Go app

#### Terminal 3: Web Dashboard
```powershell
cd d:\SE\Alz\app\web
npm run dev
```
✅ Dashboard runs on http://localhost:5173

**📖 Detailed instructions**: See `docs/QUICK-START.md`

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

**📖 Complete demo script**: See `docs/DEMO-SCRIPT.md`

---

## ✨ Key Features

### Mobile App (React Native + Expo)
- ✅ **6 screens**: Dashboard, Alerts, Medications, Behavior Logs, Settings, Patient Detail
- ✅ **Real-time updates**: WebSocket integration
- ✅ **Offline mode**: Mutation queue with auto-retry
- ✅ **Haptic feedback**: 6 types (success, warning, error, etc.)
- ✅ **Smooth animations**: 10+ reusable animation utilities
- ✅ **Empty & error states**: User-friendly fallbacks
- ✅ **Toast notifications**: Non-intrusive feedback

### Web Dashboard (React + Vite + Tailwind)
- ✅ **3 pages**: Patient list, Patient detail, Login (placeholder)
- ✅ **Interactive charts**: Recharts with custom tooltips
- ✅ **Loading skeletons**: 5 variants for smooth UX
- ✅ **Responsive design**: Mobile, tablet, desktop
- ✅ **Error handling**: Graceful failures with retry
- ✅ **Real-time data**: Auto-refresh every 30 seconds

### Mock API (Express + Faker.js + Socket.io)
- ✅ **10 REST endpoints**: Matches OpenAPI spec
- ✅ **4 patient profiles**: Realistic characteristics
- ✅ **Time-based patterns**: Sundowning 5-8 PM, night-time changes
- ✅ **WebSocket support**: Real-time vital signs
- ✅ **AI insights**: Template-based recommendations

### Alert Types
1. 🚨 **Fall Detection** - Immediate critical alert
2. 🚶 **Wandering** - Left safe zone
3. 💊 **Medication** - Missed or late dose
4. ❤️ **Vital Signs** - Abnormal heart rate, BP, O2
5. 😡 **Agitation** - Elevated stress detected
6. 🔋 **Device** - Low battery or connectivity

---

## 📊 Technology Stack

### Frontend
- **Mobile**: React Native 0.76, Expo 54, TypeScript 5.3
- **Web**: React 19.1, Vite, Tailwind CSS 3.x
- **State**: React Query v5.59 (data), Zustand (app state)
- **UI**: React Native Paper 5.12 (mobile), shadcn/ui (web)
- **Charts**: Recharts (web)

### Backend (Target)
- **API**: Node.js + Express (or similar)
- **Database**: Azure SQL or PostgreSQL
- **Cache**: Azure Redis Cache
- **IoT**: Azure IoT Hub for device data
- **Auth**: Azure AD B2C (JWT tokens)
- **Real-time**: Socket.io or Azure SignalR

### DevOps
- **Cloud**: Microsoft Azure
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: Azure Application Insights
- **Hosting**: Azure App Service (API), Azure Static Web Apps (Web)

---

## 📚 Documentation

### For Developers
- **QUICK-START.md** - Get running in 5 minutes ⭐
- **API-INTEGRATION-GUIDE.md** - Backend implementation (5,000 words)
- **BACKEND-HANDOFF.md** - Complete database schema + architecture (8,000 words)
- **openapi-spec.yaml** - API specification (700 lines)
- **.env.template** - All configuration options (150+ variables)

### For Product/Marketing
- **DEMO-SCRIPT.md** - Imagine Cup presentation (4,500 words)
- **MOBILE-USER-GUIDE.md** - End-user guide for caregivers (3,500 words)
- **KNOWN-LIMITATIONS.md** - Current limits + 3-phase roadmap (5,000 words)
- **WEEK4-COMPLETE.md** - Complete Week 4 summary

### For Backend Team
- **BACKEND-HANDOFF.md** - Database schema (10 tables), auth strategy, deployment
- **AZURE-DEPLOYMENT.md** - Infrastructure as Code, PowerShell scripts
- **API-INTEGRATION-GUIDE.md** - Request/response examples, error handling

**Total Documentation**: 20,000+ words across 10 files

---

## 🧪 Testing

### Manual Testing Completed
- ✅ All user flows (dashboard → alerts → meds → behaviors)
- ✅ Cross-platform (iOS, Android, Web)
- ✅ Network failure scenarios (offline mode)
- ✅ Time-based patterns (sundowning at 6 PM)

### Automated Testing (Planned - Phase 1)
- Unit tests (Jest, React Testing Library)
- Integration tests (Supertest)
- E2E tests (Playwright)
- Load testing (Artillery)

---

## 🗺️ Roadmap

### Phase 1: Production-Ready MVP (Q2 2025)
**Goal**: Deploy to 2-3 pilot facilities

- Authentication (Azure AD B2C)
- Real backend (Azure SQL, Redis, IoT Hub)
- Device integration (Apple HealthKit, Google Fit)
- Push notifications (Firebase Cloud Messaging)
- Enhanced offline support
- PDF reports and audit logs

**Timeline**: 4 months (Dec 2025 - Mar 2026)  
**Budget**: $50,000

### Phase 2: Enhanced Features (Q3-Q4 2025)
**Goal**: Scale to 20-30 facilities

- EHR integration (HL7 FHIR)
- Multi-user collaboration
- Family portal (web + mobile)
- Advanced reporting and analytics
- Multi-language support
- WCAG 2.1 AA compliance

### Phase 3: AI-Powered Predictions (2026)
**Goal**: Predictive analytics and proactive care

- Fall risk prediction (7-day forecast)
- Sundowning episode prediction (24-hour)
- Medication adherence prediction
- Anomaly detection
- Computer vision (fall detection, gait analysis)

**📖 Detailed roadmap**: See `docs/KNOWN-LIMITATIONS.md`

---

## 🏆 Achievements (4 Weeks)

### Week 1: Foundation
- ✅ UI requirements, API contract, wireframes
- ✅ Tech stack selection
- ✅ Project bootstrapping

### Week 2: Core Features
- ✅ Navigation, state management
- ✅ All screens implemented
- ✅ Mock API integration

### Week 3: Real-Time & Data
- ✅ WebSocket integration
- ✅ Enhanced mock API
- ✅ Weekly summaries with AI insights

### Week 4: Polish & Documentation
- ✅ Animations, haptics, offline mode
- ✅ Interactive charts, loading states
- ✅ 20,000+ words of documentation
- ✅ Demo script and backend handoff

---

## 🤝 Contributing

### Current Status
MVP is complete and in demo/pilot phase. Contributions welcome for Phase 1 features!

### How to Contribute
1. Review `docs/KNOWN-LIMITATIONS.md` for planned features
2. Check GitHub Issues for open tasks
3. Fork repository and create feature branch
4. Submit pull request with tests

---

## 📞 Contact & Support

### Project Team
- **Email**: dev@alzcaretech.com
- **GitHub**: https://github.com/alzcaretech
- **Demo**: https://demo.alzcaretech.com

### Questions?
- **Technical**: Review `docs/QUICK-START.md` or email dev team
- **Demo**: See `docs/DEMO-SCRIPT.md`
- **Backend**: See `docs/BACKEND-HANDOFF.md`

---

## 📄 License

[License information to be added]

---

## 🙏 Acknowledgments

- Inspired by real challenges faced by Alzheimer caregivers
- Built with React Native, Expo, React, and Azure
- Material Design (mobile), shadcn/ui (web)
- AI assistance from GitHub Copilot

---

## 📈 Project Stats

| Metric | Value |
|--------|-------|
| **Development Time** | 4 weeks |
| **Lines of Code** | ~15,000 |
| **Components** | 50+ |
| **Documentation** | 20,000+ words |
| **API Endpoints** | 10 |
| **Screens** | 9 (6 mobile, 3 web) |
| **Patient Profiles** | 4 |

---

**Status**: ✅ **MVP COMPLETE - READY FOR DEMO**  
**Version**: 1.0.0  
**Last Updated**: November 28, 2025

🚀 **Ready for Imagine Cup presentation and pilot facility deployment!**

---

## Getting Started (Detailed)

### 1. Install Dependencies

#### Mobile App
```powershell
cd d:\SE\Alz\app\mobile
npm install
```

#### Web Dashboard
```powershell
cd d:\SE\Alz\app\web
npm install
```

#### Mock API Server
```powershell
cd d:\SE\Alz\app\mock-api
npm install
```

---

### 2. Start Development Servers

Open **3 separate PowerShell terminals**:

#### Terminal 1: Mock API (start this first)
```powershell
cd d:\SE\Alz\app\mock-api
npm run dev
```
Server will run on `http://localhost:3001`

#### Terminal 2: Mobile App
```powershell
cd d:\SE\Alz\app\mobile
npm start
```
Scan QR code with Expo Go app on your phone

#### Terminal 3: Web Dashboard
```powershell
cd d:\SE\Alz\app\web
npm run dev
```
Open `http://localhost:5173` in browser

---

## Testing Mock API

Once the mock API is running, test endpoints:

```powershell
# Get all patients
curl http://localhost:3001/api/patients

# Get patient status
curl http://localhost:3001/api/patient/p123/status

# Get alerts
curl http://localhost:3001/api/patient/p123/alerts

# Get medications
curl http://localhost:3001/api/patient/p123/medications

# Get weekly summary
curl http://localhost:3001/api/patient/p123/summary

# Health check
curl http://localhost:3001/health
```

---

## Mobile Development

### Current Status
- ✅ Folder structure created
- ✅ Dependencies configured
- ✅ Theme system setup
- ✅ TypeScript interfaces defined
- ⏳ Screens to build (Week 2)
- ⏳ Navigation setup (Week 2)
- ⏳ API integration (Week 2)

### Run on Physical Device
1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Run `npm start` in mobile directory
3. Scan QR code with Expo Go

### Run on Emulator
```powershell
# iOS (requires Mac)
npm run ios

# Android (requires Android Studio)
npm run android
```

---

## Web Development

### Current Status
- ✅ Vite + React + TypeScript setup
- ✅ Tailwind CSS configured
- ✅ Folder structure created
- ✅ Dependencies configured
- ⏳ shadcn/ui components (Week 2)
- ⏳ Pages to build (Week 2)
- ⏳ Charts integration (Week 2)

### Add shadcn/ui Components (Week 2)
```powershell
cd d:\SE\Alz\app\web
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
```

---

## API Integration

### Mobile (React Native)
```typescript
// Example: src/hooks/usePatientStatus.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export function usePatientStatus(patientId: string) {
  return useQuery({
    queryKey: ['patient-status', patientId],
    queryFn: () => axios.get(`${API_BASE}/patient/${patientId}/status`).then(r => r.data),
    refetchInterval: 10000, // Poll every 10 seconds
  });
}
```

### Web (React)
```typescript
// Example: src/hooks/usePatients.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: () => axios.get(`${API_BASE}/patients`).then(r => r.data),
  });
}
```

---

## Design System

### Colors
```typescript
const colors = {
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Severity
  critical: '#DC2626',
  high: '#F59E0B',
  medium: '#FBBF24',
  low: '#10B981',
  
  // UI
  primary: '#6366F1',
  secondary: '#8B5CF6',
  background: '#F9FAFB',
};
```

See `app/mobile/src/theme/tokens.ts` and `app/web/tailwind.config.js` for complete definitions.

---

## Week 2 Goals

### Mobile App
- [ ] Implement bottom tab navigation
- [ ] Build HomeScreen with patient status
- [ ] Build AlertsScreen with list and filters
- [ ] Build MedicationsScreen with schedule
- [ ] Build BehaviorLogsScreen
- [ ] Build SettingsScreen
- [ ] Connect all screens to mock API
- [ ] Add pull-to-refresh
- [ ] Add real-time WebSocket updates

### Web Dashboard
- [ ] Setup React Router
- [ ] Build PatientListPage with table
- [ ] Build PatientDetailPage
- [ ] Add Recharts for trends
- [ ] Connect to mock API
- [ ] Add filters and search
- [ ] Implement WebSocket real-time updates

---

## Common Issues & Solutions

### Port Already in Use
```powershell
# Kill process on port 3001 (mock API)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port in mock-api/src/server.ts
```

### Expo Not Starting
```powershell
# Clear cache
cd d:\SE\Alz\app\mobile
npx expo start -c
```

### Dependencies Not Installing
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -r node_modules
rm package-lock.json
npm install
```

---

## Useful Commands

### Mobile
```powershell
npm start          # Start Expo dev server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator (Mac only)
npm test           # Run tests
npm run lint       # Run ESLint
```

### Web
```powershell
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm test           # Run Vitest
npm run lint       # Run ESLint
```

### Mock API
```powershell
npm run dev        # Start with hot reload
npm start          # Start without hot reload
```

---

## Documentation Reference

| Document | Purpose |
|----------|---------|
| `docs/week1-ui-requirements.md` | Complete data field definitions for all screens |
| `docs/api-contract.md` | REST API endpoints with request/response examples |
| `docs/wireframes.md` | ASCII wireframes + component library structure |
| `docs/tech-stack.md` | Technology decisions with rationale |
| `docs/WEEK1-COMPLETE.md` | Week 1 summary and achievements |
| `UI/Plan.md` | Original 4-week development plan |
| `UI/Requirements.md` | Project requirements from interviews |

---

## Contact & Support

For questions about:
- **Mobile development**: Check `app/mobile/src/` folder structure
- **Web development**: Check `app/web/src/` folder structure
- **API endpoints**: See `docs/api-contract.md`
- **Design specs**: See `docs/wireframes.md`

---

## Next Session Checklist

Before starting Week 2:
- [ ] All dependencies installed (mobile, web, mock-api)
- [ ] Mock API running on `localhost:3001`
- [ ] Mobile app opens in Expo Go
- [ ] Web dashboard opens on `localhost:5173`
- [ ] Reviewed wireframes in `docs/wireframes.md`
- [ ] Reviewed API contract in `docs/api-contract.md`

---

**Status**: Week 1 Complete ✅  
**Next**: Week 2 - Build UI screens and connect to mock API
