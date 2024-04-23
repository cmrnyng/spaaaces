import { create } from "zustand";

export const useSelect = create(set => ({
  selection: null,
  textures: {},
  setSelection: sel => set({ selection: sel }),
  setTextures: (id, textureName) =>
    set(state => ({
      textures: { ...state.textures, [id]: textureName },
    })),
}));

// Tex is of the form { id: texture }

// export const useSelect = create(set => ({
//   selection: null,
//   textures: [],
//   setSelection: sel => set({ selection: sel }),
//   setTextures: tex =>
//     set(state => ({
//       textures: [...state.textures, tex],
//     })),
// }));
