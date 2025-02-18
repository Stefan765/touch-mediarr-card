Mediarr for Home Assistant (Inspired by Upcoming Media Card)
A comprehensive visual of the state of your media management for Home Assistant that brings together your media servers, management tools, and discovery services in one place.

Support This Project
If you find this project helpful, please consider supporting it. Your contributions help maintain and improve the project. Any support is greatly appreciated! ❤️ https://buymeacoffee.com/vansmak Thank you for your support!

***Features

Modular Design

✅ Collapsible sections
✅ Dynamic backgrounds

✅ Media Server Integration

Plex: View recently added content

Jellyfin: View recently added content

Emby: (may come soon!)

✅ Media Management

Sonarr: (up to 2 instances) View upcoming TV shows and episodes

Radarr: (up to 2 instances) Track upcoming movie releases

✅ Media Discovery

Overseerr / Jellyseer: View     media requests with status and requestor  
![request](https://github.com/user-attachments/assets/dc794192-cb27-4d9a-b57c-95dc33d25d22) ![status](https://github.com/user-attachments/assets/6819af31-05c6-4c82-8660-0bf337dcb809)
- View all media requests with their current status
- Request new movies and TV shows directly from the discover sections
- **New: Status Management** - Click on any request's status to:
  - Approve requests
  - Decline requests
  - Remove requests from the queue
- Status changes are instant and sync with Overseerr/Jellyseerr
- Works seamlessly with both movies and TV shows
- Uses built-in Home Assistant services for request management

Trakt: Browse popular TV shows and movies
   - may be adding trakt calendar lists, i make no promises.  I do not use trakt
TMDB: Explore trending content (configurable for TV, movies, or both)
 
*Media Player State (may remove)  currently if you and a media_player.jelly_or_plex it will show a small overlay of what is playing

## Screenshots

![VIEW](https://github.com/user-attachments/assets/e5eda74d-e50b-4dde-9985-45282dc99a51) ![Screenshot 2025-01-21 at 14-51-50 mediarr – Home Assistant](https://github.com/user-attachments/assets/4c73b44a-680a-42ea-8d2b-0d96806fb1c6)

**Installation 
****Sensor Configuration
 ***see mediarr_sensor must have first https://github.com/Vansmak/mediarr_sensor

HACS Installation 

1. Open HACS


2. Go to "Frontend"


3. Click the three dots (⋮) → "Custom repositories"


4. Add this repository URL:
🔗 https://github.com/Vansmak/mediarr-card

Select Category: Lovelace) Dashboard 

5. Click "Add"

6. Find and install "Mediarr card" from HACS

7. Restart Home Assistant

Manual Installation 

1. Download the latest release from this repository.

2. Copy main.js, styles js and /sections folder  into:

/config/www/community/mediarr-card/
│── mediarr-card.js
│── styles.js
│── sections/
│   ├── section1.js
│   ├── section2.js
│   ├── section3.js



3. Add the resource:

Go to Settings → Dashboards → Resources

Click "Add Resource"

Enter the URL:

/local/mediarr-card/main.js

Select "JavaScript Module"

Click "Create"

4. Restart Home Assistant

Configuration

Step 1: Install and configure the Mediarr Server sensors

🔗 Mediarr Server Repository github.com/Vansmak/mediarr_server

Step 2: Add the Card to Lovelace

Add the following YAML to your dashboard:  the order will be the same as you see in the card, dont add too many
```
type: custom:mediarr-card 
media_player_entity: media_player.entity # optional for visual of whats currently playing
plex_entity: sensor.plex_mediarr
jellyfin_entity: sensor.jellyfin_mediarr
sonarr_entity: sensor.sonarr_mediarr
sonarr_label: 1st sonarr instance
radarr_entity: sensor.radarr_mediarr
radarr_label: 1st radarr instance
sonarr2_entity: sensor.sonarr2_mediarr
sonarr2_label: 2nd sonarr instance
radarr2_entity: sensor.radarr2_mediarr
radarr2_label: 2nd radarr instance
seer_entity: sensor.seer_mediarr
trakt_entity: sensor.trakt_mediarr
tmdb_entity: sensor.tmdb_mediarr
```
# Optional Seer lists
```
seer_trending_entity: sensor.seer_mediarr_trending
seer_discover_entity: sensor.seer_mediarr_discover
seer_popular_movies_entity: sensor.seer_mediarr_popular_movies
seer_popular_tv_entity: sensor.seer_mediarr_popular_tv
```
# Optional TMDB lists
```
tmdb_now_playing_entity: sensor.tmdb_mediarr_now_playing
tmdb_upcoming_entity: sensor.tmdb_mediarr_upcoming
tmdb_on_air_entity: sensor.tmdb_mediarr_on_air
```
# Optional media player for
progress tracking
```
media_player_entity: media_player.your_plex_player
```

**Options

All entity configurations are optional, use only what you need

media_player_entity shows whats playing

Upcoming Features

🚀 Emby support maybe
🎬 Click-to-play functionality for Plex/Jellyfin (still pondering)
🔍 More integrations based on user feedback! 

Contributors

👤 Vansmak (aka Vanhacked)


---

License

📜 MIT License


---
