# 🎬 Emby Mediarr Card for Home Assistant
*(Inspired by Mediarr Card by Vansmak)*

Eine umfassende visuelle Übersicht über deinen **Emby**-Server in **Home Assistant**.  
Die Karte zeigt deine neuesten Filme und Serien direkt in Lovelace an – übersichtlich, modern und anpassbar.

---

## ❤️ Support This Project
Wenn dir dieses Projekt gefällt oder du es nützlich findest, kannst du mich gerne unterstützen.  
Deine Beiträge helfen, das Projekt zu pflegen und weiterzuentwickeln.  
Vielen Dank für deinen Support! 🙏  

👉 [Buy me a coffee](https://buymeacoffee.com/stefan765)

---

## ✨ Features

### 🧩 Modular Design
✅ Zusammenklappbare Sektionen  
✅ Dynamische Hintergründe  

### 🎥 Emby Integration
- Zeigt kürzlich hinzugefügte Filme und Serien aus deinem Emby-Server  
- Unterstützt mehrere Medientypen  
- Optional mit aktuellem Wiedergabestatus  

### ⭐ Favoritenfunktion
- **Favoritenstatus anzeigen**: Zeige an, welche Inhalte in Emby als Favorit markiert sind  
- **Favoriten hinzufügen/entfernen**: Klicke direkt in der Karte, um Inhalte als Favorit zu markieren oder zu entfernen  
- **Sofortige Synchronisation** mit deinem Emby-Server  

### ▶️ Media Player State
Zeigt optional ein Overlay des aktuell wiedergegebenen Mediums, falls du ein `media_player.emby` oder ähnliches eingebunden hast.

---

## 🖼️ Screenshots
*(Beispielbilder folgen in Kürze)*

---

## ⚙️ Installation

### 🔹 HACS Installation
1. Öffne **HACS** in Home Assistant  
2. Gehe zu **Frontend**  
3. Klicke auf die drei Punkte (⋮) → **Custom repositories**  
4. Füge das Repository hinzu:  https://github.com/Stefan765/emby-mediarr-card
5. Kategorie: **Lovelace (Dashboard)**  
5. Finde und installiere **Emby Mediarr Card**  
6. Starte Home Assistant neu  

### 🔹 Manuelle Installation
1. Lade das neueste Release von [GitHub](https://github.com/Stefan765/emby-mediarr-card/releases) herunter  
2. Kopiere die Dateien in:  /config/www/community/emby-mediarr-card/
3. 3. Füge die Ressource hinzu:  
- Einstellungen → Dashboards → Ressourcen → „Hinzufügen“  
- URL:  
  ```
  /local/emby-mediarr-card/main.js
  ```
- Typ: **JavaScript Module**  
4. Starte Home Assistant neu  

---

## 🧠 Konfiguration

### Schritt 1: Installiere und konfiguriere die Sensoren
Erforderlich: [Emby Mediarr Sensor](https://github.com/Stefan765/emby-mediarr-sensor)

### Schritt 2: Karte zu Lovelace hinzufügen

```yaml
type: custom:emby-mediarr-card
media_player_entity: media_player.emby

# Emby Entities
emby_movies_entity: sensor.emby_movies_mediarr
emby_series_entity: sensor.emby_series_mediarr

# Verbindungsdaten zu deinem Emby-Server
emby_url: http://xxxxx:8096          # URL deines Emby-Servers (ersetze xxxxx durch IP oder Hostname)
emby_api_key: YOUR_EMBY_API_KEY      # API Key für den Zugriff (eigener Schlüssel)
emby_user_id: <DEINE_EMBY_USER_ID>  # Optional: Benutzer-ID für personalisierte Daten

max_items: 15
opacity: 0.7
blur_radius: 5

Hinweise

emby_url: IP oder Hostname deines Emby-Servers inkl. Port (Standard 8096 für HTTP, 8920 für HTTPS).

emby_api_key: Muss über dein Emby-Konto erzeugt werden (Menü → API-Schlüssel).

emby_user_id: Optional, falls du Inhalte eines spezifischen Benutzers anzeigen möchtest. Kann leer gelassen werden, wenn der Standardbenutzer verwendet werden soll.

🎨 Visual Configuration

max_items: Maximale Anzahl angezeigter Einträge (Standard: 10)

opacity: Transparenz der Hintergrundbilder (0 = durchsichtig, 1 = voll sichtbar)

blur_radius: Weichzeichner für Hintergrundbilder (in Pixeln)

Beispiel:
opacity: 0.7
blur_radius: 5

👥 Contributors

👤 Stefan765 – Projektinhaber & Entwickler

🙌 Inspiriert von Vansmak / Mediarr Card

📜 License

MIT License
