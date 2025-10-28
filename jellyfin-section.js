// sections/jellyfin-section.js
import { BaseSection } from './base-section.js';

export class JellyfinSection {
  generateTemplate(config) {
    return `
      <div class="section" data-section="jellyfin">
        <div class="section-header">
          <span>${config.jellyfin_label || 'Jellyfin'}</span>
          <ha-icon class="section-toggle-icon" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="section-content">
          <div class="jellyfin-item">
            <div class="jellyfin-title"></div>
            <div class="jellyfin-description"></div>
            <div class="jellyfin-type"></div>
          </div>
        </div>
      </div>
    `;
  }

  update(card, entity) {
    if (!entity || !entity.attributes?.data || entity.attributes.data.length === 0) return;
    const item = entity.attributes.data[0];

    const titleEl = card.querySelector('.jellyfin-title');
    const descEl = card.querySelector('.jellyfin-description');
    const typeEl = card.querySelector('.jellyfin-type');

    if (titleEl) titleEl.innerHTML = `<b>${item.title || ''}</b>`;
    if (descEl) descEl.textContent = item.overview || item.plot || '';
    if (typeEl) typeEl.textContent = item.type || '';
  }

  updateInfo(card, data) {
    const titleEl = card.querySelector('.jellyfin-title');
    const descEl = card.querySelector('.jellyfin-description');
    const typeEl = card.querySelector('.jellyfin-type');

    if (titleEl) titleEl.innerHTML = `<b>${data.title || ''}</b>`;
    if (descEl) descEl.textContent = data.overview || data.plot || '';
    if (typeEl) typeEl.textContent = data.type || '';
  }
}

    
    if (!item) return;

    // Check for empty state and clear the info if the item has a default title
    if (item.title_default) {
      cardInstance.info.innerHTML = '';
      return;
    }

    // Then add Jellyfin-specific info display
    const addedDate = item.release ? new Date(item.release).toLocaleDateString() : 'Unknown';
    const runtime = item.runtime ? `${item.runtime} min` : '';
    const subtitle = item.episode ? `${item.number || ''} - ${item.episode || ''}` : '';

    cardInstance.info.innerHTML = `
      <div class="title">${item.title}${item.year ? ` (${item.year})` : ''}</div>
      <div class="details">${subtitle}</div>
      <div class="metadata">Released: ${addedDate}${runtime ? ` | ${runtime}` : ''}</div>
    `;
  }

  generateMediaItem(item, index, selectedType, selectedIndex) {
    // Handle empty state
    if (item.title_default) {
      return `
        <div class="empty-section-content">
          <div class="empty-message">No recently added media</div>
        </div>
      `;
    }

    // Use original media item layout
    <div class="media-item">
      <img src="FILM_BILD_URL" alt="FILMTITEL" />
    
      <!-- Info Overlay -->
      <div class="media-item-info">
        <div class="media-item-gradient"></div>
        <div class="jellyfin-title">FILMTITEL</div>
        <div class="jellyfin-description">
          Hier steht die kurze Filmbeschreibung. Sie kann bis zu zwei Zeilen lang sein und wird dann abgeschnitten.
        </div>
        <div class="jellyfin-type">Film</div>
      </div>
    </div>
    `;
  }
}
