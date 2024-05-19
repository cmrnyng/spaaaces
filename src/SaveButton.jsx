import { useState } from "react";
import { useRoomData } from "./store";
import { useSelect } from "./selection";
import { useApp } from "./AppContext";
import downloadIcon from "./assets/downloadIcon.svg";

export const SaveButton = () => {
  const { updateItemPositions } = useApp();
  const [fileName, setFileName] = useState("");
  const [toggle, setToggle] = useState(false);

  const toggleDropdown = () => {
    setToggle(!toggle);
    setFileName("");
  };

  const handleDownload = () => {
    updateItemPositions();
    // Put all necessary data into an object and convert it to a JSON string
    const sceneData = {
      walls: useRoomData.getState().walls,
      corners: useRoomData.getState().corners,
      rooms: useRoomData.getState().rooms,
      origin: useRoomData.getState().origin,
      textures: useSelect.getState().textures,
      items: useSelect.getState().items,
    };
    const jsonString = JSON.stringify(sceneData);
    // Create a Blob
    const blob = new Blob([jsonString], { type: "application/space" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ? `${fileName}.space` : "my.space";
    a.click();
    URL.revokeObjectURL(url);
    toggleDropdown();
  };
  return (
    <>
      <button onClick={toggleDropdown} className="menu-btn">
        Save
      </button>
      {toggle && (
        <form
          className="save-dropdown"
          onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <label htmlFor="filename">File name:</label>
          <div className="input-download-btn-container">
            <input
              id="filename"
              value={fileName}
              onChange={e => {
                setFileName(e.target.value);
              }}
            />
            <button onClick={handleDownload} className="download-btn">
              <img className="icon" src={downloadIcon} />
            </button>
          </div>
        </form>
      )}
    </>
  );
};
