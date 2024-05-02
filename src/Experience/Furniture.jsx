import { FloorItem } from "./FloorItem.jsx";
import { Placeholder } from "./Placeholder.jsx";
import { useSelect } from "../selection.js";
import { useStore } from "../store.js";
import { Suspense } from "react";

export const Furniture = () => {
	const { centre } = useStore.getState().origin;
	const items = useSelect(state => state.items);
	console.log(items);
	return (
		<>
			{items.map((item, i) => (
				<Suspense key={i} fallback={<Placeholder position={[centre.x / 40, 0.5, centre.y / 40]} />}>
					<FloorItem key={i} url={item} position={[centre.x / 40, 0, centre.y / 40]} />
				</Suspense>
			))}
		</>
	);
};
