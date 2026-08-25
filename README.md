# StudyFlow

StudyFlow is a mobile-first academic planner for managing classes, tasks, notes, focus sessions, and study progress in one place.

## Phase 3 status

The Phase 3 application includes:

- Dashboard with daily study overview and progress
- Weekly class schedule with add, edit, and delete support
- Task and notes workspace
- Task categories for All, High Priority, Overdue, and Completed
- Completed tasks sorted to the bottom of the All view
- Task editing, deletion, subtasks, and completion tracking
- Full-screen rich note editor with:
  - Bold, italic, and underline
  - Headings
  - Left and center alignment
  - Bulleted and numbered lists
  - Tables with visible borders
  - Checklists
  - Undo and redo
- Focus timer with short breaks and completion chime
- Android timer notifications
- Light and dark themes with soft lavender styling
- Responsive mobile layout
- Local offline storage
- Firebase Authentication and Firestore realtime synchronization
- JSON backup export and import

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Capacitor Android
- Firebase Authentication
- Cloud Firestore
- Capacitor Local Notifications
- Lucide React icons

## Requirements

- Node.js 20 or newer
- npm
- Android Studio for Android builds
- Java 17 for Gradle builds
- An Android phone with USB debugging enabled for direct installation

## Run the web app

```bash
cd app
npm install
npm run dev
```

Open the local address shown by Vite in your browser.

## Firebase configuration

Create `app/.env` using `app/.env.example` as a template:

```env
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

In Firebase Console:

1. Enable Authentication → Email/Password.
2. Create a Cloud Firestore database.
3. Publish the rules from [`firestore.rules`](./firestore.rules).
4. Use the same StudyFlow account on the PC and Android app.

The app stores data locally first. When signed in and online, changes are uploaded automatically to Firestore. When another device opens or reconnects, it receives the latest data through a realtime listener. Offline changes remain locally cached and retry when connectivity returns.

The Sync button is only a manual fallback; normal synchronization does not require pressing it.

## Build the web app

```bash
cd app
npm run build
```

The production files are generated in `app/dist`.

## Run on Android

Set Android Studio's Gradle JDK to Java 17:

`Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK`

Then run these commands from the `app` directory:

```bash
npm run build
npx cap sync android
```

Open this folder in Android Studio:

```text
app/android
```

Connect the Android phone with USB debugging enabled, select it in Android Studio, and click **Run**. Android Studio will build and install the latest version over the existing app.

## Notifications

Timer notifications use the Android local notification system. On Android, allow notifications in the app's Settings page and in the phone's system settings if prompted.

Notifications are device-local. This prevents the same timer from creating duplicate alerts on both the PC and phone.

## Data model

Each Firebase account uses one protected document:

```text
users/{userId}
```

The document contains the user's profile, tasks, notes, schedule, focus sessions, and settings. Firestore rules allow users to read and write only their own document.

## Useful commands

```bash
cd app
npm run dev       # Start development server
npm run build     # Type-check and create production build
npm run lint      # Run lint checks
npx cap sync android  # Copy the latest web build into Android
```

## Troubleshooting

### Firebase says `auth/api-key-not-valid`

Copy the exact `apiKey` from Firebase Console → Project settings → Your apps → SDK setup and configuration, update `app/.env`, and restart the Vite server.

### Capacitor says Android has not been added

Run the command from `app`, not from `app/android`:

```bash
cd app
npx cap sync android
```

### Gradle cannot find Java

Install Java 17 and set Android Studio's Gradle JDK to Java 17. Android Studio's bundled JDK may be newer than this project's Android tooling supports.

### Changes do not appear on another device

Confirm that both devices:

- Are signed in with the same Firebase account
- Have internet access
- Have Firestore created and its rules published
- Are running a build that includes the current `app/.env` configuration

## Security notes

Firebase web configuration values are designed to be used in client applications. Data protection comes from Firebase Authentication and Firestore security rules. Never place Firebase service-account private keys in the frontend or commit them to GitHub.

## License

Add a project license before publishing this repository publicly.
