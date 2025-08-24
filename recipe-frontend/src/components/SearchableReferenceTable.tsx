import React, { useState, useMemo } from 'react';
import './SearchableReferenceTable.css'; 
import { FaSearch } from 'react-icons/fa';

interface SearchableReferenceTableProps {
  title: string;
  items: string[];
  placeholder?: string;
}

const SearchableReferenceTable: React.FC<SearchableReferenceTableProps> = ({
  title,
  items,
  placeholder = "Search...",
}) => {
  const [searchTerm, setSearchTerm] = useState('');

    // Memoize the filtered items to avoid unnecessary recalculations   
  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return items;
    }
    return items.filter(item =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  return (
    <div className="reference-table-container">
      <h4>{title}</h4>
      <div className="search-bar-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul className="reference-list">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))
        ) : (
          <li className="no-results">No results found.</li>
        )}
      </ul>
    </div>
  );
};

export default SearchableReferenceTable;