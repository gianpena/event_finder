# VibeCheck

**Discover what's happening around you.**

VibeCheck is a modern, interactive event discovery platform designed to help you find events that match your energy. Whether you're looking for a chill study spot, a high-energy party, or an artsy showcase, VibeCheck visualizes your city's social scene through an immersive map interface.

![VibeCheck App](https://via.placeholder.com/1200x600?text=VibeCheck+Preview) 
*(Note: Replace with actual screenshot)*

## ✨ Why VibeCheck?

Traditional event platforms categorize by rigid topics. VibeCheck categorizes by **feeling**.

-   **📍 Immersive 3D Map**: Powered by Mapbox, navigate a stunning dark-mode map of your city with smooth animations and 3D terrain.
-   **🌊 "Vibe" Based Discovery**: Filter events not just by date, but by mood—Chill, Networking, Rager, Artsy, and more.
-   **📱 Fluid, App-Like UI**: Experience a polished interface with draggable drawers, glassmorphism effects, and seamless transitions tailored for both desktop and mobile.
-   **🧭 Live Location**: Instantly find events happening near you with one-click geolocation.

## 🛠 Tech Stack

Built with the latest modern web technologies for performance and scale.

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
-   **Maps**: [Mapbox GL JS](https://www.mapbox.com/) & [React Map GL](https://visgl.github.io/react-map-gl/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these steps to get VibeCheck running locally.

### Prerequisites

-   Node.js 18+ 
-   npm, yarn, or pnpm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/event_finder.git
    cd event_finder
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory and add your Mapbox Public Token:
    ```bash
    NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token_here
    ```
    > **Note**: You will need a free [Mapbox account](https://account.mapbox.com/) to generate a token.

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```bash
├── src/
│   ├── app/                # Next.js App Router pages & layouts
│   ├── components/
│   │   ├── features/       # Complex feature-specific components (Map, Feed, etc.)
│   │   └── ui/             # Reusable UI components (Buttons, Drawers, etc.)
│   ├── lib/                # Utilities, stores, and mock data
│   └── styles/             # Global styles
├── public/                 # Static assets
└── ...config files         # Tailwind, TypeScript, Next.js config
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
