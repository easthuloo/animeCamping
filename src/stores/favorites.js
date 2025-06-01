import { defineStore } from 'pinia';

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favoriteAnimeIds: JSON.parse(localStorage.getItem('favoriteAnimeIds') || '[]')
  }),
  getters: {
    isFavorite: (state) => (animeId) => {
      return state.favoriteAnimeIds.includes(animeId);
    },
    favoriteCount: (state) => {
      return state.favoriteAnimeIds.length;
    }
  },
  actions: {
    addFavorite(animeId) {
      if (!this.favoriteAnimeIds.includes(animeId)) {
        this.favoriteAnimeIds.push(animeId);
        localStorage.setItem('favoriteAnimeIds', JSON.stringify(this.favoriteAnimeIds));
      }
    },
    removeFavorite(animeId) {
      this.favoriteAnimeIds = this.favoriteAnimeIds.filter(id => id !== animeId);
      localStorage.setItem('favoriteAnimeIds', JSON.stringify(this.favoriteAnimeIds));
    },
    toggleFavorite(animeId) {
      if (this.isFavorite(animeId)) {
        this.removeFavorite(animeId);
      } else {
        this.addFavorite(animeId);
      }
    },
    clearFavoritesOnLogout() {
      this.favoriteAnimeIds = [];
      this.saveFavorites(); // Also clear from localStorage
    }
  },
  // Initialize favorites from localStorage when the store is created
  // This can be done by calling loadFavorites() if not done automatically
  // or by directly setting state in a setup function style store.
  // For options store, you might call loadFavorites in App.vue or when authStore initializes.
});

// Ensure loadFavorites is called when the store is initialized if it's not already.
// One way for options store is to have a plugin or call it in main.js/App.vue
// For setup store, it's more straightforward within the setup function.
// Given the current structure, ensure loadFavorites() is called appropriately.
// A simple way is to call it when the store instance is first created/used,
// or explicitly in App.vue on app mount.