import { useApp } from "./AppContext";
import switchIcon from "./assets/switch2.svg";

export default function UI({ toggleView, designView }) {
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
      <div className="wip-div">Under Development</div>
    </>
  );
}
