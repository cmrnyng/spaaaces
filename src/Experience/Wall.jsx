export const Wall = () => {
	return (
		<mesh position-z={-2.5}>
			<boxGeometry args={[5, 2.7, 0.1]} />
			<meshBasicMaterial color={"mediumpurple"} />
		</mesh>
	);
};
