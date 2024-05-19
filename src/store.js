import { create } from "zustand";

export const useRoomData = create(set => ({
  corners: [],
  walls: [],
  rooms: [],
  origin: { centre: { x: 0, y: 0 }, size: { x: 0, y: 0 } },
  setElements: (corners, walls, rooms, origin) => set({ corners, walls, rooms, origin }),
}));

// Store for testing
// export const useRoomData = create(set => ({
// 	corners: [
// 		{ x: 475, y: 207, id: "ace2c35f-7f1d-4cac-9b40-025462e9bedc" },
// 		{ x: 475, y: 337, id: "af2861b2-0cfb-4f36-89d1-3cdc7bbae528" },
// 		{ x: 626, y: 337, id: "4059845f-b36c-42ec-85f6-606e30615171" },
// 		{ x: 626, y: 205, id: "2520d93f-3b25-4e0f-8c80-e64b05c7a7d3" },
// 	],
// 	walls: [
// 		{
// 			startId: "ace2c35f-7f1d-4cac-9b40-025462e9bedc",
// 			endId: "af2861b2-0cfb-4f36-89d1-3cdc7bbae528",
// 			id: "b8cc6dda-b8d4-46ce-be81-843c311d9960",
// 		},
// 		{
// 			startId: "af2861b2-0cfb-4f36-89d1-3cdc7bbae528",
// 			endId: "4059845f-b36c-42ec-85f6-606e30615171",
// 			id: "bac96058-e90a-40b3-9770-1941e86fb6cc",
// 		},
// 		{
// 			startId: "4059845f-b36c-42ec-85f6-606e30615171",
// 			endId: "2520d93f-3b25-4e0f-8c80-e64b05c7a7d3",
// 			id: "4beea2a5-2336-46ca-b489-55c18a58f8af",
// 		},
// 		{
// 			startId: "2520d93f-3b25-4e0f-8c80-e64b05c7a7d3",
// 			endId: "ace2c35f-7f1d-4cac-9b40-025462e9bedc",
// 			id: "063b1c9e-a676-4a33-a4e3-d63b973ae14c",
// 		},
// 	],
// 	rooms: [
// 		[
// 			"ace2c35f-7f1d-4cac-9b40-025462e9bedc",
// 			"af2861b2-0cfb-4f36-89d1-3cdc7bbae528",
// 			"4059845f-b36c-42ec-85f6-606e30615171",
// 			"2520d93f-3b25-4e0f-8c80-e64b05c7a7d3",
// 		],
// 	],
// 	setCorners: corners => set({ corners }),
// 	setWalls: walls => set({ walls }),
// 	setRooms: rooms => set({ rooms }),
// }));
