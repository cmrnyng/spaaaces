import { useRef, useEffect } from "react";
import { useGLTF, DragControls, TransformControls, PivotControls } from "@react-three/drei";

export const FloorItem = ({ url, position }) => {
	const { scene } = useGLTF(url);
	const obj = useRef();
	const pivot = useRef();

	const handleHover = hover => {
		if (pivot.current) {
			pivot.current.children[0].visible = hover;
		}
	};

	const toggleRotate = () => {
		if (pivot.current) {
			pivot.current.children[0].visible = !pivot.current.children[0].visible;
		}
	};

	useEffect(() => {
		const currentPivot = pivot.current;
		if (currentPivot) {
			currentPivot.children[0].visible = false;
		}
	}, []);

	return (
		<>
			<DragControls axisLock="y">
				<PivotControls
					ref={pivot}
					disableScaling
					disableSliders
					disableAxes
					activeAxes={[true, false, true]}
					depthTest={false}
				>
					<primitive ref={obj} object={scene} position={position} onClick={() => toggleRotate()} />
				</PivotControls>
			</DragControls>
		</>
	);
};
