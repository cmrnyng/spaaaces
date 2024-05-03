import { Html } from "@react-three/drei";
import { useSelect } from "../selection";

export const ItemSelectMenu = () => {
  const selectedItem = useSelect(state => state.selectedItem);
  return (
    <Html>
      <div className="item-popup"></div>
    </Html>
  );
};
