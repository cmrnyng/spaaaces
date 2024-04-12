import { Experience } from "./Experience/Experience.jsx";
import { Canvas } from "@react-three/fiber";

export const DesignView = () => {
	console.log("designview render");

	// <Canvas shadows camera={{ position: [10, 12, 12], fov: 25 }} dpr={[1, 2]}>

	return (
		<Canvas
			camera={{
				fov: 60,
				position: [4, 3, 4],
			}}
			dpr={[1, 2]}
		>
			<Experience />
		</Canvas>
	);
};
