// styles.js
export const styles = `
  /* Card Base */
  ha-card {
    overflow: hidden;
    padding: 0;
    position: relative;
    background: transparent;
    margin: 0;
    width: 100%;
  }

  .card-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    filter: blur(20px) brightness(0.7);
    transform: scale(1.2);
    transition: background-image 0.5s ease-in-out;
    z-index: 0;
    border-radius: 0;
  }

  .card-content {
    position: relative;
    z-index: 1;
    padding: 0; 
  }

  /* Media Content Section */
  .media-content {
    position: relative;
    width: 100%;
    height: 120px;
    overflow: hidden;
    border-radius: 0;
    margin-bottom: 8px;
    margin: 0;
    cursor: pointer;
  }

  @media (min-width: 600px) {
    .media-content {
      height: 140px;
    }
  }

  .media-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    transition: all 0.3s ease-in-out;
    filter: blur(var(--blur-radius, 0px));
    transform: scale(1.1);
  }

  .media-content:hover .media-background {
    transform: scale(1.15);
  }

  .media-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    color: white;
    z-index: 1;
  }

  /* Section Headers */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
    margin: 0;
    cursor: pointer;
    user-select: none;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .section-header:hover {
    background-color: var(--secondary-background-color);
  }

  .section-header-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-toggle-icon {
    transition: transform 0.3s ease;
  }

  .section-label {
    font-weight: 500;
    font-size: 13px;
    color: var(--primary-text-color);
    text-transform: uppercase;
    text-shadow: 0 1px 1px rgba(0,0,0,0.1);
  }

  /* Section Content */
  .section-content {
    max-height: 200px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    transform-origin: top;
    opacity: 1;
  }

  .section-content.collapsed {
    max-height: 0;
    opacity: 0;
    transform: scaleY(0);
  }

  /* Media Lists */
  .seer-trending-list,
  .seer-discover-list,
  .seer-popular-movies-list,
  .seer-popular-tv-list,
  .plex-list,
  .jellyfin-list,
  .sonarr-list,
  .radarr-list,
  .seer-list,
  .trakt-list,
  .tmdb-list,
  .tmdb-airing-today-list,
  .tmdb-now-playing-list,
  .tmdb-on-air-list,
  .tmdb-upcoming-list {
    padding: 0 4px;
    display: flex;
    flex-wrap: nowrap;
    gap: 4px;
    overflow-x: auto;
    scrollbar-width: thin;
    margin-bottom: 4px;
    -webkit-overflow-scrolling: touch;
  }

  /* Scrollbar Styling */
  .seer-trending-list::-webkit-scrollbar,
  .seer-discover-list::-webkit-scrollbar,
  .seer-popular-movies-list::-webkit-scrollbar,
  .seer-popular-tv-list::-webkit-scrollbar,
  .plex-list::-webkit-scrollbar,
  .jellyfin-list::-webkit-scrollbar,
  .sonarr-list::-webkit-scrollbar,
  .radarr-list::-webkit-scrollbar,
  .seer-list::-webkit-scrollbar,
  .trakt-list::-webkit-scrollbar,
  .tmdb-list::-webkit-scrollbar,
  .tmdb-airing-today-list::-webkit-scrollbar,
  .tmdb-now-playing-list::-webkit-scrollbar,
  .tmdb-on-air-list::-webkit-scrollbar,
  .tmdb-upcoming-list::-webkit-scrollbar {
    height: 4px;
  }

  *::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  *::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 2px;
  }

  /* Media Items */
  .media-item {
    flex: 0 0 auto;
    width: 85px;
    height: 135px;
    position: relative;
    cursor: pointer;
    transform: translateY(0);
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .media-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  .media-item.selected {
    box-shadow: 0 0 0 2px var(--primary-color);
  }

  .media-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .media-item::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(transparent, rgba(0,0,0,0.9));
    pointer-events: none;
  }

  .media-item-title {
    position: absolute;
    bottom: 4px;
    left: 4px;
    right: 4px;
    font-size: 0.75em;
    color: white;
    z-index: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
    text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
  }

  /* Content Info */
  .title {
    font-size: 1.2em;
    font-weight: 500;
    margin-bottom: 0; /* Reduced from 2px */
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);

  }

  .details {
    font-size: 1em;
    margin-bottom: 2px;
    opacity: 0.9;
  }

  .metadata {
    font-size: 0.85em;
    opacity: 0.8;
  }

  .overview {
    margin-top: 2px;
    font-size: 0.9em;
    opacity: 0.7;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: ellipsis;
  }

  /* Request Button Styles */
  .action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  }

  .action-button {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    color: white;
    font-size: 14px;
  }

  .remove-button {
    background-color: #dc3545;
  }

  .change-button {
    background-color: #17a2b8;
  }

  .status-removed {
    background-color: #6c757d;
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
  }
  .media-info-container {
    display: flex;
    flex-direction: column;
    gap: 8px; /* Reduced from 16px */
  }

  .request-button-container {
    margin-top: 4px;
  }

  .request-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    background: var(--primary-color, #03a9f4);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.3s;
  }

  .request-button:hover {
    background: var(--primary-color-light, #35baf6);
  }

  .request-button ha-icon {
    --mdc-icon-size: 18px;
  }

  .title-line {
  display: flex; /* or inline-flex */
  align-items: baseline; /* Align items to the baseline of the text */
  }

  .title-line .type {
    margin-right: 5px; /* Space between type and title */
  }

  .title-line .type, .title-line .title {
    white-space: nowrap; /* Prevents wrapping of type and title */
  }
  /* Status Styles */
  .status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .status-pending {
    background: var(--warning-color, #ffa726);
    color: var(--warning-text-color, black);
  }

  .status-approved {
    background: var(--success-color, #66bb6a);
    color: var(--success-text-color, white);
  }

  .status-declined {
    background: var(--error-color, #ef5350);
    color: var(--error-text-color, white);
  }

  .status-available {
    background: var(--info-color, #29b6f6);
    color: var(--info-text-color, white);
  }

  .status-unknown {
    background: var(--secondary-text-color, #9e9e9e);
    color: var(--text-primary-color, white);
  }

  .request-status {
    position: absolute;
    top: 2px;
    right: 2px;
    padding: 1px;
    border-radius: 2px;
    color: white;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
  }

  .status-icon {
    --mdc-icon-size: 12px;
    display: flex;
  }

  .status-pending { background-color: rgba(255, 152, 0, 0.8); }
  .status-approved { background-color: rgba(76, 175, 80, 0.8); }
  .status-available { background-color: rgba(33, 150, 243, 0.8); }
  .status-processing { background-color: rgba(156, 39, 176, 0.8); }
  .status-declined { background-color: rgba(244, 67, 54, 0.8); }

  /* Now Playing Section */
  .now-playing {
    position: relative;
    width: 100%;
    height: 60px;
    overflow: hidden;
    margin-bottom: 8px;
    border-radius: 4px;
  }

  .now-playing-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    filter: blur(10px) brightness(0.3);
    transform: scale(1.2);
  }

  .now-playing-content {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    height: 44px;
    color: white;
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(255,255,255,0.2);
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--primary-color);
    width: 0%;
    transition: width 1s linear;
  }

  /* Utility Classes */
  .hidden {
    display: none !important;
  }

  /* Mobile Optimization */
  @media (max-width: 600px) {
    .overview {
      -webkit-line-clamp: 1;
    }

    .section-header {
      padding: 6px;
    }

    .media-item {
      width: 85px;
      height: 128px;
    }
  }

  /* Dark/Light Theme Adjustments */
  @media (prefers-color-scheme: dark) {
    .section-header:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  @media (prefers-color-scheme: light) {
    .section-header:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
`;
