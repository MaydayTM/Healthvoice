# Project: HealthVoice WhisperFlow

## Core Value

Transform HealthVoice from a voice health diary into an intelligent health companion that delivers "WhisperFlow moments" — insights so valuable users can't live without the app.

## Problem Statement

HealthVoice has elegant voice-to-structured-data (Whisper + Claude) but lacks:
- Immediate value exchange after logging
- Pattern/correlation detection
- Proactive engagement
- Passive data capture

**The fatal flaw:** People stop logging because effort-to-reward ratio is catastrophically bad. User logs "Ik at een appel" → sees a card → no insight, no value.

## Success Criteria

1. Users receive instant micro-insights after every log
2. Correlation engine detects patterns (e.g., "headaches 6h after dairy")
3. Weekly AI-generated health narratives
4. Apple Health integration for passive data capture
5. Smart reminders based on user patterns

## Technical Context

| Component | Technology |
|-----------|------------|
| Frontend | React Native + Expo |
| Backend | Supabase (Edge Functions, Auth, Database) |
| Voice | Whisper API |
| AI | Claude API |
| State | React hooks + AsyncStorage |

## Existing Codebase

```
app/
├── (tabs)/
│   ├── index.tsx      # Main log view
│   ├── calendar.tsx   # Calendar view
│   ├── insights.tsx   # Basic stats (needs upgrade)
│   └── settings.tsx   # Settings (stubs)
├── onboarding.tsx
└── _layout.tsx

components/
├── VoiceButton.tsx    # Core voice input
├── LogItem.tsx        # Log display
└── ClarifyModal.tsx   # Clarification flow

lib/
├── whisper.ts         # Whisper integration
├── audio.ts           # Audio handling
└── supabase.ts        # Supabase client

supabase/functions/
└── parse-health-log/  # Claude parsing
```

## Technical Debt (from analysis)

- `handleEdit`: TODO comment, not implemented
- `handleDelete`: No confirmation dialog
- Apple Health toggle: Stub, no implementation
- Weekly digest toggle: Stub, no implementation
- Data export: Stub, no implementation
- Insights: Static tips, not personalized

## Key Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-14 | Phase-based implementation via GSD | Structured approach for complex feature set |
| 2026-01-14 | Prioritize correlation engine | Highest impact for "WhisperFlow moment" |
| 2026-01-14 | Fix value loop before friction reduction | Users need reason to return first |

## Constraints

- Maintain existing Renaissance UI aesthetic
- Dutch language support required
- Anonymous auth currently in use
- Supabase Edge Functions for backend logic

## Out of Scope (this milestone)

- Apple Watch app
- Siri Shortcuts integration
- Lock screen widget
- Social/accountability features
- Prediction engine (moonshot)
