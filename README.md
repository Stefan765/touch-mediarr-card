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

Mediarr Card Configuration Guide
Basic Configuration
Add the following YAML to your dashboard. The sections will appear in the same order as they are listed in this configuration:
Labels are optional 
```
type: custom:mediarr-card
media_player_entity: media_player.entity # optional for visual of whats currently playing
plex_entity: sensor.plex_mediarr
jellyfin_entity: sensor.jellyfin_mediarr
sonarr_entity: sensor.sonarr_mediarr
sonarr_label: 1st sonarr instance
radarr_entity: sensor.radarr_mediarr
radarr_label: 1st radarr instance
radarr_release_types: 
  - Digital
  - Theatres
  - Physical
sonarr2_entity: sensor.sonarr2_mediarr
sonarr2_label: 2nd sonarr instance
radarr2_entity: sensor.radarr2_mediarr
radarr2_label: 2nd radarr instance
seer_entity: sensor.seer_mediarr
trakt_entity: sensor.trakt_mediarr
tmdb_entity: sensor.tmdb_mediarr
```
Item Limit Configuration
Control how many items show in each section:
```
# Global settings (applies to all sections)
max_items: 15  # Show a maximum of 15 items per section
days_to_check: 30  # For sections that use date filtering (Sonarr/Radarr)

# Section-specific overrides
plex_max_items: 20  # Override just for Plex section
sonarr_max_items: 10  # Override just for Sonarr section
radarr_max_items: 12  # Override just for Radarr section
tmdb_max_items: 25  # Override just for TMDB sections
```
Visual Configuration
Control the appearance of background images:
```
# Controls transparency of background images (0-1)
# 0 = completely transparent, 1 = fully opaque
# Recommended: 0.7 for good balance of visibility
opacity: 0.7

# Optional blur effect for backgrounds (in pixels)
blur_radius: 5
```
Optional Seer Lists
Additional Seer content sections can be added:
```
seer_trending_entity: sensor.seer_mediarr_trending
seer_discover_entity: sensor.seer_mediarr_discover
seer_popular_movies_entity: sensor.seer_mediarr_popular_movies
seer_popular_tv_entity: sensor.seer_mediarr_popular_tv
```
Optional TMDB Lists
Additional TMDB content sections can be added:
```
tmdb_airing_today_entity: sensor.tmdb_mediarr_airing_today
tmdb_now_playing_entity: sensor.tmdb_mediarr_now_playing
tmdb_upcoming_entity: sensor.tmdb_mediarr_upcoming
tmdb_on_air_entity: sensor.tmdb_mediarr_on_air
```
Media Player Integration
For progress tracking of currently playing media:
```
media_player_entity: media_player.your_plex_player
```
Configuration Options Explained

max_items: Controls the maximum number of items displayed in each section. This is useful for limiting the number of items shown in the UI, even if your sensor retrieves more data. Default is 10.
days_to_check: Applies to Sonarr and Radarr sections. Controls the number of days to look ahead for upcoming releases. Default is 60.
Section-specific max_items: You can override the global max_items setting for individual sections by adding [section_name]_max_items to your configuration. 
opacity: Controls how transparent the background images appear. A value between 0 and 1:

0.5 = 50% transparent (50% opaque)
0.7 = 30% transparent (70% opaque) - generally provides good readability
1.0 = 0% transparent (fully opaque)

radarr_release_types: # Exclude physical releases by not including them
  - Digital
  - Theatres
  - Physical

blur_radius: Optional setting to add a blur effect to background images, measured in pixels. Higher values create more blur.

Note: All entity configurations are optional. Use only what you need for your setup. The order of entities in your configuration determines the order they appear in the card.

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
