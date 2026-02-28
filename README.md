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
-   **Database**: [Supabase](https://supabase.com/) (Postgres + Storage)
-   **Auth**: [NextAuth.js](https://next-auth.js.org/) with Google OAuth
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
    ```

3.  **Configure Environment Variables**

    Create a `.env.local` file in the root directory with the following keys:

    ```bash
    # Mapbox — https://account.mapbox.com
    NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token

    # Google OAuth (used for Sign In AND Google Calendar)
    # https://console.cloud.google.com/apis/credentials
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback

    # NextAuth — generate a secret with: openssl rand -base64 32
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_nextauth_secret

    # Supabase — https://supabase.com/dashboard
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

    > See **API Keys Setup** below for instructions on obtaining each key.

4.  **Set up the Supabase database**

    Run the following SQL in your Supabase project's SQL Editor to create the required tables:

    <details>
    <summary>Click to expand SQL</summary>

    ```sql
    -- Events
    create table events (
      id uuid primary key default gen_random_uuid(),
      title text, type text, date text, time text,
      start_at timestamptz, location text, image text,
      vibe text[], host_name text, host_avatar text,
      price text, is_private boolean default false,
      lat float8, lng float8,
      created_at timestamptz default now()
    );
    alter table events enable row level security;
    create policy "Events are public" on events for select using (true);
    create policy "Anyone can insert events" on events for insert with check (true);

    -- RSVPs
    create table rsvps (
      id uuid primary key default gen_random_uuid(),
      user_id text not null, event_id uuid references events(id) on delete cascade,
      created_at timestamptz default now(),
      unique(user_id, event_id)
    );
    alter table rsvps enable row level security;
    create policy "RSVPs are public" on rsvps for select using (true);
    create policy "Anyone can manage rsvps" on rsvps for all using (true) with check (true);

    -- Reviews
    create table reviews (
      id uuid primary key default gen_random_uuid(),
      user_id text not null, event_id uuid, host_name text,
      event_title text, rating int check (rating between 1 and 5),
      comment text, created_at timestamptz default now(),
      unique(user_id, event_id)
    );
    alter table reviews enable row level security;
    create policy "Reviews are public" on reviews for select using (true);
    create policy "Anyone can insert reviews" on reviews for insert with check (true);

    -- Profiles
    create table profiles (
      user_id text primary key, display_name text,
      bio text, location text, avatar_url text,
      instagram text, twitter text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    alter table profiles enable row level security;
    create policy "Profiles are public" on profiles for select using (true);
    create policy "Anyone can insert a profile" on profiles for insert with check (true);
    create policy "Anyone can update a profile" on profiles for update using (true);

    -- Avatars storage bucket
    insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
    create policy "Avatars are publicly readable" on storage.objects for select using (bucket_id = 'avatars');
    create policy "Anyone can upload an avatar" on storage.objects for insert with check (bucket_id = 'avatars');
    create policy "Anyone can update an avatar" on storage.objects for update using (bucket_id = 'avatars');
    ```

    </details>

5.  **Run the development server**
    ```bash
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 API Keys Setup

You need to obtain the following keys from their respective services. All are **free** to create.

| Key | Service | Where to get it |
|-----|---------|-----------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox | [account.mapbox.com](https://account.mapbox.com) → Tokens |
| `GOOGLE_CLIENT_ID` | Google Cloud | [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) → Create OAuth 2.0 Client |
| `GOOGLE_CLIENT_SECRET` | Google Cloud | Same as above |
| `NEXTAUTH_SECRET` | Self-generated | Run `openssl rand -base64 32` in your terminal |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | [supabase.com/dashboard](https://supabase.com/dashboard) → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Same as above |

### Google OAuth — required redirect URIs

Add **both** of these to your Google OAuth Client's "Authorized redirect URIs":

```
http://localhost:3000/api/auth/callback/google   ← for Sign In with Google
http://localhost:3000/api/calendar/callback       ← for Google Calendar integration
```

When deploying, replace `http://localhost:3000` with your production URL.

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
