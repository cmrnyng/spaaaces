import { create } from "zustand";

export const useSelect = create(set => ({
  selection: null,
  textures: {},
  // setSelection: sel => set({ selection: sel }),
  // setTextures: (id, textureName) =>
  // 	set(state => ({
  // 		textures: { ...state.textures, [id]: textureName },
  // 	})),
  setTextures: (id, textureInfo) =>
    set(state => {
      if (state.textures[id] && typeof textureInfo === "object") {
        return {
          textures: { ...state.textures, [id]: { ...state.textures[id], ...textureInfo } },
        };
      } else {
        return {
          textures: { ...state.textures, [id]: textureInfo },
        };
      }
    }),
  selectedItem: null,
  // setSelectedItem: sel => set({ selectedItem: sel }),
  items: [],
  updateItem: (uuid, newPosition, newQuaternion) =>
    set(state => ({
      items: state.items.map(item => {
        console.log("items updated");
        if (item.uuid === uuid) {
          return {
            ...item,
            position: newPosition,
            quaternion: newQuaternion,
          };
        }
        return item;
      }),
    })),
  addItems: item =>
    set(state => ({
      items: [...state.items, item],
    })),
  deleteItems: uuidToDelete =>
    set(state => ({
      items: state.items.filter(i => i.uuid !== uuidToDelete),
    })),
}));
