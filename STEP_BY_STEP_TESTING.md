# 🎯 STEP-BY-STEP TESTING GUIDE
## Complete Workflow: Strategy Creation → Competition Submission

**Follow these exact steps to test the entire TradeIQ platform.**

---

## 🚀 **SETUP (One-Time)**

### Step 1: Start Development Server
```bash
cd /Users/aleks/Documents/TradeIQ.gg
npm run dev
```
**Expected:** Server starts on http://localhost:3000

### Step 2: Apply Database Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/004_community_chat.sql`
3. Paste and run
4. **Expected:** `community_chat_messages` table created

---

## 👤 **PART 1: USER SETUP**

### Step 3: Connect Wallet
1. **Open:** http://localhost:3000
2. **Click:** "Connect Wallet" button (top right)
3. **Select:** Phantom wallet
4. **Approve:** Connection in wallet popup
5. **Expected:** 
   - Wallet address appears briefly
   - Redirects to `/setup-username`

### Step 4: Set Username
1. **Page:** `/setup-username` (auto-redirect)
2. **Type:** `test_trader` (or any unique username)
3. **Click:** "Continue"
4. **Expected:**
   - Redirects to `/dashboard`
   - Header shows your username instead of wallet address

---

## 📝 **PART 2: CREATE STRATEGY**

### Step 5: Create New Strategy
1. **Page:** Dashboard (`/dashboard`)
2. **Click:** "+ New Strategy" button (top right)
3. **Expected:** 
   - Redirects to `/strategy/[new-id]`
   - IDE opens with default strategy structure

### Step 6: Verify Default Structure
1. **Click:** "JSON / Advanced" tab
2. **Check:** JSON should show:
   ```json
   {
     "meta": { "name": "Untitled Strategy", ... },
     "settings": { "symbol": "BTCUSDT", "timeframe": "1h", ... },
     "rules": { "entry": [...], "exit": [...] },
     "risk": { "stop_loss_percent": 2, "take_profit_percent": 4 }
   }
   ```
3. **Expected:** Valid JSON structure with all required fields

---

## ✏️ **PART 3: EDIT STRATEGY**

### Step 7: Edit Title (English Mode)
1. **Tab:** "English Mode" (default)
2. **Find:** "STRATEGY TITLE" input
3. **Type:** `RSI Crossover Strategy`
4. **Expected:** Auto-saves after 1 second

### Step 8: Write Strategy Description
1. **Find:** Large textarea "DESCRIBE YOUR STRATEGY..."
2. **Type:**
   ```
   Buy when RSI is below 30 and price is above 20-day moving average.
   Sell when RSI is above 70 or price drops below moving average.
   Use 2% position size with 3% stop loss.
   ```
3. **Click:** "CONVERT TO LOGIC" button
4. **Expected:** 
   - Button shows "CONVERTING..." (2 seconds)
   - Mock conversion creates JSON/Blocks
   - Strategy auto-saves

### Step 9: Edit JSON Directly
1. **Click:** "JSON / Advanced" tab
2. **Find:** `"symbol": "BTCUSDT"` in settings
3. **Change to:** `"symbol": "ETHUSDT"`
4. **Find:** `"timeframe": "1h"`
5. **Change to:** `"timeframe": "4h"`
6. **Expected:**
   - Status bar shows "✓ Valid JSON"
   - Auto-saves
   - Syncs to TQL (if sync working)

### Step 10: Test JSON Validation
1. **In JSON editor:** Remove a closing brace `}`
2. **Expected:**
   - Status bar shows "❌ Invalid"
   - Error: "Invalid JSON syntax"
3. **Fix:** Add the brace back
4. **Expected:** Validation passes

---

## 🧩 **PART 4: BLOCK MODE**

### Step 11: View Blocks
1. **Click:** "Block Mode" tab
2. **Expected:** Visual block editor opens
3. **See:** Blocks representing strategy:
   - Green blocks (conditions)
   - Blue blocks (actions)
   - Purple blocks (indicators)

### Step 12: Select Block
1. **Click:** On any block
2. **Expected:**
   - Block highlights
   - Right sidebar shows "Block Properties Panel"
   - Properties editable

---

## 📊 **PART 5: RUN BACKTEST**

### Step 13: Open Backtest Panel
1. **Click:** "Backtests" tab
2. **Expected:** Backtest controls appear

### Step 14: Configure Backtest
1. **Symbol field:** Type `BTCUSDT` (or leave default)
2. **Timeframe dropdown:** Select `1h`
3. **Start Date:** Click date picker → Select date 30 days ago
4. **End Date:** Click date picker → Select today
5. **Initial Balance:** Type `1000` (or leave default)

### Step 15: Verify Validation
1. **Check:** Status above controls
2. **Expected:** "✓ Strategy Valid" (green checkmark)
3. **If Invalid:** 
   - Read error message
   - Fix in JSON mode
   - Return to Backtests tab

### Step 16: Run Backtest
1. **Click:** "Run Backtest" button (blue button, bottom right)
2. **Expected:**
   - Button shows "Running..."
   - Loading spinner appears
   - Progress updates
   - After 5-10 seconds, results appear

### Step 17: View Results
1. **Check:** Results tabs:
   - **Charts:** Candlestick chart with trade markers ✅
   - **Equity:** Equity curve over time ✅
   - **Drawdown:** Drawdown visualization ✅
   - **Trades:** List of all trades ✅
   - **Rules:** Heatmap of rule triggers ✅
   - **Logs:** Execution logs ✅
   - **History:** Previous backtests ✅

2. **Click:** Each tab to view different data
3. **Verify:** 
   - PnL percentage shown (e.g., "+12.5%")
   - Win rate displayed (e.g., "62.5%")
   - Total trades count
   - Max drawdown shown

---

## 🔴 **PART 6: LIVE MONITOR**

### Step 18: Open Live Monitor
1. **Click:** "Live Monitor" tab
2. **Expected:** Live monitoring panel opens
3. **Verify:** No crash (previously would crash)

### Step 19: Start Live Monitoring
1. **Click:** "Start Live" button (green button)
2. **Expected:**
   - Button changes to "Stop" (red)
   - Chart starts updating
   - Real-time price data flows
   - Stats update

### Step 20: View Live Stats
1. **Click:** "Stats" tab
2. **Expected:** See:
   - Balance: $1000.00
   - Equity: $1000.00
   - Unrealized PnL: $0.00
   - Max Drawdown: 0%
   - Open Trades: 0
   - Closed Trades: 0

### Step 21: Stop Monitoring
1. **Click:** "Stop" button
2. **Expected:** Monitoring stops, updates halt

---

## 🐛 **PART 7: TEST DEBUGGING**

### Step 22: Test Invalid Strategy
1. **Switch to:** JSON Mode
2. **Find:** `risk` section
3. **Delete:** `"stop_loss_percent": 2,` line
4. **Switch to:** Backtests tab
5. **Expected:**
   - Status shows "✗ Strategy Invalid"
   - Error: "Strategy validation failed: stop_loss_percent is required"
   - "Run Backtest" button is disabled (grayed out)

### Step 23: Fix Strategy
1. **Return to:** JSON Mode
2. **Add back:** `"stop_loss_percent": 2,` in risk section
3. **Switch to:** Backtests tab
4. **Expected:**
   - Status shows "✓ Strategy Valid"
   - Button enabled
   - Can run backtest

### Step 24: Test Error Boundary
1. **In JSON Mode:** Type invalid JSON: `{ "invalid": }`
2. **Expected:**
   - Error message appears
   - IDE doesn't crash
   - Can still navigate tabs
3. **Fix:** Correct to valid JSON
4. **Expected:** Error clears

---

## 🏆 **PART 8: COMPETITION SUBMISSION**

### Step 25: Navigate to Competitions
1. **Click:** "Competitions" in header navigation
2. **Expected:** Competitions page loads

### Step 26: View Competitions
1. **Check:** List of competitions
2. **Expected:** See:
   - Active competitions (if any exist)
   - Upcoming competitions
   - Prize pools (e.g., "10 SOL")
   - End dates

### Step 27: Select Competition
1. **Click:** "VIEW DETAILS" button on an active competition
2. **Expected:** Competition details expand below

### Step 28: Select Your Strategy
1. **Find:** "SELECT STRATEGY" dropdown
2. **Click:** Dropdown
3. **Select:** "RSI Crossover Strategy" (your strategy)
4. **Expected:** Strategy selected

### Step 29: Join Competition
1. **Click:** "JOIN COMPETITION" button
2. **Expected:**
   - Button shows spinner
   - Alert: "Successfully joined competition!"
   - Leaderboard updates
   - Your entry appears with username

### Step 30: View Leaderboard
1. **Check:** Leaderboard section
2. **Expected:** See:
   - Your entry: `#1 USER test_trader` (or your rank)
   - PnL: `$0.00` (initial)
   - Other participants (if any)

---

## 💬 **PART 9: COMMUNITY CHAT**

### Step 31: Navigate to Community Chat
1. **Click:** "Community Chat" in header (only visible when logged in)
2. **Expected:** Community chat page loads

### Step 32: Send Message
1. **Find:** Message input box at bottom
2. **Type:** `Hello! Testing the TradeIQ chat system.`
3. **Press:** Enter OR click "Send" button
4. **Expected:**
   - Message appears immediately
   - Shows your username: `test_trader`
   - Shows timestamp: "just now"
   - Auto-scrolls to bottom

### Step 33: View Messages
1. **Check:** Message list
2. **Expected:** See all community messages
3. **Verify:** Messages update in real-time (if others chatting)

---

## 🔍 **PART 10: PUBLISH STRATEGY**

### Step 34: Return to Strategy IDE
1. **Navigate to:** Dashboard
2. **Click:** On your strategy card ("RSI Crossover Strategy")
3. **Expected:** Strategy IDE opens

### Step 35: Publish Strategy
1. **Click:** "Settings" tab
2. **Find:** "Publishing" section
3. **Check:** Current visibility (should be "private")
4. **Click:** "Publish Strategy" button
5. **Expected:**
   - Button shows "Publishing..."
   - Alert: "Strategy published successfully!"
   - Visibility changes to "public"
   - Message: "✓ Strategy is public and visible in Discover"

### Step 36: Verify in Discover
1. **Navigate to:** `/discover` (or click Discover link if available)
2. **Expected:** Discover page loads
3. **Check:** Your strategy appears in the list
4. **Verify:** Shows:
   - Title: "RSI Crossover Strategy"
   - Your username: `test_trader`
   - Like count: 0
   - Fork count: 0

---

## ✅ **FINAL VERIFICATION**

### Complete Checklist:
- [x] Username set and displayed
- [x] Strategy created with valid structure
- [x] Edited in English mode
- [x] Edited in JSON mode
- [x] Viewed in Block mode
- [x] Backtest ran successfully
- [x] Backtest results displayed
- [x] Live Monitor started without crash
- [x] Live Monitor showed real-time data
- [x] Strategy validated correctly
- [x] Error handling worked
- [x] Competition submission successful
- [x] Strategy appears in leaderboard
- [x] Community chat sent/received messages
- [x] Strategy published
- [x] Strategy appears in Discover

---

## 🎯 **QUICK REFERENCE**

### Navigation Shortcuts:
- **Dashboard:** `/dashboard` or click "Dashboard" in header
- **Competitions:** `/competitions` or click "Competitions" in header
- **Community Chat:** `/community` or click "Community Chat" in header
- **Discover:** `/discover`
- **Strategy IDE:** `/strategy/[id]`

### Key Actions:
- **Create Strategy:** Dashboard → "+ New Strategy"
- **Run Backtest:** Strategy IDE → Backtests tab → Configure → "Run Backtest"
- **Start Live:** Strategy IDE → Live Monitor tab → "Start Live"
- **Publish:** Strategy IDE → Settings tab → "Publish Strategy"
- **Join Competition:** Competitions → Select competition → Select strategy → "JOIN COMPETITION"

---

## 🐛 **TROUBLESHOOTING**

### Problem: Username setup doesn't appear
**Solution:** Check browser console, verify Supabase connection

### Problem: Backtest doesn't run
**Solution:** 
- Verify strategy has valid structure (check JSON tab)
- Ensure symbol/timeframe are set
- Check date range is valid
- Look at browser console for errors

### Problem: Live Monitor crashes
**Solution:** 
- Verify strategy has `settings.symbol` and `settings.timeframe`
- Check strategy JSON is valid
- Refresh page

### Problem: Competition submission fails
**Solution:**
- Verify strategy is valid
- Check competition is active
- Ensure logged in
- Check browser console

### Problem: Community chat doesn't work
**Solution:**
- Verify migration `004_community_chat.sql` applied
- Check Supabase Realtime enabled
- Verify authenticated
- Check browser console

---

**🎉 You've completed the full testing workflow!**

All features from Chapters 1-12 are now functional and tested.

