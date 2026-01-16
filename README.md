# TickTick Pomodoro Extension

A feature-rich, beautiful Pomodoro timer extension for Chrome, inspired by TickTick's Focus features. Built with React, Vite, Tailwind CSS, and Manifest V3.

![TickTick Pomodoro Screenshot](public/icons/icon128.png)

## 🚀 Features

### ⏱️ Advanced Timer
*   **Flexible Modes:** Focus, Short Break, and Long Break intervals.
*   **Stopwatch Mode:** Count-up timer for open-ended sessions.
*   **Smart Auto-Start:** Configurable options to auto-start breaks or the next focus session.
*   **Custom Durations:** Set global defaults for all timer modes.

### ✅ Task Management
*   **Task List:** Create, edit, and delete tasks directly within the extension.
*   **Task Linking:** Select a task to focus on, and the timer tracks time specifically for that task.
*   **Estimations:** Set estimated Pomodoros for each task.
*   **Custom Task Durations:** Override global timer settings with specific durations for individual tasks (e.g., set a "Deep Work" task to 60 mins).

### 🛡️ Strict Mode
*   **Site Blocking:** Voluntarily block distracting websites (like social media) while the Focus timer is running.
*   **Redirect Page:** Attempts to visit blocked sites are redirected to a motivational "Get Back to Work" page.

### 📊 Statistics
*   **Daily Tracking:** View total focus time for the day.
*   **Weekly Insights:** 7-day bar chart visualization of your productivity.
*   **Session History:** Detailed logs of every completed session.

### 🎨 Modern UI/UX
*   **Dark Mode:** Sleek, battery-saving dark interface.
*   **Visual Timer:** Beautiful circular progress indicator with smooth animations.
*   **Responsive:** Optimized for the Chrome extension popup size.

## 🛠️ Tech Stack

*   **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Charts:** [Recharts](https://recharts.org/)
*   **Platform:** Chrome Extension [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
*   **Package Manager:** [Bun](https://bun.sh/) (Compatible with npm/yarn/pnpm)

## 📦 Installation

### From Source
1.  Clone this repository:
    ```bash
    git clone https://github.com/yourusername/ticktick-pomodoro-extension.git
    cd ticktick-pomodoro-extension
    ```
2.  Install dependencies:
    ```bash
    bun install
    # or npm install
    ```
3.  Build the extension:
    ```bash
    bun run build
    # or npm run build
    ```
4.  Load into Chrome:
    *   Open Chrome and navigate to `chrome://extensions`.
    *   Enable **Developer mode** (top right toggle).
    *   Click **Load unpacked**.
    *   Select the `dist` folder generated in your project directory.

## 💻 Development

To run the project in development mode (watch for changes):

```bash
bun run dev
# Note: Since this is a browser extension, 'vite dev' is less useful than 'vite build --watch' 
# for testing the actual extension context.
```

For actual extension development, it is recommended to run the build command and reload the extension in Chrome.

## 🧩 Project Structure

*   `src/background.ts`: Service worker handling timer logic, alarms, notifications, and site blocking.
*   `src/offscreen.ts`: Hidden document for playing audio (workaround for Manifest V3 background script limitations).
*   `src/components`: React components for Timer, Tasks, Stats, and Settings views.
*   `src/hooks`: Custom hooks (`usePomodoro`, `useTasks`) managing `chrome.storage` state.
*   `manifest.json`: Extension configuration and permissions.

## 🔒 Permissions Used

*   `storage`: Saving tasks, settings, and timer state locally.
*   `alarms`: Accurate timer execution in the background.
*   `notifications`: System alerts when a timer finishes.
*   `offscreen`: Playing white noise and alarm sounds.
*   `tabs`: Monitoring URLs for Strict Mode site blocking.

## 📄 License

MIT
