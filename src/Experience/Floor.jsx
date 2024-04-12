export const Floor = () => {
	return (
		<mesh rotation-x={-Math.PI / 2} position-y={-1.35}>
			<planeGeometry args={[5, 5]} />
			<meshBasicMaterial color={"greenyellow"} />
		</mesh>
	);
};
