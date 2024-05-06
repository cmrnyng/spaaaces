import { useRef, useEffect, useMemo } from "react";
import { useGLTF, DragControls, PivotControls, Clone } from "@react-three/drei";
import { useSelect } from "../selection";
import * as THREE from "three";

export const FloorItem = ({ url, uuid, position, quaternion }) => {
	const { scene } = useGLTF(url);
	const copiedScene = useMemo(() => scene.clone(), [scene]);
	copiedScene.uuid = uuid;
	const obj = useRef();
	const pivot = useRef();
	let toggle = true;

	const updateItem = useSelect(state => state.updateItem);

	const handleClick = e => {
		e.stopPropagation();
		if (e.delta > 5) return;
		toggleRotate();
		console.log(copiedScene);
	};

	const toggleRotate = () => {
		if (pivot.current) {
			toggle = !toggle;
			pivot.current.children[0].visible = toggle;
			pivot.current.children[0].children[0].children[0].visible = toggle;
		}
	};

	// const changeTexture = e => {
	// 	if (e.delta > 5) return;
	// 	e.stopPropagation();
	// 	useSelect.setState({ selection: { obj: e.eventObject, len, height } });
	// };

	useEffect(() => {
		const currentPivot = pivot.current;
		if (currentPivot) {
			currentPivot.children[0].children[0].children[0].visible = true;
			currentPivot.children[0].visible = true;
		}

		const handleKeydown = e => {
			if (e.key === "l") {
				const worldPosition = new THREE.Vector3();
				const worldQuaternion = new THREE.Quaternion();
				copiedScene.getWorldPosition(worldPosition);
				copiedScene.getWorldQuaternion(worldQuaternion);
				console.log(worldPosition);

				// updateItem(uuid, worldPosition, worldQuaternion);
			}
		};

		window.addEventListener("keydown", handleKeydown);

		return () => {
			window.removeEventListener("keydown", handleKeydown);
			const worldPosition = new THREE.Vector3();
			const worldQuaternion = new THREE.Quaternion();
			copiedScene.getWorldPosition(worldPosition);
			copiedScene.getWorldQuaternion(worldQuaternion);

			updateItem(uuid, worldPosition);
		};
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
					<primitive
						ref={obj}
						object={copiedScene}
						position={position}
						quaternion={quaternion}
						onClick={handleClick}
						// onPointerDown={e => e.stopPropagation()}
					/>
				</PivotControls>
			</DragControls>
		</>
	);
};
