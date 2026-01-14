# Roadmap: HealthVoice WhisperFlow

## Overview

Transform HealthVoice from a voice diary into an intelligent health companion. The journey starts with fixing existing technical debt, then building the core intelligence layer (correlations + insights), followed by engagement features (summaries, reminders), and finally passive data capture and export capabilities.

## Domain Expertise

None (React Native / Expo / Supabase — standard patterns)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Technical Debt Cleanup** - Fix stubs, implement edit/delete properly
- [ ] **Phase 2: Instant Feedback** - Micro-insights immediately after logging
- [ ] **Phase 3: Correlation Engine Core** - Database + detection algorithm
- [ ] **Phase 4: Correlation UI** - Display discovered patterns in app
- [ ] **Phase 5: Weekly Summaries** - AI-generated health narratives
- [ ] **Phase 6: Smart Reminders** - Context-aware push notifications
- [ ] **Phase 7: Apple Health Read** - Import passive health data
- [ ] **Phase 8: Data Export** - PDF reports for doctor visits
- [ ] **Phase 9: Settings Completion** - All toggles functional

## Phase Details

### Phase 1: Technical Debt Cleanup
**Goal**: Fix all TODO stubs and implement missing basic functionality
**Depends on**: Nothing (first phase)
**Research**: Unlikely (internal patterns, straightforward fixes)
**Plans**: TBD

Key work:
- Implement edit modal for health logs
- Add delete confirmation dialog
- Remove console.log stubs
- Clean up hardcoded content

### Phase 2: Instant Feedback
**Goal**: Return immediate micro-insights after every log entry
**Depends on**: Phase 1
**Research**: Likely (Claude prompt engineering for insights)
**Research topics**: Optimal prompt structure for contextual health insights
**Plans**: TBD

Key work:
- Extend `parse-health-log` to return `instant_insight` field
- Query recent logs for context before generating insight
- Create InsightBanner component
- Show insight after successful log save

### Phase 3: Correlation Engine Core
**Goal**: Build backend infrastructure to detect health patterns
**Depends on**: Phase 2
**Research**: Likely (statistical correlation algorithms, time-delayed pattern detection)
**Research topics**: Correlation algorithms for health data, confidence scoring, minimum sample sizes
**Plans**: TBD

Key work:
- Create `hv_correlations` table in Supabase
- Create `correlation-engine` edge function
- Implement correlation detection for:
  - Symptom ↔ Food (1h, 6h, 24h delays)
  - Energy ↔ Sleep
  - Mood ↔ Movement
- Statistical significance testing (min 3 occurrences)

### Phase 4: Correlation UI
**Goal**: Display discovered correlations to users
**Depends on**: Phase 3
**Research**: Unlikely (UI patterns established)
**Plans**: TBD

Key work:
- Upgrade Insights screen with correlation cards
- Design correlation visualization
- Add confidence indicators
- Replace static tips with personalized insights

### Phase 5: Weekly Summaries
**Goal**: Generate AI-powered weekly health narratives
**Depends on**: Phase 4
**Research**: Likely (Claude prompt for narrative generation, scheduling)
**Research topics**: Supabase pg_cron setup, push notification integration
**Plans**: TBD

Key work:
- Create `weekly-summary` edge function
- Create `hv_weekly_summaries` table
- Schedule with Supabase pg_cron
- Build summary view screen
- Push notification with summary link

### Phase 6: Smart Reminders
**Goal**: Context-aware notifications based on user patterns
**Depends on**: Phase 5
**Research**: Likely (expo-notifications, pattern learning)
**Research topics**: expo-notifications API, local notification scheduling, user pattern detection
**Plans**: TBD

Key work:
- Create `hv_user_patterns` table
- Build UserPatternService to learn typical logging times
- Implement smart reminder logic:
  - Meal-time learning
  - "You haven't logged in X hours" nudges
  - Evening reflection triggers
- Use expo-notifications for local scheduling

### Phase 7: Apple Health Read
**Goal**: Import passive health data from Apple Health
**Depends on**: Phase 6
**Research**: Likely (HealthKit integration, permissions)
**Research topics**: react-native-health or expo-health-connect, HealthKit permissions, background sync
**Plans**: TBD

Key work:
- Integrate HealthKit library
- Request appropriate permissions
- Auto-import: sleep, steps, heart rate, workouts
- Create sync service for background updates
- Make Apple Health toggle functional

### Phase 8: Data Export
**Goal**: Generate PDF health reports for doctor visits
**Depends on**: Phase 7
**Research**: Likely (PDF generation in React Native)
**Research topics**: react-native-pdf or expo-print, PDF layout design
**Plans**: TBD

Key work:
- Create export service
- Design PDF template with:
  - Log history
  - Detected correlations
  - Weekly trends
- Implement share functionality
- Make export button functional in settings

### Phase 9: Settings Completion
**Goal**: All settings toggles fully functional
**Depends on**: Phase 8
**Research**: Unlikely (wiring up existing UI)
**Plans**: TBD

Key work:
- Weekly digest toggle → trigger summary generation
- Notification preferences
- Data management options
- Privacy controls
- Final polish and testing

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Technical Debt Cleanup | 0/TBD | Not started | - |
| 2. Instant Feedback | 0/TBD | Not started | - |
| 3. Correlation Engine Core | 0/TBD | Not started | - |
| 4. Correlation UI | 0/TBD | Not started | - |
| 5. Weekly Summaries | 0/TBD | Not started | - |
| 6. Smart Reminders | 0/TBD | Not started | - |
| 7. Apple Health Read | 0/TBD | Not started | - |
| 8. Data Export | 0/TBD | Not started | - |
| 9. Settings Completion | 0/TBD | Not started | - |
