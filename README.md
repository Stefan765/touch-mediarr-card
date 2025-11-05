# 🎬 Emby Mediarr Card for Home Assistant
*(Inspired by Mediarr Card by Vansmak)*

A comprehensive visual overview of your **Emby** server in **Home Assistant**.  
The card displays your latest movies and TV shows directly in Lovelace – clear, modern, and customizable.

---

## ❤️ Support This Project
If you like this project or find it useful, please consider supporting me.  
Your contributions help maintain and improve the project.  
Thank you for your support! 🙏  

👉 [Buy me a coffee](https://buymeacoffee.com/stefan765)

---

## ✨ Features

### 🧩 Modular Design
✅ Collapsible sections  
✅ Dynamic backgrounds  

### 🎥 Emby Integration
- Shows recently added movies and TV shows from your Emby server  
- Supports multiple media types  
- Optional current playback status  

### ⭐ Favorites Function
- **Show favorite status**: Displays which items are marked as favorites in Emby  
- **Add/remove favorites**: Click directly in the card to mark or unmark content as a favorite  
- **Instant synchronization** with your Emby server  

### ▶️ Media Player State
Optionally shows an overlay of the currently playing media if you have a `media_player.emby` or similar configured.

---

## 🖼️ Screenshots
*(Sample images coming soon)*

---

## ⚙️ Installation

### 🔹 HACS Installation
1. Open **HACS** in Home Assistant  
2. Go to **Frontend**  
3. Click the three dots (⋮) → **Custom repositories**  
4. Add the repository:  https://github.com/Stefan765/emby-mediarr-card  
5. Category: **Lovelace (Dashboard)**  
6. Find and install **Emby Mediarr Card**  
7. Restart Home Assistant  

### 🔹 Manual Installation
1. Download the latest release from [GitHub](https://github.com/Stefan765/emby-mediarr-card/releases)  
2. Copy the files to: `/config/www/community/emby-mediarr-card/`  
3. Add the resource:  
   - Settings → Dashboards → Resources → “Add”  
   - URL:  
     ```
     /local/emby-mediarr-card/main.js
     ```
   - Type: **JavaScript Module**  
4. Restart Home Assistant  

---

## 🧠 Configuration

### Step 1: Install and configure the sensors
Required: [Emby Upcoming Media Sensor 2.0](https://github.com/Stefan765/sensor.emby_upcoming_media-2.0.git)

### Step 2: Add the card to Lovelace

```yaml
type: custom:emby-mediarr-card
media_player_entity: media_player.emby

# Emby Entities
emby_movies_entity: sensor.emby_movies_mediarr
emby_series_entity: sensor.emby_series_mediarr

# Connection data to your Emby server
emby_url: http://xxxxx:8096          # URL of your Emby server (replace xxxxx with IP or hostname)
emby_api_key: YOUR_EMBY_API_KEY      # API key for access (your own key)
emby_user_id: <YOUR_EMBY_USER_ID>    # Optional: user ID for personalized data

max_items: 15
opacity: 0.7
blur_radius: 5

Notes

emby_url: IP or hostname of your Emby server including port (default: 8096 for HTTP, 8920 for HTTPS).

emby_api_key: Must be generated from your Emby account (Menu → API Keys).

emby_user_id: Optional if you want to show content for a specific user. Can be left empty to use the default user.

🎨 Visual Configuration

max_items: Maximum number of items displayed (default: 10)

opacity: Background image transparency (0 = transparent, 1 = fully visible)

blur_radius: Blur radius for background images (in pixels)

Example:
opacity: 0.7
blur_radius: 5


👥 Contributors

👤 Stefan765 – Project Owner & Developer

🙌 Inspired by Vansmak / Mediarr Card

📜 License

MIT License
opacity: 0.7
blur_radius: 5
