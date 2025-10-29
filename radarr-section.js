// sections/radarr-section.js
import { BaseSection } from './base-section.js';

export class JellyfinSection extends BaseSection {
  constructor() {
    super('jellyfin', 'Emby Neueste Serien');
  }

  updateInfo(cardInstance, item) {
    // First handle backgrounds using base class logic
    super.updateInfo(cardInstance, item);
    
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
    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
      </div>
    `;
  }
}
