# SmartPujari

SmartPujari ek React Native mobile app hai jisme users pooja services browse kar sakte hain, pandit details dekh sakte hain, pooja book kar sakte hain, cart/checkout flow use kar sakte hain, saved addresses manage kar sakte hain, bookings dekh sakte hain, reviews/notifications/account pages access kar sakte hain.

Project React Native CLI se bana hai, Expo project nahi hai. Android aur iOS dono native folders repo me present hain.

## Current Status

Ye project feature-wise kaafi aage hai, lekin production-ready bolne se pehle kuch cleanup aur hardening required hai. App ka structure React Native developer ke kaam jaisa lagta hai: `src` folder organized hai, navigation alag hai, API layer alag hai, screens/components/theme separated hain. Lekin first production release ke liye lint/test/build issues fix karna, env handling improve karna, release signing setup karna, debug logs remove karna aur API URLs centralize karna zaroori hai.

## Tech Stack

- React Native `0.85.1`
- React `19.2.3`
- TypeScript
- React Navigation
- Axios API client
- AsyncStorage for local auth data
- Firebase Messaging + Notifee for push notifications
- Razorpay for payments
- Native Android/iOS project setup

## Main Packages Used

| Package | Use |
| --- | --- |
| `@react-navigation/native` | App navigation container |
| `@react-navigation/native-stack` | Native stack navigation for main app flow |
| `@react-navigation/stack` | Stack navigation used in auth flow |
| `@react-navigation/bottom-tabs` | Bottom tab navigation for Home, Bookings, Profile |
| `react-native-gesture-handler` | Required by React Navigation gestures |
| `react-native-screens` | Native screen optimization |
| `react-native-safe-area-context` | Safe area handling for notches/status bars |
| `react-native-vector-icons` | Material icons and other icon fonts |
| `axios` | API requests |
| `@react-native-async-storage/async-storage` | Token/user data storage |
| `@react-native-firebase/app` | Firebase base setup |
| `@react-native-firebase/messaging` | FCM push notifications |
| `@notifee/react-native` | Local notification display and Android channels |
| `react-native-razorpay` | Razorpay payment integration |
| `react-native-maps` | Map/location UI support |
| `react-native-geolocation-service` | Device location access |
| `react-native-image-picker` | Profile/review image selection |
| `react-native-document-picker` | Document/file picking |
| `react-native-webview` | Web pages inside app |
| `react-native-calendars` | Calendar/date selection UI |
| `react-native-modal` | Modal/bottom-sheet style UI |
| `react-native-snap-carousel` | Banner carousel |
| `react-native-keyboard-aware-scroll-view` | Better form scrolling with keyboard |
| `@react-native-community/slider` | Slider input control |
| `react-native-otp-verify` | OTP auto-read support |

## Project Structure

```txt
SmartPujari/
  App.tsx                         App root component
  index.js                        Native app registration entry
  app.json                        App name/display name
  package.json                    Scripts and dependencies
  android/                        Android native project
  ios/                            iOS native project
  __tests__/                      Jest tests
  src/
    api/                          API clients and endpoint modules
    components/                   Reusable UI components
    components/home/              Home screen sections
    navigation/                   Root/Auth/App navigation setup
    screens/                      Main tab screens
    screens/app/                  Logged-in app screens
    screens/auth/                 Splash, onboarding, login, OTP, profile setup
    services/                     Notification service
    store/                        Local auth token/user storage helpers
    theme/                        Shared colors, font sizes, radius
```

## App Entry Flow

1. `index.js` registers the React Native app using the name from `app.json`.
2. `App.tsx` wraps the app with `SafeAreaProvider`, configures `StatusBar`, and renders `RootNavigator`.
3. `src/navigation/RootNavigator.tsx` creates the top-level navigation with two stacks:
   - `Auth`
   - `App`
4. `src/navigation/AuthStack.tsx` handles splash/onboarding/login/OTP/profile setup screens.
5. `src/navigation/AppStack.tsx` handles the logged-in app, including bottom tabs and deeper feature screens.

## Navigation Files

### `src/navigation/RootNavigator.tsx`

Root navigation container. It uses `NavigationContainer` and a native stack with:

- `Auth` -> `AuthStack`
- `App` -> `AppStack`

Current initial route is `Auth`.

### `src/navigation/AuthStack.tsx`

Auth flow screens:

- `Splash`
- `Onboarding`
- `Login`
- `OTP`
- `ProfileSetup`

### `src/navigation/AppStack.tsx`

Logged-in app flow. It contains the main bottom tabs plus extra screens.

Bottom tabs:

- `Home` -> `src/screens/HomeScreen.tsx`
- `Bookings` -> `src/screens/BookingsScreen.tsx`
- `Profile` -> `src/screens/AccountScreen.tsx`

Extra stack screens:

- Pooja flow: `AllPoojaTypes`, `PoojaDetail`, `BookPooja`, `Cart`
- Pandit flow: `AllPandits`, `PanditDetail`
- Online pooja: `OnlinePooja`
- Address flow: `SavedAddresses`, `AddressForm`, `SelectLocation`
- Account/static pages: `FAQ`, `AboutUs`, `RefundPolicy`, `PrivacyPolicy`, `TermsConditions`
- Notifications/bookings: `Notifications`, `MyBookings`

### `src/navigation/StaticStack.tsx`

Static page stack exists for FAQ/About/Policy/WebView style pages, but the main app currently wires most static pages directly inside `AppStack`.

## API Layer

API code lives in `src/api/`.

Important files:

- `src/api/config.ts` stores base URL and timeout.
- `src/api/apiClient.ts` creates the shared Axios client.
- `src/api/authApi.ts` handles login/profile related calls.
- `src/api/homeApi.ts` handles home banners, pooja types, pandits etc.
- `src/api/poojaApi.ts` handles pooja related data.
- `src/api/panditApi.ts` handles pandit list/detail data.
- `src/api/bookingApi.ts` handles booking APIs.
- `src/api/cartApi.ts` handles cart, address, coupon and checkout APIs.
- `src/api/address.ts` handles address APIs.
- `src/api/paymentApi.ts` handles payment APIs.
- `src/api/notificationApi.ts` handles notification APIs.
- `src/api/reviewApi.ts` handles review APIs.
- `src/api/searchApi.ts` handles search APIs.
- `src/api/mockApi.ts` contains mock/demo behavior.

`apiClient.ts` automatically reads `authToken` from AsyncStorage and sends it as `Authorization: Bearer <token>`.

## Auth Storage

Auth helper functions are in `src/store/authStore.ts`.

Stored keys:

- `authToken`
- `user`

Available helpers:

- `saveToken`
- `getToken`
- `removeToken`
- `saveUser`
- `getUser`
- `removeUser`
- `clearAuthData`

## Notifications

Push/local notification logic is in `src/services/notificationService.ts`.

It uses:

- Firebase Messaging for FCM token and remote messages
- Notifee for displaying notifications
- Android notification channels for booking/payment/review/admin notifications

For production push notifications, add the Firebase native config files:

- Android: `android/app/google-services.json`
- iOS: `ios/SmartPujari/GoogleService-Info.plist`

Also confirm native Firebase Gradle/iOS configuration before release.

## Environment Variables

Repo currently has a `.env` file with these keys:

```txt
VITE_API_URL
VITE_GOOGLE_MAPS_API_KEY
```

Important: React Native does not automatically read `VITE_*` variables like a Vite web app. If you want to use env variables in React Native, add and configure a package like `react-native-config`, or keep configuration in `src/api/config.ts`.

Current API config:

- Development: `http://13.232.175.231/api/v1`
- Production: `https://api.smartpujari.com`

Production recommendation: keep all URLs in one config file/env setup. Some files still contain hardcoded `13.232.175.231` URLs directly.

## Setup on a New Machine

### 1. Install Required Tools

Install:

- Node.js `>= 22.11.0`
- npm
- Watchman on macOS
- Android Studio
- Java/JDK compatible with your React Native/Gradle setup
- Xcode on macOS for iOS
- CocoaPods for iOS

React Native official setup guide should also be followed for Android/iOS environment variables.

### 2. Clone Project

```sh
git clone <repo-url>
cd SmartPujari
```

### 3. Install JS Dependencies

```sh
npm install
```

### 4. Install iOS Pods

Only needed on macOS for iOS:

```sh
bundle install
bundle exec pod install --project-directory=ios
```

Alternative:

```sh
cd ios
bundle exec pod install
cd ..
```

### 5. Add Native Config Files

For maps, Firebase, Razorpay and backend integration, make sure required keys/config files are available.

Typical files:

```txt
.env
android/app/google-services.json
ios/SmartPujari/GoogleService-Info.plist
```

Do not commit real production secrets unless your team intentionally manages them in git.

## Run the App

### Start Metro

```sh
npm start
```

### Run Android

In another terminal:

```sh
npm run android
```

### Run iOS

In another terminal on macOS:

```sh
npm run ios
```

You can also open the native projects directly:

- Android: `android/` in Android Studio
- iOS: `ios/SmartPujari.xcworkspace` in Xcode

## Available Scripts

```sh
npm start        # Start Metro bundler
npm run android  # Build and run Android app
npm run ios      # Build and run iOS app
npm run lint     # Run ESLint
npm test         # Run Jest tests
```

## Testing

Current test file:

```txt
__tests__/App.test.tsx
```

Run tests:

```sh
npm test -- --runInBand --watchman=false
```

At the time this README was updated, the test suite does not pass because Jest needs extra config/mocking for React Navigation ESM modules.

Observed issue:

```txt
SyntaxError: Unexpected token 'export'
from @react-navigation/native/lib/module/index.js
```

Recommended fix:

- Add `transformIgnorePatterns` for React Navigation packages.
- Mock native modules that are not test-friendly.
- Add focused tests for API mapping, auth storage, and critical screens.

## Linting

Run:

```sh
npm run lint
```

At the time this README was updated, lint does not pass. Main categories:

- Unused imports/variables
- React hook dependency warnings
- Inline style warnings (use StyleSheet instead)
- Duplicate style keys
- Duplicate JSX props
- Debug `console.log` statements
- ESLint scanning `ios/Pods`, which should be ignored

Recommended fix:

- Add `.eslintignore` or ESLint ignore config for `ios/Pods`, `android/build`, `ios/build`, etc.
- Remove unused imports/variables.
- Fix hook dependencies using `useCallback` where needed.
- Move repeated inline styles into `StyleSheet`.
- Remove production debug logs or gate them behind a logger.

## Android Release Build

Debug run:

```sh
npm run android
```

Release APK/AAB should be generated from Android Studio or Gradle after configuring release signing.

Important: `android/app/build.gradle` currently uses debug signing config for release. Before Play Store release:

- Generate a production keystore.
- Configure release signing securely.
- Set correct `versionCode` and `versionName`.
- Enable/minify only after testing.
- Verify `usesCleartextTraffic`; production should use HTTPS-only where possible.

## iOS Release Build

Use Xcode with:

```txt
ios/SmartPujari.xcworkspace
```

Before App Store/TestFlight release:

- Configure bundle identifier.
- Configure signing team/provisioning profiles.
- Add Firebase plist if push notifications are needed.
- Configure push notification capability.
- Archive from Xcode.

## Production Readiness Review

Short answer: abhi project promising hai, lekin production ke liye ready nahi maana jayega.

Good points:

- Folder structure understandable hai.
- Navigation separated hai.
- API modules separated hain.
- Theme file exists.
- Auth token storage and Axios interceptor present hai.
- Android/iOS native folders included hain.
- Major app flows already created hain.

Needs work before production:

- Lint errors fix karne honge.
- Jest config/tests fix karne honge.
- Hardcoded API URLs remove/centralize karne honge.
- Debug logs remove/gate karne honge.
- `.swp` temporary file remove karni hogi.
- Firebase config files and native setup verify karna hoga.
- Android release signing abhi debug key par hai; production ke liye proper keystore chahiye.
- API error handling and loading/empty states ko consistently audit karna hoga.
- Navigation params ke TypeScript types define karne chahiye instead of `any`.
- Permissions for maps/location/notifications/image picker properly add/test karne honge.
- Secrets/env setup React Native compatible banana hoga.
- Real device testing Android and iOS dono par karna hoga.

## Suggested Next Checklist

1. Fix lint config so native generated folders are ignored.
2. Fix all current ESLint errors.
3. Fix Jest config for React Navigation and native modules.
4. Move all API URLs to one config/env system.
5. Remove debug logs and temporary files.
6. Add typed navigation params.
7. Configure Firebase native files.
8. Configure Android release signing.
9. Test complete user flow on real devices.
10. Create staging and production build variants.

## Notes for New Developers

- Start reading from `App.tsx`, then `src/navigation/RootNavigator.tsx`.
- Main app routes are in `src/navigation/AppStack.tsx`.
- Auth routes are in `src/navigation/AuthStack.tsx`.
- API changes usually go in `src/api/`.
- Shared visual constants are in `src/theme/theme.ts`.
- Local auth data is handled by `src/store/authStore.ts`.
- Notification setup is in `src/services/notificationService.ts`.

## Common Issues

### Metro cache issue

```sh
npm start -- --reset-cache
```

### Android build issue

```sh
cd android
./gradlew clean
cd ..
npm run android
```

### iOS pod issue

```sh
cd ios
bundle exec pod deintegrate
bundle exec pod install
cd ..
```

### Jest watchman permission issue

Use:

```sh
npm test -- --runInBand --watchman=false
```

## Final Review

Ye app first-time React Native project ke hisaab se strong start hai. Kisi professional React Native developer ka project lagne ke liye structure already directionally sahi hai, but polish, typing, lint cleanliness, env management, test setup, native release config aur production security/reliability work abhi baaki hai.
