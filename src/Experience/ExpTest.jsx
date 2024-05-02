import { Grid, OrbitControls, PivotControls } from "@react-three/drei";

export const ExpTest = () => {
	const { gridSize, ...gridConfig } = {
		gridSize: [10.5, 10.5],
		cellSize: 0.4,
		cellThickness: 1,
		cellColor: "#d3d3d3",
		sectionSize: 3.3,
		sectionThickness: 0,
		fadeDistance: 25,
		fadeStrength: 1,
		followCamera: false,
		infiniteGrid: true,
	};

	return (
		<>
			<OrbitControls
				makeDefault
				maxPolarAngle={Math.PI / 2}
				screenSpacePanning={false}
				minDistance={1}
				maxDistance={10}
				panSpeed={0.7}
				rotateSpeed={0.7}
			/>
			{/* <axesHelper args={[2, 2, 2]} /> */}
			<Grid position={[0, -0.01, 0]} args={gridSize} {...gridConfig} />
			<directionalLight position={[0, 20, 0]} />
			<ambientLight intensity={1.3} />

			<PivotControls
				disableScaling
				disableSliders
				disableAxes
				activeAxes={[true, false, true]}
				depthTest={false}
			>
				<mesh>
					<boxGeometry />
					<meshNormalMaterial />
				</mesh>
			</PivotControls>
		</>
	);
};
