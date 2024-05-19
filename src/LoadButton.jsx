export const LoadButton = () => {
  const handleClick = () => {
    console.log("load");
  };
  return (
    <button onClick={handleClick} className="menu-btn">
      Load
    </button>
  );
};
