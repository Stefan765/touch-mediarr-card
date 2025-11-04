Emby Mediarr Card for Home Assistant

A simplified Mediarr card for Home Assistant that provides a clean dashboard for Emby movies, series, and optional favorites.

❤️ Support This Project

If you find this project helpful, consider supporting it. Contributions help maintain and improve the project!

Buy Me a Coffee

Features

✅ View recently added Emby Movies

✅ View recently added Emby Series

✅ Favorites section (optional, if configured)

✅ Collapsible sections for a cleaner dashboard

✅ Optional media player overlay showing currently playing content

🎨 Dynamic backgrounds with configurable opacity and blur

Screenshots

(Insert screenshots here showing movies, series, and optionally favorites sections)

Installation
HACS

Open HACS → Frontend

Click the three dots (⋮) → Custom repositories

Add repository URL: https://github.com/Stefan765/emby-mediarr-card.git

Select Lovelace Dashboard → Click Add

Find and install Emby Mediarr Card

Restart Home Assistant

Manual

Download the latest release from this repository

Copy main.js, styles.js, and /sections folder to:

/config/www/community/emby-mediarr-card/


Add resource: Settings → Dashboards → Resources → Add Resource

URL: /local/emby-mediarr-card/main.js

Type: JavaScript Module

Restart Home Assistant

Configuration
type: custom:emby-mediarr-card
media_player_entity: media_player.your_emby_player  # optional
emby_movies_entity: sensor.emby_movies_mediarr
emby_movies_label: "Emby Movies"
emby_series_entity: sensor.emby_series_mediarr
emby_series_label: "Emby Series"
opacity: 0.7
blur_radius: 5
max_items: 20
days_to_check: 60

Options Explained
Option	Description	Default
max_items	Max items per section	20
days_to_check	How many days ahead to check for recently added content	60
opacity	Background transparency (0-1)	0.7
blur_radius	Background blur in pixels	0
media_player_entity	Optional Emby media player for currently playing overlay	-

Note: Sections only display if the corresponding entity is configured.

License

📜 MIT License
View on GitHub
