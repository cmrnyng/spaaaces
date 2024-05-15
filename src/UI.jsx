import { useState } from "react";
import { useApp } from "./AppContext";
import menuIcon from "./assets/menuicon.svg";
import switchIcon from "./assets/switch2.svg";

export default function UI({ toggleView, designView }) {
  const [dropdown, setDropdown] = useState(false);

  const { updateItemPositions } = useApp();

  const handleButtonClick = () => {
    if (designView) {
      if (updateItemPositions) {
        updateItemPositions();
      }
    }
    toggleView();
  };

  return (
    <>
      <button className="switch-btn" onClick={handleButtonClick}>
        <img src={switchIcon} className="icon switch" />
      </button>
      <div className="menu" style={{ height: dropdown ? "185px" : "40px" }}>
        <button className="menu-toggle" onClick={() => setDropdown(!dropdown)}>
          <img src={menuIcon} className="icon" />
        </button>
        <div className="menu-contents">
          <button className="menu-btn">Save</button>
          <hr />
          <button className="menu-btn">Load</button>
          <hr />
          <button className="menu-btn">New</button>
        </div>
      </div>
      <div className="wip-div">Under Development</div>
    </>
  );
}
