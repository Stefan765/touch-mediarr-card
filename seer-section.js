import { BaseSection } from './base-section.js';

export class SeerSection extends BaseSection {
  constructor() {
    super('seer', 'Seer Content');
    this.sections = [
      { key: 'seer', title: 'Media Requests', entityKey: 'seer_entity', listClass: 'seer-list' },
      { key: 'seer_trending', title: 'Trending', entityKey: 'seer_trending_entity', listClass: 'seer-trending-list' },
      { key: 'seer_popular_movies', title: 'Popular Movies', entityKey: 'seer_popular_movies_entity', listClass: 'seer-popular-movies-list' },
      { key: 'seer_popular_tv', title: 'Popular TV', entityKey: 'seer_popular_tv_entity', listClass: 'seer-popular-tv-list' },
      { key: 'seer_discover', title: 'Discover', entityKey: 'seer_discover_entity', listClass: 'seer-discover-list' }
    ];

    this.statusMap = {
      1: { text: 'Pending', icon: 'mdi:clock-outline', class: 'status-pending' },
      2: { text: 'Approved', icon: 'mdi:check-circle-outline', class: 'status-approved' },
      3: { text: 'Declined', icon: 'mdi:close-circle-outline', class: 'status-declined' },
      4: { text: 'Available', icon: 'mdi:download-circle-outline', class: 'status-available' }
    };
  }

  generateTemplate(config) {
    return this.sections
      .filter(section => config[section.entityKey])
      .map(section => `
        <div class="section" data-section="${section.key}">
          <div class="section-header">
            <div class="section-header-content">
              <ha-icon class="section-toggle-icon" icon="mdi:chevron-down"></ha-icon>
              <div class="section-label">${section.title}</div>
            </div>
          </div>
          <div class="section-content">
            <div class="${section.listClass}" data-list="${section.key}"></div>
          </div>
        </div>
      `).join('');
  }

  generateMediaItem(item, index, selectedType, selectedIndex, sectionKey) {
    return `
      <div class="media-item ${selectedType === sectionKey && index === selectedIndex ? 'selected' : ''}"
           data-type="${sectionKey}"
           data-index="${index}">
        <img src="${item.poster || '/api/placeholder/400/600'}" alt="${item.title || item.name || ''}">
        <div class="media-item-title">${item.title || item.name || ''}</div>
      </div>
    `;
  }

  update(cardInstance, entity) {
    const entityId = entity.entity_id;
    const sectionConfig = this.sections.find(section => 
      cardInstance.config[section.entityKey] === entityId
    );
    
    if (!sectionConfig) return;

    const items = entity.attributes.data || [];
    const listElement = cardInstance.querySelector(`[data-list="${sectionConfig.key}"]`);
    
    if (!listElement) return;

    listElement.innerHTML = items.map((item, index) => 
      this.generateMediaItem(item, index, cardInstance.selectedType, cardInstance.selectedIndex, sectionConfig.key)
    ).join('');

    this.addClickHandlers(cardInstance, listElement, items, sectionConfig.key);

    // Store the requests data for checking status
    if (entity.entity_id === cardInstance.config.seer_entity) {
      this.existingRequests = items;
    }
  }

  async checkIfRequested(cardInstance, item) {
    if (!this.existingRequests) {
      // Get requests from the seer entity
      const seerEntity = cardInstance.config.seer_entity;
      if (seerEntity && cardInstance._hass.states[seerEntity]) {
        this.existingRequests = cardInstance._hass.states[seerEntity].attributes.data || [];
      } else {
        this.existingRequests = [];
      }
    }

    // First try to match by TMDb ID
    const tmdbId = item.tmdbId || item.id;
    if (tmdbId) {
      return this.existingRequests.find(request => {
        const requestTmdbId = request.media?.tmdbId || request.tmdbId;
        return requestTmdbId === tmdbId;
      });
    }

    // If no TMDb ID, try to match by title and year (less reliable)
    if (item.title && item.year) {
      return this.existingRequests.find(request => 
        request.title === item.title && 
        request.year === item.year
      );
    }

    return null;  // No match found
  }

  async updateInfo(cardInstance, item, sectionKey) {
    if (!item) return;

    const title = item.title || item.name || '';
    const overview = item.overview || '';
    const year = item.year || '';
    const type = this._determineMediaType(item, sectionKey);
    
    const tmdbId = item.id;
    console.log('Item full data:', item);
    console.log('TMDB ID found:', tmdbId);

    const mediaBackground = item.fanart || item.poster || '';
    const cardBackground = item.fanart || item.poster || '';
    
    if (mediaBackground) {
      cardInstance.background.style.backgroundImage = `url('${mediaBackground}')`;
      cardInstance.background.style.opacity = cardInstance.config.opacity || 0.7;
    }

    if (cardBackground && cardInstance.cardBackground) {
      cardInstance.cardBackground.style.backgroundImage = `url('${cardBackground}')`;
    }

    // Check if item is already requested
    const existingRequest = await this.checkIfRequested(cardInstance, item);
    
    let actionButton = '';
    if (sectionKey !== 'seer') {
      if (existingRequest) {
        const statusInfo = this._getStatusInfo(existingRequest.status);
        actionButton = `
          <div class="request-button-container">
            <button class="request-button ${statusInfo.class}" disabled>
              <ha-icon icon="${statusInfo.icon}"></ha-icon>
              ${statusInfo.text}
            </button>
          </div>
        `;
      } else {
        actionButton = `
          <div class="request-button-container">
            <button class="request-button" onclick="this.dispatchEvent(new CustomEvent('seer-request', {
              bubbles: true,
              detail: {
                title: '${title.replace(/'/g, "\\'")}',
                year: '${year}',
                type: '${type}',
                tmdb_id: ${tmdbId},
                poster: '${(item.poster || '').replace(/'/g, "\\'")}',
                overview: '${overview.replace(/'/g, "\\'")}'
              }
            }))">
              <ha-icon icon="mdi:plus-circle-outline"></ha-icon>
              Request
            </button>
          </div>
        `;
      }
    }

    if (item.status) {
      const statusInfo = this._getStatusInfo(item.status);
      cardInstance.info.innerHTML = `
        <div class="title">${title}</div>
        <div class="details">
          <span class="status ${statusInfo.class}" onclick="this.dispatchEvent(new CustomEvent('change-status', {
            bubbles: true,
            detail: {
              title: '${title.replace(/'/g, "\\'")}',
              type: '${item.media_type || 'movie'}',
              request_id: ${item.request_id || 0}
            }
          }))">
            <ha-icon icon="${statusInfo.icon}"></ha-icon>
            ${statusInfo.text}
          </span>
          ${item.requested_by ? `${item.requested_by} - ${this.formatDate(item.requested_date)}` : ''}
        </div>
      `;
    } else {
  cardInstance.info.innerHTML = `
    <div class="title">${title}${year ? ` (${year})` : ''}</div>
    ${overview ? `<div class="overview">${overview}</div>` : ''}
    <div class="details">
      ${actionButton}
      ${type ? `<span class="type">${type}</span>` : ''}
    </div>
  `;
  }
  }

  _determineMediaType(item, sectionKey) {
    if (item.type) return item.type;
    if (sectionKey === 'seer_popular_movies' || item.media_type === 'movie') return 'movie';
    if (sectionKey === 'seer_popular_tv' || item.media_type === 'tv') return 'tv';
    if (item.first_air_date) return 'tv';
    if (item.release_date) return 'movie';
    return 'movie';
  }

  addClickHandlers(cardInstance, listElement, items, sectionKey) {
    listElement.querySelectorAll('.media-item').forEach(item => {
      item.onclick = () => {
        const index = parseInt(item.dataset.index);
        cardInstance.selectedType = sectionKey;
        cardInstance.selectedIndex = index;
        this.updateInfo(cardInstance, items[index], sectionKey);

        cardInstance.querySelectorAll('.media-item').forEach(i => {
          i.classList.toggle('selected', 
            i.dataset.type === sectionKey && parseInt(i.dataset.index) === index);
        });
      };
    });
    
    if (!cardInstance._statusChangeHandlerAdded) {
      cardInstance.addEventListener('change-status', async (e) => {
        const { title, type, request_id } = e.detail;

        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = '#333';
        modal.style.color = 'white';
        modal.style.padding = '20px';
        modal.style.boxShadow = '0px 0px 15px rgba(255,255,255,0.3)';
        modal.style.borderRadius = '10px';
        modal.style.textAlign = 'center';
        modal.style.zIndex = '1000';

        modal.innerHTML = `
          <p style="margin-bottom:10px;">Update status for "<strong>${title}</strong>":</p>
          <select id="status-select" style="padding:5px; font-size:16px;">
            <option value="approve">Approve</option>
            <option value="decline">Decline</option>
            <option value="remove">Remove</option>
          </select>
          <br><br>
          <button id="confirm-status" style="padding:10px 15px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer;">Confirm</button>
        `;

        document.body.appendChild(modal);

        document.getElementById('confirm-status').onclick = async () => {
          const new_status = document.getElementById('status-select').value;
          document.body.removeChild(modal);

          await window.document.querySelector('home-assistant')
            ?.hass.callService('mediarr', 'update_request', {
              name: title,
              type: type,
              new_status: new_status,
              request_id: request_id
            });

          // Force a re-render of the current item
          if (typeof cardInstance.selectedIndex !== 'undefined' && cardInstance.selectedType) {
            const items = cardInstance._hass.states[cardInstance.config.seer_entity].attributes.data || [];
            this.updateInfo(cardInstance, items[cardInstance.selectedIndex], cardInstance.selectedType);
          }
        };
      });

      cardInstance._statusChangeHandlerAdded = true;
    }

    if (!cardInstance._seerRequestHandlerAdded) {
      cardInstance.addEventListener('seer-request', async (e) => {
        const { title, year, type, tmdb_id } = e.detail;
    
        try {
          const parsedTmdbId = parseInt(tmdb_id, 10);
          if (isNaN(parsedTmdbId)) {
            throw new Error('Invalid TMDB ID');
          }
    
          if (!this.existingRequests) {
            const seerEntity = cardInstance.config.seer_entity;
            if (seerEntity && cardInstance._hass.states[seerEntity]) {
              this.existingRequests = cardInstance._hass.states[seerEntity].attributes.data || [];
            } else {
              this.existingRequests = [];
            }
          }
    
          const existingRequest = this.existingRequests.find(request => {
            return request.title.toLowerCase() === title.toLowerCase() &&
                   (!year || request.year == year);
          });
    
          if (existingRequest && type.toUpperCase() === 'MOVIE') {
            alert(`"${title}" has already been requested.`);
            return;
          }
    
          let action, data;
    
          if (type.toUpperCase() === 'TV SHOW') {
            const season = await new Promise((resolve, reject) => {
              const modal = document.createElement('div');
              modal.style.position = 'fixed';
              modal.style.top = '50%';
              modal.style.left = '50%';
              modal.style.transform = 'translate(-50%, -50%)';
              modal.style.background = '#333';
              modal.style.color = 'white';
              modal.style.padding = '20px';
              modal.style.boxShadow = '0px 0px 15px rgba(255,255,255,0.3)';
              modal.style.borderRadius = '10px';
              modal.style.textAlign = 'center';
              modal.style.zIndex = '1000';
    
              modal.innerHTML = `
                <p style="margin-bottom:10px;">Select season for "<strong>${title}</strong>":</p>
                <select id="season-select" style="padding:5px; font-size:16px;">
                  <option value="first">First</option>
                  <option value="latest">Latest</option>
                  <option value="all" selected>All</option>
                </select>
                <br><br>
                <button id="confirm-season" style="padding:10px 15px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer;">Confirm</button>
              `;
    
              document.body.appendChild(modal);
    
              document.getElementById('confirm-season').onclick = () => {
                const selectedSeason = document.getElementById('season-select').value;
                document.body.removeChild(modal);
                resolve(selectedSeason);
              };

              window.addEventListener('unhandledrejection', () => {
                if (document.body.contains(modal)) {
                  document.body.removeChild(modal);
                }
              }, { once: true });
            });
    
            data = { name: title, season };
            action = 'mediarr.submit_tv_request';
          } else if (type.toUpperCase() === 'MOVIE') {
            data = { name: title };
            action = 'mediarr.submit_movie_request';
          } else {
            throw new Error('Unknown media type');
          }
    
          await window.document.querySelector('home-assistant')
            ?.hass.callService('mediarr', action.split('.')[1], data);
    
          const button = cardInstance.querySelector('.request-button');
          if (button) {
            button.innerHTML = `
              <ha-icon icon="mdi:check-circle-outline"></ha-icon>
              Requested
            `;
            button.classList.add('status-approved');
            button.disabled = true;
          }
    
          this.existingRequests = null;
    
        } catch (error) {
          console.error('Error sending media request:', error);
          const button = cardInstance.querySelector('.request-button');
          if (button) {
            button.innerHTML = `
              <ha-icon icon="mdi:alert-circle"></ha-icon>
              Failed
            `;
            button.classList.add('status-declined');
          }
        }
      });
    
      cardInstance._seerRequestHandlerAdded = true;
    }
  }

  _getStatusInfo(statusCode) {
    return this.statusMap[statusCode] || {
      text: 'Unknown',
      icon: 'mdi:help-circle-outline',
      class: 'status-unknown'
    };
  }
}