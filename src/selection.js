import { create } from "zustand";

export const useSelect = create(set => ({
  selection: null,
  textures: {},
  setSelection: sel => set({ selection: sel }),
  setTextures: tex =>
    set(state => ({
      textures: { ...state.textures, ...tex },
    })),
}));

// Tex is of the form { id: texture }
