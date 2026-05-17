import { createContext, useContext, useState } from 'react';

type FavoritesContextType = {
  favorites: string[];

  toggleFavorite: (id: string) => void;

  isFavorite: (id: string) => boolean;
};

const FavoritesContext =
  createContext<FavoritesContextType>({
    favorites: [],

    toggleFavorite: () => {},

    isFavorite: () => false,
  });

export function FavoritesProvider({
  children,
}: any) {
  const [favorites, setFavorites] = useState<
    string[]
  >([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  const isFavorite = (id: string) => {
    return favorites.includes(id);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
      }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}