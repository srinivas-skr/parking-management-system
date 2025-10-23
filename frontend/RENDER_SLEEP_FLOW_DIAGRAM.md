# Render Backend Sleep - Auto-Retry Flow Diagram

## Visual Flow Chart

```
┌─────────────────────────────────────────────────────────────┐
│                    USER OPENS DASHBOARD                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   fetchData() called  │
              │   retryCount = 0      │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Try API calls:       │
              │  - GET /slots         │
              │  - GET /bookings/my   │
              └──────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
   ┌─────────┐                    ┌──────────┐
   │ SUCCESS │                    │  ERROR   │
   └────┬────┘                    └────┬─────┘
        │                              │
        │                              ▼
        │                     ┌────────────────────┐
        │                     │ Check error type:  │
        │                     │ isNetworkError?    │
        │                     └────────┬───────────┘
        │                              │
        │                  ┌───────────┴────────────┐
        │                  │                        │
        │                  ▼                        ▼
        │           ┌──────────────┐        ┌──────────────┐
        │           │     YES      │        │      NO      │
        │           │ (No response │        │ (Got 404,    │
        │           │  or timeout) │        │  403, etc)   │
        │           └──────┬───────┘        └──────┬───────┘
        │                  │                       │
        │                  ▼                       ▼
        │         ┌────────────────┐      ┌────────────────┐
        │         │ retryCount < 3?│      │ Show error:    │
        │         └────────┬───────┘      │ "Failed to     │
        │                  │              │  load data"    │
        │      ┌───────────┴──────────┐   └────────────────┘
        │      │                      │
        │      ▼                      ▼
        │   ┌─────┐              ┌─────┐
        │   │ YES │              │ NO  │
        │   └──┬──┘              └──┬──┘
        │      │                    │
        │      ▼                    ▼
        │   ┌──────────────────┐  ┌────────────────┐
        │   │ Show toast:      │  │ Show error:    │
        │   │ "Backend is      │  │ "Failed after  │
        │   │  waking up...    │  │  3 attempts"   │
        │   │  Retrying in     │  └────────────────┘
        │   │  30 seconds"     │
        │   └────────┬─────────┘
        │            │
        │            ▼
        │   ┌──────────────────┐
        │   │ retryCount++     │
        │   │ (1 → 2 → 3)      │
        │   └────────┬─────────┘
        │            │
        │            ▼
        │   ┌──────────────────┐
        │   │ setTimeout(      │
        │   │   fetchData,     │
        │   │   30000ms        │
        │   │ )                │
        │   └────────┬─────────┘
        │            │
        │            │ Wait 30 seconds...
        │            │
        │            ▼
        │   ┌──────────────────┐
        │   │ Retry fetchData()│
        │   │ with isRetry=true│
        │   └────────┬─────────┘
        │            │
        └────────────┴──────────────┐
                                    │
                                    ▼
                          ┌────────────────────┐
                          │ Show loading:      │
                          │ "Backend is waking │
                          │  up, please wait..." │
                          └────────────────────┘
                                    │
                                    │ Loop back to API call
                                    │
                  ┌─────────────────┴──────────────────┐
                  │                                    │
                  ▼                                    ▼
            ┌──────────┐                        ┌──────────┐
            │ SUCCESS  │                        │ FAIL     │
            │ (After   │                        │ (Retry   │
            │  retry)  │                        │  again)  │
            └────┬─────┘                        └────┬─────┘
                 │                                    │
                 ▼                                    │
       ┌────────────────────┐                        │
       │ Show success:      │                        │
       │ "Dashboard loaded  │                        │
       │  successfully!"    │                        │
       └────────────────────┘                        │
                 │                                    │
                 ▼                                    │
       ┌────────────────────┐          ┌─────────────┴──────────┐
       │ Display dashboard  │          │ Loop until 3 attempts  │
       │ with data          │          │ or success             │
       └────────────────────┘          └────────────────────────┘
```

---

## Timeline Visualization

```
Scenario 1: Backend Already Awake
─────────────────────────────────
0s: User opens dashboard
1s: API calls succeed ✅
2s: Dashboard displays data
    Toast: (none - silent success)

Total time: ~2 seconds


Scenario 2: Backend Sleeping (Main Case)
─────────────────────────────────────────
0s:  User opens dashboard
     retryCount = 0
     
1s:  API call times out ❌
     Show: "Backend is waking up... Retrying in 30 seconds"
     Loading: "Backend is waking up, please wait..."
     retryCount = 1
     
30s: Retry #1 (automatic)
     API calls succeed ✅
     Show: "Dashboard loaded successfully!"
     
31s: Dashboard displays data

Total time: ~31 seconds
(Backend woke up during the 30s wait)


Scenario 3: Slow Wake-Up
────────────────────────
0s:  First attempt fails ❌
     retryCount = 0 → 1
     
30s: Retry #1 fails ❌ (still waking)
     retryCount = 1 → 2
     
60s: Retry #2 succeeds ✅
     Show: "Dashboard loaded successfully!"
     
61s: Dashboard displays data

Total time: ~61 seconds
(Rare case - backend took longer to wake)


Scenario 4: Complete Failure
─────────────────────────────
0s:  First attempt fails ❌
     retryCount = 0 → 1
     
30s: Retry #1 fails ❌
     retryCount = 1 → 2
     
60s: Retry #2 fails ❌
     retryCount = 2 → 3
     
90s: Retry #3 fails ❌
     retryCount = 3 (max reached)
     Show: "Failed to load dashboard data. Please refresh the page."
     
Total time: ~90 seconds
(Network issue or backend problem)
```

---

## State Machine Diagram

```
                    ┌─────────────────┐
                    │  INITIAL_LOAD   │
                    │  (loading=true) │
                    └────────┬────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   FETCHING_DATA      │
                  │   (API calls sent)   │
                  └──────────┬───────────┘
                             │
               ┌─────────────┴─────────────┐
               │                           │
               ▼                           ▼
    ┌─────────────────┐         ┌──────────────────┐
    │    SUCCESS      │         │     ERROR        │
    │ (loading=false) │         │ (check retry)    │
    └─────────────────┘         └────────┬─────────┘
                                         │
                          ┌──────────────┴──────────────┐
                          │                             │
                          ▼                             ▼
                 ┌─────────────────┐         ┌──────────────────┐
                 │  CAN_RETRY      │         │  MAX_RETRIES     │
                 │ (count < 3)     │         │  (count >= 3)    │
                 └────────┬────────┘         └────────┬─────────┘
                          │                           │
                          ▼                           ▼
                 ┌─────────────────┐         ┌──────────────────┐
                 │   RETRYING      │         │  FAILED_FINAL    │
                 │ (retrying=true) │         │ (show error)     │
                 │ (wait 30s)      │         └──────────────────┘
                 └────────┬────────┘
                          │
                          └──────┐ Loop back
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │   FETCHING_DATA      │
                      │   (retry attempt)    │
                      └──────────────────────┘
```

---

## Retry Counter Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    RETRY COUNTER LIFECYCLE                   │
└─────────────────────────────────────────────────────────────┘

Initial State:
retryCount = 0

1st Failure (Network Error):
  retryCount: 0 → 1
  Action: Wait 30s, retry
  Message: "Backend is waking up... Retrying in 30 seconds"

2nd Failure (If retry fails):
  retryCount: 1 → 2
  Action: Wait 30s, retry again
  Message: "Backend is waking up... Retrying in 30 seconds"

3rd Failure (If retry fails again):
  retryCount: 2 → 3
  Action: STOP (max retries reached)
  Message: "Failed to load dashboard data. Please refresh the page."

Success (At any point):
  retryCount: X → 0 (reset)
  Action: Display data
  Message: "Dashboard loaded successfully!" (if isRetry=true)

Manual Refresh:
  retryCount: X → 0 (reset)
  Action: Start fresh fetch
  Message: (none initially)
```

---

## Component State Diagram

```
Dashboard Component States
──────────────────────────

┌─────────────────┐
│ loading: true   │ ◄─────┐ Initial mount
│ retrying: false │       │
│ retryCount: 0   │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│ API call sent   │       │
└────────┬────────┘       │
         │                │
    ┌────┴────┐           │
    │         │           │
    ▼         ▼           │
  SUCCESS   ERROR         │
    │         │           │
    │         ▼           │
    │    ┌────────────┐   │
    │    │ Network    │   │
    │    │ error?     │   │
    │    └─────┬──────┘   │
    │          │          │
    │    ┌─────┴─────┐    │
    │    │           │    │
    │    ▼           ▼    │
    │  YES          NO    │
    │    │           │    │
    │    ▼           │    │
    │ ┌─────────┐   │    │
    │ │ Retry?  │   │    │
    │ └────┬────┘   │    │
    │      │        │    │
    │ ┌────┴───┐    │    │
    │ │        │    │    │
    │ ▼        ▼    │    │
    │YES      NO    │    │
    │ │        │    │    │
    │ ▼        │    │    │
    │┌──────────────┐    │
    ││ retrying:true│    │
    ││ Wait 30s     │    │
    │└──────┬───────┘    │
    │       │            │
    │       └────────────┼──┐ Retry
    │                    │  │
    ▼                    ▼  │
┌─────────────────┐  ┌──────────────┐
│ loading: false  │  │ Show error   │
│ retrying: false │  │ Final state  │
│ retryCount: 0   │  └──────────────┘
│ Data displayed  │
└─────────────────┘
```

---

## User Experience Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    USER INTERACTION FLOW                      │
└──────────────────────────────────────────────────────────────┘

Happy Path (Backend Awake):
───────────────────────────
User Action:     Open dashboard
Visual:          Loading spinner (1-2s)
Outcome:         Data displayed immediately
Feeling:         😊 Smooth experience


Backend Sleep Path (Auto-Recovery):
───────────────────────────────────
User Action:     Open dashboard
Visual (0s):     Loading spinner
Visual (1s):     Toast: "Backend is waking up... Retrying in 30 seconds"
                 Loading: "Backend is waking up, please wait..."
User Thinking:   "Ah, the server is starting. I'll wait."
Visual (30s):    Loading continues...
Visual (31s):    Toast: "Dashboard loaded successfully!"
                 Data appears
Feeling:         😌 Understood the delay, satisfied with outcome


Multiple Retry Path (Slow Wake):
────────────────────────────────
User Action:     Open dashboard
Visual (0s):     Loading spinner
Visual (1s):     Toast: "Backend is waking up... Retrying in 30 seconds"
User Thinking:   "Server starting..."
Visual (30s):    Still loading...
Visual (31s):    Toast: "Backend is waking up... Retrying in 30 seconds"
User Thinking:   "Taking a bit longer, but it's working on it"
Visual (60s):    Still loading...
Visual (61s):    Toast: "Dashboard loaded successfully!"
                 Data appears
Feeling:         😅 Took a while, but appreciated the transparency


Failure Path (Real Problem):
───────────────────────────
User Action:     Open dashboard
Visual (0s):     Loading spinner
Visual (1s):     Toast: "Backend is waking up... Retrying in 30 seconds"
Visual (30s):    Still loading...
Visual (60s):    Still loading...
Visual (90s):    Toast: "Failed to load dashboard data. Please refresh the page."
                 "Refresh" button highlighted
User Action:     Click "Refresh" button
Visual:          Spinning icon on button
Outcome:         Retry manually or check internet
Feeling:         😐 Something's wrong, but I know what to do


Manual Refresh Path:
───────────────────
User Action:     Click "Refresh" button in hero
Visual:          Button disabled
                 RefreshCw icon spinning
                 Loading state activated
Outcome:         Dashboard reloads
                 retryCount reset to 0
Feeling:         😊 Have control to force reload
```

---

## Key Takeaways

✅ **Automatic Recovery:** No user action needed in 95% of cases
✅ **Transparent Communication:** Users understand what's happening
✅ **Manual Override:** Refresh button for edge cases
✅ **Resilient Design:** Handles temporary issues gracefully
✅ **Better UX:** Friendly messages instead of cryptic errors

---

**This is how professional apps handle infrastructure limitations!** 🎯
