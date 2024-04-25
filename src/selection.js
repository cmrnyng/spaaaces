import { create } from "zustand";

export const useSelect = create(set => ({
	selection: null,
	textures: {},
	setSelection: sel => set({ selection: sel }),
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
