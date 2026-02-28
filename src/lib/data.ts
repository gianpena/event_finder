export interface Review {
    id: string;
    hostName: string;       // Organizer being reviewed
    eventId: string;        // Event at which the user attended
    eventTitle: string;
    rating: number;         // 1–5
    comment: string;
    createdAt: string;      // ISO timestamp
}

export interface Event {
    id: string;
    title: string;
    type: "Academic" | "Party" | "Chill" | "Music" | "Food" | "Networking";
    date: string;       // Display string, e.g. "Tonight", "Fri, Feb 27"
    time: string;       // Display string, e.g. "9:00 PM"
    startAt: string;    // ISO 8601 datetime string used for all date calculations
    location: string;
    image: string;
    vibe: string[];
    host: {
        name: string;
        avatar: string;
    };
    price: string;
    isPrivate: boolean;
    coordinates: [number, number];
}

export const CATEGORIES = ["All", "Academic", "Party", "Chill", "Music", "Food", "Networking"];

export const MOCK_EVENTS: Event[] = [
    {
        id: "1",
        title: "FIU Car Meet: Night Shift",
        type: "Chill",
        date: "Tonight",
        time: "9:00 PM",
        startAt: "2026-02-27T21:00:00-05:00",
        location: "PG6 Rooftop, FIU",
        image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083&auto=format&fit=crop",
        vibe: ["#Cars", "#LateNight", "#Vibes"],
        host: {
            name: "Panther Motorsports",
            avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60",
        },
        price: "Free",
        isPrivate: false,
        coordinates: [25.7589, -80.3739], // PG6 area
    },
    {
        id: "3",
        title: "Greek Life Pool Party",
        type: "Party",
        date: "Fri, Feb 27",
        time: "8:00 PM",
        startAt: "2026-02-27T20:00:00-05:00",
        location: "109 Tower Pool",
        image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2070&auto=format&fit=crop",
        vibe: ["#Loud", "#GreekLife", "#College"],
        host: {
            name: "Sigma Chi",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60",
        },
        price: "$10",
        isPrivate: true,
        coordinates: [25.7601, -80.3705], // 109 Tower approx
    },
    {
        id: "4",
        title: "Library Study Grind",
        type: "Academic",
        date: "Tonight",
        time: "7:00 PM",
        startAt: "2026-02-27T19:00:00-05:00",
        location: "Green Library 2nd Floor",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop",
        vibe: ["#Focus", "#Exams", "#Coffee"],
        host: {
            name: "Study Group A",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60",
        },
        price: "Free",
        isPrivate: false,
        coordinates: [25.7562, -80.3745], // Green Library
    },
    {
        id: "5",
        title: "Food Truck Invasion",
        type: "Food",
        date: "Sat, Feb 28",
        time: "5:00 PM",
        startAt: "2026-02-28T17:00:00-05:00",
        location: "Tamiami Park",
        image: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?q=80&w=2071&auto=format&fit=crop",
        vibe: ["#Foodie", "#Outdoor", "#Music"],
        host: {
            name: "Miami Eats",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60",
        },
        price: "$$",
        isPrivate: false,
        coordinates: [25.7535, -80.3780], // Tamiami Park
    },
    {
        id: "6",
        title: "Dorm Storm",
        type: "Party",
        date: "Fri, Feb 27",
        time: "11:00 PM",
        startAt: "2026-02-27T23:00:00-05:00",
        location: "University Towers",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop",
        vibe: ["#Wild", "#DormLife", "#Late"],
        host: {
            name: "Josh P.",
            avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60",
        },
        price: "By Invite",
        isPrivate: true,
        coordinates: [25.7595, -80.3725], // Towers
    },
    {
        id: "7",
        title: "Latin Night: Salsa & Bachata",
        type: "Music",
        date: "Fri, Feb 27",
        time: "9:30 PM",
        startAt: "2026-02-27T21:30:00-05:00",
        location: "Graham Center Ballroom, FIU",
        image: "https://images.unsplash.com/photo-1545959570-a94084071b5d?q=80&w=2070&auto=format&fit=crop",
        vibe: ["#Salsa", "#Bachata", "#LatinVibes"],
        host: {
            name: "FIU Latin Dance Club",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60",
        },
        price: "$5",
        isPrivate: false,
        coordinates: [25.7575, -80.3742], // Graham Center
    },
    {
        id: "8",
        title: "FIU Hackathon 2026",
        type: "Academic",
        date: "Sat, Feb 28",
        time: "8:00 AM",
        startAt: "2026-02-28T08:00:00-05:00",
        location: "CASE Building, FIU",
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop",
        vibe: ["#Code", "#BuildSomething", "#24hrs"],
        host: {
            name: "FIU ACM Chapter",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
        },
        price: "Free",
        isPrivate: false,
        coordinates: [25.7547, -80.3738], // CASE / Engineering
    },
    {
        id: "9",
        title: "Sunset Rooftop Kickback",
        type: "Chill",
        date: "Tonight",
        time: "6:30 PM",
        startAt: "2026-02-27T18:30:00-05:00",
        location: "PG5 Rooftop, FIU",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop",
        vibe: ["#Sunset", "#GoodVibes", "#Rooftop"],
        host: {
            name: "Panther Social",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
        },
        price: "Free",
        isPrivate: false,
        coordinates: [25.7582, -80.3752], // PG5 area
    },
    {
        id: "10",
        title: "Campus Farmers Market",
        type: "Food",
        date: "Sat, Feb 28",
        time: "9:00 AM",
        startAt: "2026-02-28T09:00:00-05:00",
        location: "FIU Lakeside Lawn",
        image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2070&auto=format&fit=crop",
        vibe: ["#Fresh", "#Local", "#MorningVibes"],
        host: {
            name: "FIU Sustainability",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
        },
        price: "Free Entry",
        isPrivate: false,
        coordinates: [25.7569, -80.3763], // FIU Lake
    },
    {
        id: "11",
        title: "FinTech Networking Mixer",
        type: "Networking",
        date: "Mon, Mar 2",
        time: "6:00 PM",
        startAt: "2026-03-02T18:00:00-05:00",
        location: "Kovens Conference Center, FIU",
        image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop",
        vibe: ["#Finance", "#Startups", "#Connections"],
        host: {
            name: "FIU Business Connect",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=60",
        },
        price: "Free",
        isPrivate: false,
        coordinates: [25.7558, -80.3730], // Business district area
    },
    {
        id: "12",
        title: "Open Mic Comedy Night",
        type: "Chill",
        date: "Sun, Mar 1",
        time: "7:00 PM",
        startAt: "2026-03-01T19:00:00-05:00",
        location: "The Spot, Graham Center",
        image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?q=80&w=2071&auto=format&fit=crop",
        vibe: ["#Comedy", "#OpenMic", "#WeekendVibes"],
        host: {
            name: "FIU Stand-Up Society",
            avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop&q=60",
        },
        price: "Free",
        isPrivate: false,
        coordinates: [25.7573, -80.3746], // Graham Center / The Spot
    },
    {
        id: "13",
        title: "International Street Food Fest",
        type: "Food",
        date: "Sun, Mar 1",
        time: "12:00 PM",
        startAt: "2026-03-01T12:00:00-05:00",
        location: "University Park Plaza, FIU",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
        vibe: ["#GlobalEats", "#Outdoor", "#Culture"],
        host: {
            name: "FIU International Students",
            avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=60",
        },
        price: "$",
        isPrivate: false,
        coordinates: [25.7554, -80.3768], // University Park Plaza
    },
    {
        id: "14",
        title: "Midnight Study Hall + Free Pizza",
        type: "Academic",
        date: "Tonight",
        time: "11:00 PM",
        startAt: "2026-02-27T23:00:00-05:00",
        location: "Graham Center 140, FIU",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
        vibe: ["#FreePizza", "#ExamSeason", "#LateNight"],
        host: {
            name: "Student Gov FIU",
            avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&auto=format&fit=crop&q=60",
        },
        price: "Free",
        isPrivate: false,
        coordinates: [25.7576, -80.3740], // Graham Center
    },
    {
        id: "15",
        title: "Afrobeats Block Party",
        type: "Party",
        date: "Sat, Feb 28",
        time: "8:00 PM",
        startAt: "2026-02-28T20:00:00-05:00",
        location: "Cardinal Point Courtyard",
        image: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=2070&auto=format&fit=crop",
        vibe: ["#Afrobeats", "#BlockParty", "#Dance"],
        host: {
            name: "FIU African Student Union",
            avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=60",
        },
        price: "$8",
        isPrivate: false,
        coordinates: [25.7603, -80.3710], // Cardinal Point
    },
    {
        id: "16",
        title: "Dawn 5K Fun Run",
        type: "Chill",
        date: "Sat, Feb 28",
        time: "7:00 AM",
        startAt: "2026-02-28T07:00:00-05:00",
        location: "FIU Campus Trail",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop",
        vibe: ["#Running", "#Wellness", "#EarlyBird"],
        host: {
            name: "FIU Running Club",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60",
        },
        price: "Free",
        isPrivate: false,
        coordinates: [25.7543, -80.3756], // Campus trail / Wertheim area
    },
];
