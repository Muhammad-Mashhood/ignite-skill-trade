# 🔄 Trade Workflow & Coin Economy Guide

## Complete Trade Lifecycle

### 1. 📝 User Creates a Post
- Navigate to **Create Post** page
- Add skills they'll teach (`willTeach` array)
- Add skills they want to learn (`wantToLearn` array)
- Set duration, description, availability
- Post status: `active`

**Database Changes:**
- New `Post` document created
- User's post count increments
- Post appears in Feed for other users

---

### 2. 💬 Another User Sends a Proposal
- User browses Posts/Feed
- Clicks on interesting post
- Clicks "Propose Trade" button
- Fills proposal form:
  - **Trade Type**: Skill trade or chat
  - **Offering**: What skill they'll teach in exchange
  - **Message**: Personal message to post owner
  - **Number of Sessions**: How many sessions

**Database Changes:**
- New `TradeProposal` document created
- Status: `pending`
- Links:   - `proposer`: User sending proposal
  - `receiver`: Post owner
  - `targetPost`: The post being responded to
  - `offering`: Skill details

**Affected Pages:**
- ✅ Post owner sees proposal in **Proposals > Received** tab
- ✅ Proposer sees it in **Proposals > Sent** tab

---

### 3. ✅ Post Owner Reviews and Accepts/Rejects

#### If ACCEPTED:
- Post owner clicks "Accept" button
- Sets coin amount (default: 50 coins)
- Sets session duration (default: 60 minutes)

**Database Changes:**
- `TradeProposal` status changes: `pending` → `accepted`
- **NEW `Trade` document created**:
  ```javascript
  {
    teacher: postOwner._id,        // Post owner teaches
    learner: proposer._id,         // Proposer learns
    skill: offering.skill._id,     // Skill being taught
    coinsAmount: 50,               // Default or custom
    duration: 60,                  // Minutes
    status: 'accepted',            // Initial status
    notes: 'Trade proposal accepted: ...',
  }
  ```

**Affected Pages:**
- ✅ Both users see proposal status updated in **Proposals** page
- ✅ Both users see new trade in **Trades** page
- ✅ **"Accepted"** badge appears on proposal

#### If REJECTED:
- `TradeProposal` status: `pending` → `rejected`
- No Trade created
- Proposer can send another proposal if desired

---

### 4. 🚀 Starting the Trade Session

**When Trade is Ready:**
- Users navigate to **Trades** page
- Click on the trade card
- See trade details (partner, skill, duration, coins)
- Click **"Start Session"** button

**Database Changes:**
- `Trade` status: `accepted` → `in-progress`
- `startedAt` timestamp recorded

**Affected Pages:**
- ✅ **Trades** page shows "In Progress" badge
- ✅ Trade moves to "Active" filter tab
- ✅ Session timer starts (if implemented)

---

### 5. ✅ Completing the Trade

**When Session Ends:**
- Either user clicks **"Complete Trade"** button
- Confirmation dialog appears

**Database Changes - THIS IS WHERE COINS TRANSFER:**

1. **Trade Status Update:**
   ```javascript
   trade.status = 'completed'
   trade.completedAt = new Date()
   ```

2. **Coin Transfer (via `coin-economy.service.js`):**
   
   **LEARNER (Proposer):**
   - Coins deducted: `-50` (or agreed amount)
   - New balance calculated
   - `Transaction` record created:
     ```javascript
     {
       user: learner._id,
       type: 'spend',
       amount: -50,
       balanceAfter: learner.coins - 50,
       relatedTrade: trade._id,
       description: 'Paid for learning session: JavaScript',
     }
     ```
   
   **TEACHER (Post Owner):**
   - Coins added: `+50`
   - New balance calculated
   - `Transaction` record created:
     ```javascript
     {
       user: teacher._id,
       type: 'earn',
       amount: 50,
       balanceAfter: teacher.coins + 50,
       relatedTrade: trade._id,
       description: 'Earned from teaching session: JavaScript',
     }
     ```

3. **User Stats Updated:**
   ```javascript
   teacher.totalSessionsCompleted++
   learner.totalSessionsCompleted++
   ```

**Affected Pages:**
- ✅ **Trades** page: Trade shows "Completed" ✓ badge
- ✅ **Navbar**: Coin balances update immediately
- ✅ **Dashboard**: Coin balance widget updates
- ✅ **Profile**: Transaction history shows new entries
- ✅ **Proposals**: Proposal can be marked completed

---

### 6. ⭐ Rating the Trade (Optional)

**After Completion:**
- Both users can rate each other
- Click **"Rate"** button on completed trade
- Select 1-5 stars
- Write feedback (optional)

**Database Changes:**
- `Trade.rating` object updated:
  ```javascript
  {
    score: 5,
    feedback: 'Great teacher! Learned a lot.',
    ratedBy: user._id,
    ratedAt: new Date(),
  }
  ```
- User's average rating recalculated:
  ```javascript
  teacher.rating.average = (currentAvg * count + newRating) / (count + 1)
  teacher.rating.count++
  ```

**Affected Pages:**
- ✅ **Profile** page: Rating updates
- ✅ **Post Cards**: Teacher's rating shows updated value
- ✅ **Trades** page: Trade card shows rating stars

---

## 💰 Coin Economy Rules

### Initial Coins
- New users start with: **100 coins**

### Earning Coins
1. **Complete Teaching Sessions**: +50 coins (default)
2. **Achievement Bonuses**: 
   - First trade completed: +20 coins
   - 5 trades completed: +50 coins
   - 10 trades completed: +100 coins
3. **High Ratings** (5 stars): +10 bonus coins
4. **Referrals**: +30 coins per referred user

### Spending Coins
1. **Learning Sessions**: -50 coins (default)
2. **Premium Posts** (if implemented): Variable
3. **Featured Listings**: -20 coins

### Coin Transfer Flow
```
Learner Wallet: 150 coins
         ⬇️ -50 coins (session payment)
Learner Wallet: 100 coins

         ⬇️ +50 coins (session earning)
Teacher Wallet: 200 coins → 250 coins
```

### Transaction History
- All transactions logged in `Transaction` model
- Users can view history in Profile
- Filters: earned/spent/bonus
- Related trades linked for reference

---

## 📄 Post Lifecycle Management

### Post States
1. **Active** (`status: 'active'`)
   - Visible in Feed and Posts page
   - Accepting proposals
   - Searchable

2. **Paused** (`status: 'paused'`)
   - Hidden from Feed
   - No new proposals accepted
   - Owner can reactivate

3. **Closed** (`status: 'closed'`)
   - Trade accepted or slots filled
   - No new proposals
   - Archived after 30 days

4. **Expired** (`status: 'expired'`)
   - `expiresAt` date passed
   - Auto-archived
   - Can be reposted

### Auto-Close Conditions
- `maxParticipants` reached
- Post owner accepts a proposal (optional setting)
- Manual close by owner
- Expiration date reached

---

## 🌐 Pages Affected by Trade Workflow

### 1. **Navbar**
- **Coin Display**: Updates in real-time after trade completion
- Shows current balance: 💰 {user.coins} Coins

### 2. **Dashboard**
- **Coin Balance Widget**: Shows total coins
- **Active Trades Count**: Number of in-progress trades
- **Completed Sessions**: Total completed
- **Pending Proposals**: Count of proposals awaiting response

### 3. **Posts Page**
- Shows all active posts
- Post cards display teach/learn skills
- Click to view details

### 4. **Post Detail Page**
- Full post information
- **"Propose Trade"** button opens ProposalModal
- Shows post owner info and ratings

### 5. **Proposals Page**
- **Received Tab**: Proposals sent to you
  - **Accept** button → Creates Trade
  - **Reject** button → Declines proposal
- **Sent Tab**: Proposals you've sent
  - View status: Pending/Accepted/Rejected
- Status badges with colors

### 6. **Trades Page** (Enhanced)
- **Filters**: All / Active / Completed / Pending
- **Trade Cards**:
  - Partner info with avatar
  - Skill being taught
  - Coin amount and duration
  - Status badge (colored)
  - Action buttons based on status
- **Stats**: Completed count, Active count

### 7. **Profile Page**
- **Coin Balance**: Prominent display
- **Transaction History**: 
  - Earned transactions: Green
  - Spent transactions: Red
  - Bonus transactions: Purple
- **Trade Stats**:
  - Total sessions: {count}
  - Average rating: ⭐ {rating}
  - Skills taught/learned

### 8. **Feed Page**
- Personalized recommendations
- Shows posts based on user skills
- Each post card clickable → Post Detail

---

## 🎯 User Journey Example

**Scenario: Alice wants to learn React, Bob wants to learn Python**

1. **Alice creates a post:**
   - Will teach: Python (expert level)
   - Wants to learn: React (beginner level)
   - Post appears in Feed

2. **Bob sees Alice's post:**
   - Bob knows React (intermediate)
   - Clicks "Propose Trade"
   - Offers to teach React
   - Sends proposal

3. **Alice reviews proposal:**
   - Opens **Proposals > Received**
   - Sees Bob's proposal
   - Checks Bob's profile (4.8⭐ rating)
   - Clicks **"Accept"**
   - Sets 50 coins, 60 minutes

4. **Trade created automatically:**
   - Both see new trade in **Trades** page
   - Status: "Accepted ✅"

5. **They start the session:**
   - Click **"Start Session"**
   - Trade status: "In Progress 🔄"
   - They exchange skills via video call

6. **Session completes:**
   - After 60 minutes, click **"Complete Trade"**
   - **Coins transfer:**
     - Alice: 100 → 50 coins (-50 paid to Bob)
     - Bob: 150 → 200 coins (+50 earned from Alice)
   - Trade status: "Completed ✓"

7. **They rate each other:**
   - Alice rates Bob: 5 stars ⭐⭐⭐⭐⭐
   - Bob rates Alice: 5 stars ⭐⭐⭐⭐⭐
   - Both ratings update

8. **Post updates:**
   - Alice can close her post (optional)
   - Or keep it active for more trades

---

## 🔐 Security & Validation

### Proposal Creation
- ✅ Cannot propose to own posts
- ✅ Must provide valid skill for trade proposals
- ✅ Message required

### Accepting Proposals
- ✅ Only post owner can accept
- ✅ Can only accept pending proposals
- ✅ Validates coin amount and duration

### Completing Trades
- ✅ Checks learner has sufficient coins
- ✅ Both users must be active
- ✅ Trade must be in-progress status
- ✅ Transaction atomic (both updates succeed or fail together)

### Coin Transactions
- ✅ Validated before deduction
- ✅ Logged in Transaction model
- ✅ Balance verified after update
- ✅ Rollback on failure

---

## 🚀 Future Enhancements

1. **Scheduled Sessions**
   - Calendar integration
   - Reminders/notifications
   - Timezone handling

2. **Video Call Integration**
   - WebRTC direct connection
   - Screen sharing
   - Recording option

3. **Dispute Resolution**
   - Report issues
   - Admin mediation
   - Refund handling

4. **Advanced Coin Features**
   - Coin packages (buy more)
   - Subscription tiers
   - Group sessions with split payments

5. **Messaging System**
   - Real-time chat
   - Pre-session planning
   - File sharing

---

## 📊 Summary: What Happens Where

| Action | Database Changes | Affected Pages |
|--------|------------------|----------------|
| Create Post | New Post | Posts, Feed, Dashboard |
| Send Proposal | New TradeProposal | Proposals (both users) |
| Accept Proposal | Proposal status + New Trade | Proposals, Trades |
| Start Trade | Trade status → in-progress | Trades |
| Complete Trade | **Coins transfer**, Trade status, Transactions | **Trades, Navbar, Dashboard, Profile** |
| Rate Trade | Trade rating, User rating | Trades, Profile, Posts |
| View Transactions | - | Profile (Transaction History) |

---

**Key Takeaway:** 
The coin transfer happens **only when a trade is completed**, not when accepted. This ensures users only pay for actual sessions that take place.
