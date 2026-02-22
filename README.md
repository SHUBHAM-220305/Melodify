# 🎵 Melodify – Modern Music Streaming Web App

Melodify is a modern Spotify-inspired music streaming web application built using **HTML, CSS, and Vanilla JavaScript**.  
It allows users to search songs, play previews, manage queues, create playlists, and save favorite tracks — all using the iTunes public API.

---

🌐 **Live Project**: https://shubham-220305.github.io/Melodify/

## 🚀 Features

### 🔥 Trending Section
- Automatically loads trending songs
- Fetches songs using multiple genres (Pop, Bollywood, Hip Hop, Rock, EDM)
- Auto-generates queue from trending tracks

### 🔎 Search Functionality
- Search songs by title, artist, or keyword
- Real-time search using iTunes API
- Grid view + detailed list view

### 🎧 Music Player
- Play / Pause
- Next / Previous
- Shuffle Mode
- Seekbar with clickable progress
- Live duration & current time
- Volume control
- Auto-play next track

### ❤️ Favorites System
- Add/remove songs to favorites
- Stored in LocalStorage
- “Liked Songs” playlist auto-generated

### 📚 Playlist Management
- Create new playlist
- Save current queue as playlist
- Load saved playlists
- Rename playlist
- Delete playlist
- Playlist count display
- Fully persistent using LocalStorage

### 🎶 Queue System
- Add songs to queue
- Play specific queue item
- Remove individual tracks
- Clear full queue
- Auto-remove song after playback

### 🎨 Modern UI
- Responsive design
- Sidebar navigation
- Glassmorphism effects
- Gradient backgrounds
- Mobile-friendly layout

---

## 🛠️ Tech Stack

- **HTML5**
- **CSS3 (Custom Variables + Responsive Grid)**
- **Vanilla JavaScript (ES6+)**
- **iTunes Search API**
- **LocalStorage for data persistence**

---

## 📂 Project Structure

```bash
melodify/
├── index.html/
├── script.js/
└── style.css
```


---

## ⚙️ How It Works

- Fetches music data from iTunes API
- Normalizes API response data
- Dynamically renders DOM elements
- Stores user data (favorites & playlists) in browser LocalStorage
- Uses Audio element for playback

---

## 📸 UI Sections

- Sidebar Navigation
- Trending Grid
- Search Results List
- Queue Panel
- Player Bar
- Playlist Manager

---

## 💡 Learning Highlights

This project demonstrates:
- DOM manipulation
- Async/await & Fetch API
- State management using arrays & objects
- LocalStorage persistence
- Event-driven programming
- Audio API handling
- Responsive layout design

---

## 🌟 Future Improvements

- User authentication
- Backend integration (Node.js + MongoDB)
- Real-time lyrics integration
- Dark/Light mode toggle
- Drag & drop queue reordering
- Full-length streaming integration

---

## 👨‍💻 Author

**Shubham Kumar**

Aspiring Product-Based Engineer  
Focused on building real-world full-stack projects 🚀

---