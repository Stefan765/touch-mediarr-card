export class BaseSection {
  constructor(key, title) {
    this.key = key;
    this.title = title;
    this._lastBackgroundUpdate = 0;
  }

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

  // 🩷 --- Medien-Item mit sichtbarem Herzbutton ---
  generateMediaItem(item, index, selectedType, selectedIndex) {
    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
        <div class="media-item-footer">
          ${item.rating ? `<span class="rating">⭐ ${item.rating.toFixed(1)}</span>` : ''}
          <button class="fav-btn" data-id="${item.id}" title="Zu Favoriten hinzufügen">
            <ha-icon icon="mdi:heart-outline"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  // 🧠 --- Info-Bereich (Standardverhalten) ---
  updateInfo(cardInstance, item) {
    if (!item) return;

    const mediaBackground = item.banner || item.fanart;
    const cardBackground = item.fanart || item.banner;

    if (mediaBackground) {
      cardInstance.background.style.backgroundImage = `url('${mediaBackground}')`;
      cardInstance.background.style.opacity = cardInstance.config.opacity || 0.7;
    }

    if (cardBackground && cardInstance.cardBackground) {
      cardInstance.cardBackground.style.backgroundImage = `url('${cardBackground}')`;
    }

    cardInstance.info.innerHTML = `
      <div class="title">${item.title}${item.year ? ` (${item.year})` : ''}</div>
      <div style="font-size: 10px; margin-top: 10px; color: yellow;">
        <div>Banner: ${item.banner ? '✓' : '✗'} ${item.banner || ''}</div>
        <div>Fanart: ${item.fanart ? '✓' : '✗'} ${item.fanart || ''}</div>
        <div>Backdrop: ${item.backdrop ? '✓' : '✗'} ${item.backdrop || ''}</div>
        <div>Using for media: ${mediaBackground}</div>
      </div>
    `;
  }

  // 🧩 --- Update der Sektion + Buttonlogik ---
  update(cardInstance, entity) {
    const maxItems =
      cardInstance.config[`${this.key}_max_items`] ||
      cardInstance.config.max_items ||
      10;

    let items = entity.attributes.data || [];
    items = items.slice(0, maxItems);

    const listElement = cardInstance.querySelector(`.${this.key}-list`);
    if (!listElement) return;

    listElement.innerHTML = items
      .map((item, index) =>
        this.generateMediaItem(item, index, cardInstance.selectedType, cardInstance.selectedIndex)
      )
      .join('');

    this.addClickHandlers(cardInstance, listElement, items);

    // 🩷 Favoritenbuttons aktivieren
    listElement.querySelectorAll('.fav-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();

        const itemId = e.currentTarget.dataset.id;
        const icon = e.currentTarget.querySelector('ha-icon');

        await this.addToFavorites(cardInstance, itemId);

        // Toggle Herzstatus
        const isFav = e.currentTarget.classList.toggle('favorited');
        icon.setAttribute('icon', isFav ? 'mdi:heart' : 'mdi:heart-outline');
      });
    });

    // 🎨 CSS einmalig injizieren
    this.ensureStyles(cardInstance);

    // 🖼️ Hintergrund zufällig aktualisieren
    if (
      cardInstance.cardBackground &&
      (!this._lastBackgroundUpdate ||
        Date.now() - this._lastBackgroundUpdate > 30000)
    ) {
      const bgImage = this.getRandomArtwork(items);
      if (bgImage) {
        cardInstance.cardBackground.style.backgroundImage = `url('${bgImage}')`;
        this._lastBackgroundUpdate = Date.now();
      }
    }
  }

  // 💡 --- Klick-Handler für Medien ---
  addClickHandlers(cardInstance, listElement, items) {
    listElement.querySelectorAll('.media-item').forEach((item) => {
      item.onclick = () => {
        const index = parseInt(item.dataset.index);
        const selectedItem = items[index];

        cardInstance.selectedType = this.key;
        cardInstance.selectedIndex = index;

        const mediaBackground = selectedItem.banner || selectedItem.fanart;
        const cardBackground = selectedItem.fanart || selectedItem.banner;

        if (mediaBackground) {
          cardInstance.background.style.backgroundImage = `url('${mediaBackground}')`;
        }
        if (cardBackground) {
          cardInstance.cardBackground.style.backgroundImage = `url('${cardBackground}')`;
        }

        this.updateInfo(cardInstance, items[index]);

        cardInstance.querySelectorAll('.media-item').forEach((i) => {
          i.classList.toggle(
            'selected',
            i.dataset.type === this.key && parseInt(i.dataset.index) === index
          );
        });
      };
    });
  }

  // 🎨 --- Styles innerhalb der Karte hinzufügen (sichtbar in HA) ---
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

  // 🔁 --- Zufälliges Hintergrundbild wählen ---
  getRandomArtwork(items) {
    if (!items || items.length === 0) return null;
    const validItems = items.filter(
      (item) => item.fanart || item.backdrop || item.banner
    );
    if (validItems.length === 0) return null;
    const randomItem =
      validItems[Math.floor(Math.random() * validItems.length)];
    return randomItem.fanart || randomItem.backdrop || randomItem.banner;
  }

  // 🧩 --- Hilfsfunktionen ---
  getAllArtwork(items) {
    if (!items || items.length === 0) return [];
    return items.reduce((artworks, item) => {
      if (item.fanart) artworks.push(item.fanart);
      if (item.backdrop) artworks.push(item.backdrop);
      if (item.banner) artworks.push(item.banner);
      return artworks;
    }, []);
  }

  formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  }

  // ❤️ --- Emby-Favoritenfunktion ---
  async addToFavorites(cardInstance, itemId) {
    const serverUrl = cardInstance.config.emby_url;
    const apiKey = cardInstance.config.emby_api_key;
    const userId = cardInstance.config.emby_user_id;

    if (!serverUrl || !apiKey || !userId) {
      console.error('⚠️ Emby-Konfiguration unvollständig!');
      return;
    }

    try {
      const res = await fetch(
        `${serverUrl}/Users/${userId}/FavoriteItems/${itemId}?api_key=${apiKey}`,
        { method: 'POST' }
      );
      if (res.ok) {
        console.log(`✅ Item ${itemId} wurde zu Favoriten hinzugefügt.`);
      } else {
        console.error('❌ Fehler beim Hinzufügen zu Favoriten:', res.status);
      }
    } catch (err) {
      console.error('💥 Fehler beim Favorisieren:', err);
    }
  }
}
