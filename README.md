Mediarr for Home Assistant (Inspired by Upcoming Media Card)
A comprehensive visual of the state of your media management for Home Assistant that brings together your media servers, management tools, and discovery services in one place.

Support This Project
If you find this project helpful, please consider supporting it. Your contributions help maintain and improve the project. Any support is greatly appreciated! ❤️ https://buymeacoffee.com/vansmak Thank you for your support!

***Features

Modular Design

✅ Collapsible sections
✅ Dynamic backgrounds

*Media Server Integration

Plex: View recently added content

Jellyfin: View recently added content

Emby: (may come soon!)

*Media Management

Sonarr: View upcoming TV shows and episodes

Radarr: Track upcoming movie releases

Other Arrs can easily be added

*Media Discovery

Overseerr / Jellyseer: View     media requests with status and requestor

Trakt: Browse popular TV shows and movies
   - may be adding trakt calendar lists, i make no promises.  I do not use trakt
TMDB: Explore trending content (configurable for TV, movies, or both)
 
*Media Player State (may remove)  currently if you and a media_player.jelly_or_plex it will show a small overlay of what is playing

## Screenshots

![VIEW](https://github.com/user-attachments/assets/e5eda74d-e50b-4dde-9985-45282dc99a51) ![Screenshot 2025-01-21 at 14-51-50 mediarr – Home Assistant](https://github.com/user-attachments/assets/4c73b44a-680a-42ea-8d2b-0d96806fb1c6)

**Installation 
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

Add the following YAML to your dashboard:  the order will be the same as you see in the card
```
type: custom:mediarr-card 
media_player_entity: media_player.entity # optional for visual of whats currently playing
plex_entity: sensor.plex_mediarr
jellyfin_entity: sensor.jellyfin_mediarr
sonarr_entity: sensor.sonarr_mediarr
radarr_entity: sensor.radarr_mediarr
seer_entity: sensor.seer_mediarr
trakt_entity: sensor.trakt_mediarr
tmdb_entity: sensor.tmdb_mediarr
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

Sensor Configuration
```yaml
sensor:
  - platform: mediarr
    plex:  # Optional
      host: localhost
      port: xxxxxx
      token: your_token

    jellyfin:  # Optional
      host: localhost
      port: xxxxxx
      token: your_api_key 
      max_items: 10
      tmdb_api_key: "your_tmdb_api_key"

    seer: # Optional
      url: localhost
      api_key: your_api_key
      max_items: 10
      tmdb_api_key: "your_tmdb_api_key" # no longer needed

    sonarr:  # Optional
      url: http://localhost:8989
      api_key: your_sonarr_api_key
      max_items: 10
      days_to_check: 60
      tmdb_api_key: "your_tmdb_api_key" # no longer needed

    radarr:  # Optional
      url: http://localhost:7878
      api_key: your_radarr_api_key
      max_items: 10
      days_to_check: 60 #breaking change
      tmdb_api_key: "your_tmdb_api_key" # no longer needed
    
    trakt:  # Optional
      client_id: "your_client_id"
      client_secret: "your_client_secret"
      tmdb_api_key: "your_tmdb_api_key"  # Required for posters
      trending_type: both  # Options: movies, shows, both
      max_items: 10
     
    
    tmdb:  # Optional
      api_key: "your_api_key"
      trending_type: all  # Options: movie, tv, all
      max_items: 10
      trending: true          # Default endpoint
      now_playing: true       # Optional
      upcoming: true          # Optional
      on_air: true            # Optional
      airing_today: false     # Optional
```

max_items: Number of items to display (default: 10)

days_to_check: Days to look ahead for upcoming content (Sonarr and Radarr only, default: 60)

trending_type: Content type to display for Trakt and TMDB


Card Configuration

All entity configurations are optional—use only what you need

media_player_entity enables playback control (Coming Soon!)

Getting API Keys

Plex

🔗 Find your Plex token

Jellyfin
 Create an api-key in jellyfin

Sonarr / Radarr / Seer

1. Go to Settings → General

2. Copy your API key

Trakt

1. Create an application at Trakt API

2. Get your Client ID and Client Secret

TMDB

1. Create an account at TMDB

2. Request an API key from your account settings

Upcoming Features

🚀 Emby support
🎬 Click-to-play functionality for Plex/Jellyfin (still pondering)
🔍 More integrations based on user feedback! Trakt calendar for instance...

Contributors

👤 Vansmak (aka Vanhacked)


---

License

📜 MIT License


---
