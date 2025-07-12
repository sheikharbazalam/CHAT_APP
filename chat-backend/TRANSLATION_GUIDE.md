# Chat Translation System Guide

## Overview
This chat application now supports real-time message translation based on user preferences. Users can set their preferred language, and messages will be automatically translated for them while preserving the original message for the sender.

## How It Works

### 1. User Language Preferences
- Each user can set their preferred language using the `/api/set-preferred-language` endpoint
- Default language is English ("en")
- Supported languages depend on Google Translate API

### 2. Message Flow
1. **User A** sends a message in English
2. **User A** sees their message in English (original)
3. **User B** (with Hindi preference) receives the message translated to Hindi
4. **User C** (with Spanish preference) receives the message translated to Spanish
5. Original message is stored in the database

### 3. Database Storage
- Messages are stored with their **original text** (not translated)
- Translation happens on-the-fly when sending to users
- This ensures data integrity and allows for future translation improvements

### 4. API Endpoints

#### Set Preferred Language
```http
POST /api/set-preferred-language
Content-Type: application/json

{
  "email": "user@example.com",
  "language": "hi"  // Language code (hi for Hindi, es for Spanish, etc.)
}
```

#### Get Chat History (with translations)
```http
GET /api/chat-history?email=user@example.com
```
Returns messages translated to the user's preferred language.

#### Get All Users
```http
GET /api/users
```
Returns list of users with their preferred languages.

### 5. Socket Events

#### Register User
```javascript
socket.emit('register', 'user@example.com');
```

#### Send Message
```javascript
socket.emit('sendMessage', {
  email: 'user@example.com',
  text: 'Hello, how are you?',
  // other fields...
});
```

#### Receive Message
```javascript
socket.on('receiveMessage', (message) => {
  console.log(message.text);        // Translated text for this user
  console.log(message.originalText); // Original text
  console.log(message.translatedFor); // Language code it was translated to
});
```

## Environment Variables Required
```env
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
MONGODB_URI=your_mongodb_connection_string
OPPEN_AI_API_KEY=your_openai_api_key
```

## Language Codes
Common language codes:
- `en` - English
- `hi` - Hindi
- `es` - Spanish
- `fr` - French
- `de` - German
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese
- `ar` - Arabic

## Error Handling
- If translation fails, the original message is sent as fallback
- Translation errors are logged but don't break the chat functionality
- Users without a preferred language set receive messages in English

## Frontend Integration
The frontend should:
1. Call `/api/set-preferred-language` when user sets their language preference
2. Emit 'register' event with user email when connecting to socket
3. Handle 'receiveMessage' events and display the translated text
4. Optionally show original text on hover or in a tooltip 