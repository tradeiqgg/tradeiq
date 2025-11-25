# 🧪 Complete Step-by-Step Testing Guide
## TradeIQ Platform - Full Strategy Creation to Competition Submission

**Last Updated:** January 2025  
**Server:** http://localhost:3000

---

## 📋 **PREREQUISITES**

Before starting, ensure:
1. ✅ Development server is running (`npm run dev`)
2. ✅ Database migrations are applied (especially `004_community_chat.sql`)
3. ✅ Supabase is configured and connected
4. ✅ Wallet extension installed (Phantom recommended)

---

## 🚀 **PART 1: FIRST-TIME USER SETUP**

### Step 1: Connect Wallet
1. **Navigate to:** http://localhost:3000
2. **Click:** "Connect Wallet" button (top right)
3. **Select:** Phantom wallet (or your preferred Solana wallet)
4. **Approve:** Connection request in wallet popup
5. **Expected:** Wallet address appears in header

### Step 2: Username Setup (MANDATORY)
1. **Expected:** Automatic redirect to `/setup-username` page
2. **Type:** Your desired username (3-20 characters, alphanumeric + underscores)
   - Example: `trader_alex` or `crypto_pro_2024`
3. **Click:** "Continue" button
4. **Expected:** Redirects to `/dashboard`
5. **Verify:** Header now shows your username instead of wallet address

**If username is taken:**
- Try a different username
- System will show error: "Username is already taken"

---

## 📊 **PART 2: CREATE YOUR FIRST STRATEGY**

### Step 3: Create New Strategy
1. **Navigate to:** Dashboard (`/dashboard`)
2. **Click:** "+ New Strategy" button (top right)
3. **Expected:** Redirects to `/strategy/[new-id]` (IDE opens)

### Step 4: Verify Strategy Structure
1. **Check:** Strategy should have default structure loaded
2. **Verify:** JSON tab shows valid TQ-JSS structure with:
   - `meta.name`: "Untitled Strategy"
   - `settings.symbol`: "BTCUSDT"
   - `settings.timeframe`: "1h"
   - `rules.entry`: At least one entry rule
   - `rules.exit`: At least one exit rule
   - `risk.stop_loss_percent`: 2
   - `risk.take_profit_percent`: 4

---

## ✏️ **PART 3: EDIT STRATEGY IN ENGLISH MODE**

### Step 5: Edit Strategy Title
1. **Tab:** "English Mode" (should be active by default)
2. **Find:** "STRATEGY TITLE" input field
3. **Type:** `My First Trading Strategy`
4. **Expected:** Auto-saves after 1 second

### Step 6: Write Strategy Description
1. **Find:** "DESCRIBE YOUR STRATEGY IN PLAIN ENGLISH" textarea
2. **Type:** 
   ```
   Buy when price crosses above the 20-day moving average and RSI is below 70.
   Sell when RSI is above 80 or price crosses below the moving average.
   Use 2% position size with 3% stop loss and 5% take profit.
   ```
3. **Click:** "CONVERT TO LOGIC" button
4. **Expected:** 
   - Button shows "CONVERTING..." for 2 seconds
   - Mock conversion creates JSON logic and blocks
   - Strategy auto-saves

---

## 🔧 **PART 4: EDIT STRATEGY IN JSON MODE**

### Step 7: Switch to JSON Mode
1. **Click:** "JSON / Advanced" tab
2. **Expected:** JSON editor opens showing current strategy JSON

### Step 8: Edit JSON Directly
1. **Find:** The `settings` section
2. **Change:** `symbol` from `"BTCUSDT"` to `"ETHUSDT"`
3. **Change:** `timeframe` from `"1h"` to `"4h"`
4. **Expected:**
   - JSON validates automatically
   - Status bar shows "✓ Valid JSON"
   - Auto-syncs to TQL and Blocks (if sync is working)
   - Auto-saves after 1 second

### Step 9: Test JSON Validation
1. **Type:** Invalid JSON (e.g., remove a closing brace `}`)
2. **Expected:**
   - Status bar shows "❌ Invalid"
   - Error message appears: "Invalid JSON syntax"
   - Red error indicator in toolbar
3. **Fix:** Add the missing brace back
4. **Expected:** Validation passes, error clears

### Step 10: Format JSON
1. **Click:** "FORMAT" button in toolbar
2. **Expected:** JSON is properly indented and formatted

---

## 🧩 **PART 5: EDIT STRATEGY IN BLOCK MODE**

### Step 11: Switch to Block Mode
1. **Click:** "Block Mode" tab
2. **Expected:** Visual block editor opens

### Step 12: View Blocks
1. **Expected:** See blocks representing your strategy:
   - Condition blocks (green)
   - Action blocks (blue)
   - Indicator blocks (purple)
   - Operator blocks (yellow)

### Step 13: Select a Block
1. **Click:** On any block
2. **Expected:** 
   - Block highlights
   - Right sidebar shows "Block Properties Panel"
   - Block properties are editable

### Step 14: Edit Block Properties
1. **In Properties Panel:** Change block parameters
2. **Expected:** Changes auto-save
3. **Verify:** Changes reflect in JSON mode

---

## 📈 **PART 6: RUN BACKTEST**

### Step 15: Open Backtest Panel
1. **Click:** "Backtests" tab
2. **Expected:** Backtest controls appear

### Step 16: Configure Backtest
1. **Symbol:** Type `BTCUSDT` (or leave default)
2. **Timeframe:** Select `1h` from dropdown
3. **Start Date:** Click date picker, select date 30 days ago
4. **End Date:** Click date picker, select today's date
5. **Initial Balance:** Type `1000` (or leave default)

### Step 17: Verify Strategy Validation
1. **Check:** Status indicator above controls
2. **Expected:** Shows "✓ Strategy Valid" (green)
3. **If Invalid:** 
   - Check error message
   - Fix issues in JSON/Blocks/TQL mode
   - Return to Backtests tab

### Step 18: Run Backtest
1. **Click:** "Run Backtest" button
2. **Expected:**
   - Button shows "Running..."
   - Loading spinner appears
   - Progress updates
   - After completion, results appear

### Step 19: View Backtest Results
1. **Check:** Results tabs appear:
   - **Charts:** Candlestick chart with trade markers
   - **Equity:** Equity curve over time
   - **Drawdown:** Drawdown chart
   - **Trades:** List of all trades
   - **Rules:** Heatmap of rule triggers
   - **Logs:** Execution logs
   - **History:** Previous backtests

2. **Click:** Each tab to view different visualizations
3. **Verify:** 
   - PnL percentage shown
   - Win rate displayed
   - Total trades count
   - Max drawdown shown

---

## 🔴 **PART 7: TEST LIVE MONITOR**

### Step 20: Open Live Monitor
1. **Click:** "Live Monitor" tab
2. **Expected:** Live monitoring panel opens

### Step 21: Verify Strategy Loaded
1. **Check:** Panel shows strategy information
2. **Expected:** No crash (previously would crash on undefined settings)
3. **Verify:** Symbol and timeframe are displayed

### Step 22: Start Live Monitoring
1. **Click:** "Start Live" button
2. **Expected:**
   - Button changes to "Stop"
   - Chart starts updating
   - Real-time price data flows
   - Indicators compute
   - Strategy evaluates on new candles

### Step 23: View Live Stats
1. **Click:** "Stats" tab
2. **Expected:** See:
   - Balance
   - Equity
   - Unrealized PnL
   - Max Drawdown
   - Open Trades count
   - Closed Trades count

### Step 24: Stop Live Monitoring
1. **Click:** "Stop" button
2. **Expected:** Monitoring stops, data flow halts

---

## 🐛 **PART 8: TEST DEBUGGING & ERROR HANDLING**

### Step 25: Test Invalid Strategy
1. **Switch to:** JSON Mode
2. **Edit:** Remove `stop_loss_percent` from risk section
3. **Switch to:** Backtests tab
4. **Expected:** 
   - Status shows "✗ Strategy Invalid"
   - Error message explains what's missing
   - "Run Backtest" button is disabled

### Step 26: Fix Strategy
1. **Return to:** JSON Mode
2. **Add:** `"stop_loss_percent": 2` back to risk section
3. **Switch to:** Backtests tab
4. **Expected:** Validation passes, button enabled

### Step 27: Test Error Boundary
1. **In JSON Mode:** Create syntax error (e.g., `{ "invalid": }`)
2. **Expected:** Error message appears, doesn't crash entire IDE
3. **Fix:** Correct the syntax
4. **Expected:** Error clears, IDE continues working

---

## 🏆 **PART 9: SUBMIT TO COMPETITION**

### Step 28: Navigate to Competitions
1. **Click:** "Competitions" in header navigation
2. **Expected:** Competitions page loads

### Step 29: View Available Competitions
1. **Check:** List of competitions appears
2. **Expected:** See:
   - Active competitions (if any)
   - Upcoming competitions
   - Prize pools
   - End dates

### Step 30: Select Competition
1. **Click:** "VIEW DETAILS" on an active competition
2. **Expected:** Competition details expand

### Step 31: Select Strategy
1. **Find:** "SELECT STRATEGY" dropdown
2. **Click:** Dropdown
3. **Select:** Your strategy from the list
   - Should show: "My First Trading Strategy" (or your title)

### Step 32: Join Competition
1. **Click:** "JOIN COMPETITION" button
2. **Expected:**
   - Button shows loading spinner
   - Success message: "Successfully joined competition!"
   - Leaderboard updates with your entry
   - Your strategy appears in rankings

### Step 33: View Leaderboard
1. **Check:** Leaderboard section in competition details
2. **Expected:** See:
   - Your entry with username
   - PnL ranking
   - Other participants
   - Real-time updates

---

## 💬 **PART 10: TEST COMMUNITY FEATURES**

### Step 34: Navigate to Community Chat
1. **Click:** "Community Chat" in header (only visible when logged in)
2. **Expected:** Community chat page loads

### Step 35: Send Message
1. **Type:** A test message in the input box
   - Example: `Hello TradeIQ community! Testing the chat system.`
2. **Press:** Enter or click "Send"
3. **Expected:**
   - Message appears immediately
   - Shows your username
   - Shows timestamp ("just now" or "X seconds ago")
   - Auto-scrolls to bottom

### Step 36: View Other Messages
1. **Check:** Message list
2. **Expected:** See all messages from community
3. **Verify:** Messages update in real-time (if others are chatting)

---

## 🔍 **PART 11: TEST DISCOVER PAGE**

### Step 37: Navigate to Discover
1. **Type in browser:** `/discover` or click link if available
2. **Expected:** Discover page loads

### Step 38: Browse Strategies
1. **Check:** Strategy cards appear
2. **Expected:** See:
   - Strategy titles
   - Creator usernames
   - Like counts
   - Fork counts
   - Thumbnails

### Step 39: Search Strategies
1. **Type:** Search term in search box (e.g., "RSI" or "moving average")
2. **Click:** "Search" button
3. **Expected:** Filtered results appear

### Step 40: Filter Strategies
1. **Click:** Filter buttons:
   - "Trending" - Shows trending strategies
   - "New" - Shows newest strategies
   - "Most Liked" - Shows most liked
   - "All" - Shows all strategies
2. **Expected:** Results update based on filter

---

## 📝 **PART 12: PUBLISH STRATEGY**

### Step 41: Return to Strategy IDE
1. **Navigate to:** Dashboard
2. **Click:** On your strategy card
3. **Expected:** Strategy IDE opens

### Step 42: Publish Strategy (API Method)
**Note:** UI button may not exist yet, use browser console:

1. **Open:** Browser Developer Console (F12)
2. **Type:**
   ```javascript
   fetch('/api/strategy/publish', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       strategyId: 'YOUR_STRATEGY_ID',
       userId: 'YOUR_USER_ID',
       title: 'My First Trading Strategy',
       description: 'A simple moving average crossover strategy',
       tags: ['moving-average', 'rsi', 'crypto']
     })
   }).then(r => r.json()).then(console.log)
   ```
3. **Replace:** `YOUR_STRATEGY_ID` and `YOUR_USER_ID` with actual IDs
4. **Press:** Enter
5. **Expected:** Strategy is published, appears in Discover page

---

## ✅ **VERIFICATION CHECKLIST**

After completing all steps, verify:

- [ ] Username is set and displayed in header
- [ ] Strategy created with valid TQ-JSS structure
- [ ] Can edit in English, JSON, and Block modes
- [ ] JSON changes sync to other modes (if sync implemented)
- [ ] Backtest runs successfully
- [ ] Backtest results display correctly
- [ ] Live Monitor starts without crashing
- [ ] Live Monitor shows real-time data
- [ ] Strategy validates correctly
- [ ] Error handling works (invalid JSON shows errors)
- [ ] Competition submission works
- [ ] Strategy appears in competition leaderboard
- [ ] Community chat sends/receives messages
- [ ] Discover page shows strategies
- [ ] Strategy can be published

---

## 🐛 **TROUBLESHOOTING**

### Issue: Username setup doesn't redirect
**Solution:** Check browser console for errors, verify Supabase connection

### Issue: Backtest doesn't run
**Solution:** 
- Verify strategy has valid structure
- Check that symbol/timeframe are set
- Ensure date range is valid
- Check browser console for errors

### Issue: Live Monitor crashes
**Solution:** 
- Verify strategy has `settings.symbol` and `settings.timeframe`
- Check that strategy JSON is valid
- Refresh page and try again

### Issue: Competition submission fails
**Solution:**
- Verify strategy is valid
- Check that competition is active
- Ensure you're logged in
- Check browser console for API errors

### Issue: Community chat doesn't work
**Solution:**
- Verify migration `004_community_chat.sql` is applied
- Check Supabase Realtime is enabled
- Verify you're authenticated
- Check browser console for WebSocket errors

---

## 📊 **EXPECTED RESULTS SUMMARY**

| Feature | Expected Behavior |
|---------|------------------|
| Strategy Creation | Auto-generates valid TQ-JSS with defaults |
| English Mode | Converts prompt to JSON/Blocks (mock for now) |
| JSON Mode | Validates JSON, syncs to TQL/Blocks |
| Block Mode | Visual editor, syncs to JSON |
| Backtest | Runs successfully, shows results in tabs |
| Live Monitor | Starts without crash, shows real-time data |
| Competition | Submit strategy, appears in leaderboard |
| Community Chat | Send/receive messages in real-time |
| Discover | Browse/search published strategies |
| Username | Required, shown in header |

---

## 🎯 **QUICK TEST SCENARIO**

**Fastest path to test everything:**

1. Connect wallet → Set username
2. Create strategy → Edit title
3. Switch to JSON mode → Change symbol to `ETHUSDT`
4. Switch to Backtests → Run backtest
5. Switch to Live Monitor → Start live
6. Go to Competitions → Submit strategy
7. Go to Community Chat → Send message
8. Go to Discover → Verify strategy appears

**Total time:** ~10-15 minutes

---

**End of Testing Guide**

