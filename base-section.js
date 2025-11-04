export class BaseSection {
  constructor(key, title) {
    this.key = key;
    this.title = title;
    this._lastBackgroundUpdate = 0;
    this._favoriteIds = new Set(); // 🩷 lokale Favoritenliste aus Emby
  }

  // 🏗️ Template für die Sektion
  generateTemplate() {
    return `
      <div class="section" data-section="${this.key}">
        <div class="section-header">
          <div class="section-header-content">
            <ha-icon class="section-toggle-icon" icon="mdi:chevron-down"></ha-icon>
            <div class="section-label">${this.title}</div>
          </div>
        </div>
        <div class="section-content">
          <div class="${this.key}-list"></div>
        </div>
      </div>
    `;
  }

  // 🎬 Einzelnes Medien-Item (Poster + Sterne + Herz)
  generateMediaItem(item, index, selectedType, selectedIndex) {
    const isFavorite = item.isFavorite || false;
    const heartIcon = isFavorite ? "mdi:heart" : "mdi:heart-outline";
    const favClass = isFavorite ? "favorited" : "";

    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
        <div class="media-item-footer">
          ${item.rating ? `<span class="rating">⭐ ${item.rating.toFixed(1)}</span>` : ''}
        </div>
      </div>
    `;
  }

  // 📋 Detailinfo oben
  updateInfo(cardInstance, item) {
    if (!item) return;

    // 🖼️ Hintergrundbild (Fallback-Reihenfolge)
    const bgImage =
      item.fanart ||
      item.banner ||
      item.backdrop ||
      item.poster ||
      item.BackdropImage ||
      item.PrimaryImage ||
      item.Image ||
      null;

    if (bgImage) {
      if (cardInstance.background) {
        cardInstance.background.style.backgroundImage = `url('${bgImage}')`;
        cardInstance.background.style.opacity = 0.7;
      }
      if (cardInstance.cardBackground) {
        cardInstance.cardBackground.style.backgroundImage = `url('${bgImage}')`;
      }
    }

    // 🎞️ Metadaten vorbereiten
    const title = item.title || item.Name || "Unbekannt";
    const release = item.release || item.year || "";
    const genres = item.genres || item.Genres?.join(", ") || "";
    const studio = item.studio || item.Studios?.[0]?.Name || "";
    const rating = item.rating || item.CommunityRating || "";
    const runtime = item.runtime || item.RunTimeMinutes ? `${item.RunTimeMinutes} min` : "";
    const summary =
      item.summary || item.Overview || item.Plot || "Keine Beschreibung verfügbar.";

    // 🎨 HTML für Info-Bereich
    cardInstance.info.innerHTML = `
      <div class="info-header">
        <div class="title">${title}${release ? ` (${release})` : ""}</div>
        <div class="meta">
          ${genres ? `${genres}` : ""}${genres && studio ? " | " : ""}${studio ? `${studio}` : ""}
        </div>
        <div class="meta">
          ${runtime ? `⏱️ ${runtime}` : ""}${rating ? ` | ⭐ ${rating}` : ""}
        </div>
      </div>
      <div class="summary">${summary}</div>
    `;
  }

  // 🔄 Hauptupdate der Liste
  async update(cardInstance, entity) {
    const maxItems =
      cardInstance.config[`${this.key}_max_items`] ||
      cardInstance.config.max_items ||
      10;

    // 🧩 Fix: Wenn data ein String ist, zuerst parsen
    let items = entity.attributes.data || [];
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (e) {
        console.error("❌ Fehler beim Parsen von data:", e, items);
        items = [];
      }
    }

    // Sicherheitsprüfung: Muss Array sein
    if (!Array.isArray(items)) {
      console.error("❌ Ungültiges Format für items:", items);
      return;
    }

    // Maximalanzahl begrenzen
    items = items.slice(0, maxItems);

    // 🩷 Favoriten aus Emby abrufen
    await this.fetchFavoritesFromEmby(cardInstance);

    // 🧩 Favoriten markieren
    items.forEach(item => {
      item.isFavorite = item.Id ? this._favoriteIds.has(item.Id.toString()) : false;
    });

    const listElement = cardInstance.querySelector(`.${this.key}-list`);
    if (!listElement) return;

    listElement.innerHTML = items
      .map((item, index) => this.generateMediaItem(item, index, cardInstance.selectedType, cardInstance.selectedIndex))
      .join('');

    // 💖 Favoriten-Klicklogik
    listElement.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const button = e.currentTarget;
        const itemId = button.dataset.id;
        const icon = button.querySelector('ha-icon');
        const isFav = button.classList.toggle('favorited');
        icon.setAttribute('icon', isFav ? 'mdi:heart' : 'mdi:heart-outline');

        if (isFav) {
          await this.addToFavorites(cardInstance, itemId);
          this._favoriteIds.add(itemId);
        } else {
          await this.removeFromFavorites(cardInstance, itemId);
          this._favoriteIds.delete(itemId);
        }
      });
    });

    // 🎨 Hintergrund max. alle 30s
    if (cardInstance.cardBackground && (!this._lastBackgroundUpdate || Date.now() - this._lastBackgroundUpdate > 30000)) {
      const bgImage = this.getRandomArtwork(items);
      if (bgImage) {
        cardInstance.cardBackground.style.backgroundImage = `url('${bgImage}')`;
        this._lastBackgroundUpdate = Date.now();
      }
    }

    this.addClickHandlers(cardInstance, listElement, items);
    this.ensureStyles(cardInstance);
  }

  // 🎥 Klick auf Medien-Item (Detailanzeige)
  addClickHandlers(cardInstance, listElement, items) {
    listElement.querySelectorAll('.media-item').forEach(itemEl => {
      itemEl.onclick = () => {
        const index = parseInt(itemEl.dataset.index);
        const selectedItem = items[index];

        cardInstance.selectedType = this.key;
        cardInstance.selectedIndex = index;

        // 🖼️ Hintergrundbild suchen (mit Fallback)
        const mediaBackground =
          selectedItem.banner ||
          selectedItem.fanart ||
          selectedItem.backdrop ||
          selectedItem.poster;

        const cardBackground =
          selectedItem.fanart ||
          selectedItem.banner ||
          selectedItem.backdrop ||
          selectedItem.poster;

        if (mediaBackground)
          cardInstance.background.style.backgroundImage = `url('${mediaBackground}')`;

        if (cardBackground)
          cardInstance.cardBackground.style.backgroundImage = `url('${cardBackground}')`;

        // 🔄 Info-Bereich aktualisieren
        this.updateInfo(cardInstance, selectedItem);

        // 🔘 Auswahl markieren
        cardInstance.querySelectorAll('.media-item').forEach(i => {
          i.classList.toggle(
            'selected',
            i.dataset.type === this.key && parseInt(i.dataset.index) === index
          );
        });
      };
    });
  }

  // 🎨 CSS für Herzbutton
  ensureStyles(cardInstance) {
    const card = cardInstance.closest('ha-card');
    if (card && !card.querySelector('style[data-fav-style]')) {
      const style = document.createElement('style');
      style.setAttribute('data-fav-style', 'true');
      style.textContent = `
        .fav-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--secondary-text-color);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          transition: color 0.25s;
        }
        .fav-btn ha-icon {
          width: 22px;
          height: 22px;
        }
        .fav-btn:hover ha-icon {
          color: var(--accent-color);
        }
        .fav-btn.favorited ha-icon {
          color: var(--state-icon-active-color, #ff4444);
        }
      `;
      card.appendChild(style);
    }
  }

  // 🧠 Emby-Favoriten abrufen
  async fetchFavoritesFromEmby(cardInstance) {
    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } = cardInstance.config;
    if (!serverUrl || !apiKey || !userId) return;

    try {
      const url = `${serverUrl}/emby/Users/${userId}/Items?SortBy=SortName&SortOrder=Ascending&Filters=IsFavorite&IncludeItemTypes=Movie&Fields=BasicSyncInfo,PrimaryImageAspectRatio&ImageTypeLimit=1&EnableImageTypes=Primary,Backdrop&Recursive=true&api_key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      const favorites = (data.Items || []).map(item => item.Id);
      this._favoriteIds = new Set(favorites);
      console.log(`🔄 Emby-Favoriten geladen: ${favorites.length} Stück`);
    } catch (err) {
      console.warn("⚠️ Fehler beim Abrufen der Favoriten:", err);
    }
  }

  // ❤️ Emby: Favorit hinzufügen
  async addToFavorites(cardInstance, itemId) {
    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } = cardInstance.config;
    if (!serverUrl || !apiKey || !userId || !itemId) return;

    try {
      const url = `${serverUrl}/Users/${userId}/FavoriteItems/${itemId}?X-Emby-Token=${apiKey}`;
      const res = await fetch(url, { method: "POST" });
      if (res.ok) console.log(`✅ Item ${itemId} zu Favoriten hinzugefügt.`);
      else console.error("❌ Fehler beim Hinzufügen:", res.status, await res.text());
    } catch (err) {
      console.error("💥 Fehler beim Favorisieren:", err);
    }
  }

  // 💔 Emby: Favorit entfernen
  async removeFromFavorites(cardInstance, itemId) {
    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } = cardInstance.config;
    if (!serverUrl || !apiKey || !userId || !itemId) return;

    try {
      const url = `${serverUrl}/Users/${userId}/FavoriteItems/${itemId}?X-Emby-Token=${apiKey}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) console.log(`🗑️ Item ${itemId} aus Favoriten entfernt.`);
      else console.error("❌ Fehler beim Entfernen:", res.status, await res.text());
    } catch (err) {
      console.error("💥 Fehler beim Entfernen:", err);
    }
  }

  // 🖼️ Zufälliges Hintergrundbild
  getRandomArtwork(items) {
    if (!items || items.length === 0) return null;
    const validItems = items.filter(item => item.fanart || item.backdrop || item.banner);
    if (validItems.length === 0) return null;
    const randomItem = validItems[Math.floor(Math.random() * validItems.length)];
    return randomItem.fanart || randomItem.backdrop || randomItem.banner;
  }
}
