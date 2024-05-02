import { useState, useEffect } from "react";
import { useSelect } from "../selection.js";
import items from "../data/items.json";

export const Items = ({ setItemMenu }) => {
  console.log("items render");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filteredItems, setFilteredItems] = useState(items);
  const addItems = useSelect(state => state.addItems);

  const categories = [
    "Chairs",
    "Sofas",
    "Stools",
    "Benches",
    "Tables",
    "Beds",
    "Shelving",
    "Windows & Doors",
    "Cabinets",
    "Lighting",
  ];

  const handleFilterSelect = selectedCategory => {
    if (selectedFilters.includes(selectedCategory)) {
      const filters = selectedFilters.filter(el => el !== selectedCategory);
      setSelectedFilters(filters);
    } else {
      setSelectedFilters([...selectedFilters, selectedCategory]);
    }
  };

  useEffect(() => {
    filterItems();
  }, [selectedFilters]);

  const filterItems = () => {
    if (selectedFilters.length > 0) {
      let tempItems = selectedFilters.map(selectedCategory => {
        let temp = items.filter(item => item.category === selectedCategory);
        return temp;
      });
      setFilteredItems(tempItems.flat());
    } else {
      setFilteredItems([...items]);
    }
  };

  const handleSelect = itemUrl => {
    addItems(itemUrl);
    setItemMenu(false);
  };

  return (
    <>
      <h1 className="items-heading">Add Items</h1>
      <div className="items-container">
        <div className="items-categories">
          {categories.map((category, i) => (
            <button
              onClick={() => handleFilterSelect(category)}
              className={`category-btn ${selectedFilters?.includes(category) ? "active" : ""}`}
              key={`filter-${i}`}
            >
              {category}
            </button>
          ))}
        </div>
        <hr />
        <div className="filtered-items">
          {filteredItems.map((item, i) => (
            <img
              key={i}
              className="item"
              src={item.thumbnail}
              draggable="false"
              onClick={() => handleSelect(item.url)}
            />
          ))}
        </div>
      </div>
    </>
  );
};
