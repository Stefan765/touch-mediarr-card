// sections/plex-section.js
import { BaseSection } from './base-section.js';

export class PlexSection extends BaseSection {
  constructor() {
    super('plex', 'Plex Recently Added');
  }

  updateInfo(cardInstance, item) {
    super.updateInfo(cardInstance, item);  // Handle backgrounds
    
    if (!item) return;
    if (item.title_default) {
        cardInstance.info.innerHTML = '';
        return;
    }

    const releaseDate = item.release === 'TBA' ? 
        'TBA' : 
        (item.release ? new Date(item.release).toLocaleDateString() : 'TBA');

    cardInstance.info.innerHTML = `
        <div class="title">${item.title}${item.year ? ` (${item.year})` : ''}</div>
        ${item.number ? `<div class="details">${item.number}${item.episode ? ` - ${item.episode}` : ''}</div>` : ''}
        <div class="metadata">Released: ${releaseDate}</div>
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
