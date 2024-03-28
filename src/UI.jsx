import { useState } from "react";

export default function UI({ toggleView, designView }) {
  return (
    <button className="btn" onClick={toggleView}>
      {designView ? "Floorplan View" : "Design View"}
    </button>
  );
}
