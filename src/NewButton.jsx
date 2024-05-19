export const NewButton = () => {
  const handleClick = () => {
    console.log("new");
  };
  return (
    <button onClick={handleClick} className="menu-btn">
      New
    </button>
  );
};
