// sections/radarr-section.js
import { BaseSection } from './base-section.js';

export class RadarrSection extends BaseSection {
  constructor() {
    super('radarr', 'Upcoming Movies');
  }

  updateInfo(cardInstance, item) {
    super.updateInfo(cardInstance, item);  // Handle backgrounds
    
    if (!item) return;
    if (item.title_default) {
        cardInstance.info.innerHTML = '';
        return;
    }

    let releaseDate = '';
    if (item.release && !item.release.includes('Unknown')) {
        const dateStr = item.release.split(' - ')[1] || item.release;
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            releaseDate = date.toLocaleDateString();
        }
    }

    const runtime = item.runtime ? `${item.runtime} min` : '';

    cardInstance.info.innerHTML = `
        <div class="title">${item.title}${item.year ? ` (${item.year})` : ''}</div>
        <div class="details">${item.genres || ''}</div>
        <div class="metadata">${releaseDate}${runtime ? ` | ${runtime}` : ''}</div>
        ${item.overview ? `<div class="overview">${item.overview}</div>` : ''}
    `;
  }

  generateMediaItem(item, index, selectedType, selectedIndex) {
    // Handle empty state
    if (item.title_default) {
      return `
        <div class="empty-section-content">
          <div class="empty-message">No upcoming Movies</div>
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
