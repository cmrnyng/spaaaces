import { useState, useEffect } from "react";
import items from "../data/items.json";

export const Items = () => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filteredItems, setFilteredItems] = useState(items);
  const categories = [
    "Chairs",
    "Sofas",
    "Stools",
    "Benches",
    "Tables",
    "Beds",
    "Shelving",
    "Windows & Doors",
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
        <div className="filtered-items">
          {filteredItems.map((item, i) => (
            <div className="item" key={i}>
              Img here
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
