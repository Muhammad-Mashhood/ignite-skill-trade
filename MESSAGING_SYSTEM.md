# Messaging System Implementation

## Overview
A complete Fiverr-style messaging system has been implemented with inbox, chat interface, and real-time message management.

## Backend Implementation

### Models Created

#### 1. Message Model (`backend/models/message.model.js`)
```javascript
{
  conversation: ObjectId (ref: Conversation),
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  content: String (max 2000 chars),
  attachments: [{type, url, filename, size}],
  isRead: Boolean,
  readAt: Date,
  deletedBy: [ObjectId] // Soft delete
}
```
- **Indexes**: conversation+createdAt, sender+createdAt, receiver+isRead
- **Methods**: `markAsRead()`

#### 2. Conversation Model (`backend/models/conversation.model.js`)
```javascript
{
  participants: [ObjectId] (exactly 2),
  relatedPost: ObjectId (optional),
  relatedProposal: ObjectId (optional),
  relatedTrade: ObjectId (optional),
  lastMessage: ObjectId (ref: Message),
  lastMessageAt: Date,
  unreadCount: Map<userId, number>,
  isArchived: Boolean,
  archivedBy: [ObjectId]
}
```
- **Static Methods**: `findOrCreate(user1Id, user2Id, relatedData)`
- **Instance Methods**: `incrementUnread(userId)`, `resetUnread(userId)`
- **Indexes**: participants, lastMessageAt desc, combined index

### Controller (`backend/controllers/message.controller.js`)

#### Endpoints:
1. **GET /api/messages/conversations** - Get all conversations
   - Returns conversations sorted by lastMessageAt
   - Includes other participant info and unread count

2. **POST /api/messages/conversations** - Create/get conversation
   - Body: `{recipientId, relatedPost?, relatedProposal?, relatedTrade?}`
   - Uses findOrCreate to prevent duplicates

3. **GET /api/messages/conversations/:id/messages** - Get messages
   - Pagination support (page, limit)
   - Automatically marks messages as read
   - Resets unread count

4. **POST /api/messages/conversations/:id/messages** - Send message
   - Body: `{content, attachments?}`
   - Updates conversation lastMessage and lastMessageAt
   - Increments receiver's unread count

5. **GET /api/messages/unread-count** - Get total unread count
   - Returns count of unread messages for current user

6. **DELETE /api/messages/:id** - Delete message (soft delete)
   - Only sender can delete

7. **PUT /api/messages/conversations/:id/archive** - Archive conversation
   - Hides conversation from inbox

### Routes (`backend/routes/message.routes.js`)
All routes protected with `protect` middleware. Registered at `/api/messages`.

## Frontend Implementation

### API Functions (`frontend/src/services/api.js`)
- `getConversations()` - Fetch all conversations
- `createConversation(recipientId, relatedData)` - Get/create conversation
- `getMessages(conversationId, page, limit)` - Fetch messages
- `sendMessage(conversationId, content, attachments)` - Send message
- `getUnreadCount()` - Get unread message count
- `deleteMessage(messageId)` - Delete message
- `archiveConversation(conversationId)` - Archive conversation

### Pages

#### 1. InboxPage (`frontend/src/pages/InboxPage.jsx`)
**Features:**
- List of all conversations sorted by most recent
- Search/filter conversations by participant name
- Unread badge showing count
- Last message preview (truncated at 60 chars)
- Relative timestamps (e.g., "2m ago", "Yesterday")
- Related post/proposal indicator
- Click conversation to open chat

**UI Elements:**
- Purple gradient header with search bar
- Conversation cards with avatar, name, last message
- Unread conversations highlighted in light blue
- Empty state with "Browse Posts" button
- Loading spinner

#### 2. ChatPage (`frontend/src/pages/ChatPage.jsx`)
**Features:**
- Message thread with auto-scroll to bottom
- Message bubbles (different styles for sent/received)
- Own messages: purple gradient, right-aligned
- Other messages: white with border, left-aligned
- Message timestamps
- Read receipts ("Read" indicator for own messages)
- Auto-resizing textarea (up to 150px)
- Enter to send, Shift+Enter for new line
- Send button with emoji (disabled when empty/sending)

**UI Elements:**
- Purple gradient header with back button and user info
- Message area with scrolling
- Avatar next to each message
- Input area at bottom with textarea and send button
- Empty state for new conversations

### Navigation

#### Navbar Updated
- Added "📬 Inbox" link between Proposals and Skills
- Positioned for easy access

#### Routes Added to App.jsx
```jsx
<Route path="/inbox" element={<PrivateRoute><InboxPage /></PrivateRoute>} />
<Route path="/chat/:userId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
```

## Usage Flow

### Starting a Conversation
1. User clicks "Send Message" button on a post or proposal
2. Button navigates to `/chat/:userId`
3. ChatPage calls `createConversation(userId)` 
4. Backend's `findOrCreate` ensures no duplicate conversations
5. User can immediately send messages

### Viewing Inbox
1. Navigate to `/inbox`
2. See all conversations sorted by recent activity
3. Unread conversations highlighted with badge
4. Click conversation to open chat

### Sending Messages
1. Type message in textarea
2. Press Enter or click send button
3. Message appears immediately in thread
4. Backend updates conversation lastMessage
5. Receiver sees unread count increment

### Reading Messages
1. Open conversation in ChatPage
2. Fetch messages via `getMessages(conversationId)`
3. Messages automatically marked as read
4. Unread count reset to 0
5. Sender sees "Read" indicator

## Key Features

### Data Integrity
- **findOrCreate Pattern**: Prevents duplicate conversations between same users
- **Soft Delete**: Messages can be deleted without affecting other user
- **Atomic Updates**: Unread counts updated atomically with message creation

### Performance Optimizations
- **Indexes**: Optimized for inbox queries (lastMessageAt desc)
- **Pagination**: Messages loaded in pages (default 50)
- **Lean Queries**: Uses `.lean()` for faster reads
- **Map for Unread**: O(1) lookup/update per user

### User Experience
- **Auto-scroll**: Messages thread scrolls to bottom automatically
- **Relative Timestamps**: "2m ago", "Yesterday" for easy reading
- **Read Receipts**: Sender knows when message is read
- **Search**: Filter conversations by name
- **Empty States**: Clear CTAs when no conversations
- **Loading States**: Spinners during data fetch
- **Error Handling**: User-friendly error messages with retry

### Security
- **Authentication**: All routes protected with JWT
- **Authorization**: Can only view/send in own conversations
- **Validation**: Message content required, max 2000 chars
- **Sanitization**: MongoDB injection prevention

## Design

### Color Scheme
- **Primary Gradient**: Purple (#667eea to #764ba2)
- **Own Messages**: Purple gradient background
- **Other Messages**: White with light border
- **Unread**: Light blue background (#f0f4ff)
- **Hover Effects**: Subtle translateY and shadows

### Responsive
- **Desktop**: Max width 900px, full features
- **Mobile**: Full width, smaller avatars, adjusted padding

## Testing

### Backend
```bash
cd backend
node server.js
# Server running on port 5000 with /api/messages routes
```

### Test Conversation Flow
1. Register/login as user1
2. Go to Posts page
3. Click on another user's post
4. (Future) Click "Send Message" → Opens chat
5. Send a message
6. Logout, login as user2
7. Go to Inbox → See conversation with unread badge
8. Click conversation → See message
9. Reply → user1 sees in inbox

## Next Steps (Future Enhancements)

1. **Real-time Messaging**: Add Socket.io for instant updates
2. **Typing Indicators**: Show "User is typing..."
3. **File Uploads**: Send images/files as attachments
4. **Emoji Picker**: Add emoji selection
5. **Message Reactions**: React to messages with emoji
6. **Voice Messages**: Record and send audio
7. **Video Call Integration**: Start video call from chat
8. **Message Search**: Search within conversations
9. **Pin Conversations**: Pin important chats to top
10. **Group Chats**: Multi-user conversations
11. **Desktop Notifications**: Browser notifications for new messages
12. **Unread Count Badge**: Show in navbar/inbox icon

## Files Created/Modified

### Backend
- ✅ `backend/models/message.model.js` (NEW)
- ✅ `backend/models/conversation.model.js` (NEW)
- ✅ `backend/controllers/message.controller.js` (NEW)
- ✅ `backend/routes/message.routes.js` (NEW)
- ✅ `backend/server.js` (MODIFIED - added message routes)

### Frontend
- ✅ `frontend/src/pages/InboxPage.jsx` (NEW)
- ✅ `frontend/src/pages/InboxPage.css` (NEW)
- ✅ `frontend/src/pages/ChatPage.jsx` (NEW)
- ✅ `frontend/src/pages/ChatPage.css` (NEW)
- ✅ `frontend/src/services/api.js` (MODIFIED - added 7 message functions)
- ✅ `frontend/src/App.jsx` (MODIFIED - added inbox/chat routes)
- ✅ `frontend/src/components/layout/Navbar.jsx` (MODIFIED - added Inbox link)

## Status
✅ **COMPLETE** - Full messaging system implemented and ready for testing
🚀 **Backend server running** on port 5000 with message routes
📱 **Frontend ready** - Navigate to /inbox to start using

## Notes
- Messages are stored permanently (soft delete only)
- Conversations automatically created when sending first message
- Unread tracking per user using Map for efficiency
- Related post/proposal/trade optional context
- Archive feature available but not exposed in UI yet
- Can easily add Socket.io later without schema changes
