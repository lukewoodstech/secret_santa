# Secret Santa Generator

A clean, modern web application for generating Secret Santa assignments with exclusion rules. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- ✅ Add participants with names and optional exclusions
- ✅ Generate Secret Santa assignments that respect all exclusion rules
- ✅ Unique, shareable links for each participant
- ✅ Participants can only see their own assignment
- ✅ Clean, intuitive UI with modern design
- ✅ Robust assignment algorithm that ensures valid pairings

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding Participants

1. Enter a participant's name in the input field
2. (Optional) Select exclusions - people this person cannot be assigned to
3. Click "Add Person" to add them to the list
4. Repeat for all participants

### Generating Assignments

1. Add at least 3 participants
2. Click "Generate Assignments"
3. The app will create valid Secret Santa pairings that respect all exclusion rules
4. Each participant will get a unique shareable link

### Sharing Assignments

1. After generation, you'll see a list of all participants with their unique links
2. Click "Copy Link" next to each participant's name
3. Share the link with that person
4. When they open the link, they'll only see their own assignment

## How It Works

### Assignment Algorithm

The app uses a deterministic algorithm that:
1. Creates random permutations of participants
2. Validates each permutation against exclusion rules
3. Ensures no self-assignments
4. Retries up to 1000 times to find a valid assignment

### Storage

Assignments are stored in-memory on the server. This means:
- Assignments persist while the server is running
- Assignments are lost when the server restarts
- For production use, consider implementing persistent storage (database)

## Project Structure

```
secret_santa/
├── app/
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts          # API route for generating assignments
│   │   └── reveal/
│   │       └── [id]/
│   │           └── route.ts      # API route for fetching assignments
│   ├── reveal/
│   │   └── [id]/
│   │       └── page.tsx          # Individual reveal page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── lib/
│   ├── assignment.ts             # Assignment algorithm
│   └── storage.ts                 # In-memory storage
└── package.json
```

## Building for Production

```bash
npm run build
npm start
```

## Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **nanoid** - Secure URL ID generation

## License

MIT
