// sections/radarr-section.js
import { BaseSection } from './base-section.js';

export class RadarrSection extends BaseSection {
  constructor() {
    super('radarr', 'Emby Neueste Serien');
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

 
