import React, { useState, useEffect } from 'react';
import * as api from '../api/apiService';
import type { PurchasesResponse } from '../types'; 
import type { PurchaseQueryParams } from '../types'; 
import { useDebounce } from '../hooks/useDebounce';
import './PurchasesPage.css';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const PurchasesPage: React.FC = () => {
  const [data, setData] = useState<PurchasesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // A single state object to manage all query parameters
  const [queryParams, setQueryParams] = useState<PurchaseQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'purchaseDate',
    order: 'desc',
    search: '',
    startDate: '',
    endDate: ''
  });

  // Debounce the search term to avoid too many API calls
  // This will wait for 500ms after the user stops typing before making the API call
  const debouncedSearchTerm = useDebounce(queryParams.search, 500); 

  useEffect(() => {
    const fetchPurchases = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Build the params object to send, removing empty strings for cleanliness
        const paramsToSend: PurchaseQueryParams = {
          page: queryParams.page,
          limit: queryParams.limit,
          sortBy: queryParams.sortBy,
          order: queryParams.order,
          search: debouncedSearchTerm,
          startDate: queryParams.startDate,
          endDate: queryParams.endDate
        };
        
        // Clean up the object to not send empty parameters to the API
        // This is good practice but optional if your backend handles them gracefully
        Object.keys(paramsToSend).forEach(key => {
          const typedKey = key as keyof PurchaseQueryParams;
          if (paramsToSend[typedKey] === '' || paramsToSend[typedKey] === undefined) {
            delete paramsToSend[typedKey];
          }
        });
        
        const response = await api.getPurchases(paramsToSend);
        setData(response.data);
      } catch (err) {
        setError("Failed to load purchases. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [
    debouncedSearchTerm, 
    queryParams.page, 
    queryParams.sortBy, 
    queryParams.order, 
    queryParams.startDate, 
    queryParams.endDate,
    queryParams.limit 
  ]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // When a filter changes, always reset to the first page
    setQueryParams(prev => ({ ...prev, [name]: value, page: 1 }));
  };
  
  // Handler for clicking on sortable table headers
  const handleSort = (column: string) => {
    setQueryParams(prev => ({
      ...prev,
      sortBy: column,
      order: prev.sortBy === column && prev.order === 'asc' ? 'desc' : 'asc',
      page: 1, 
    }));
  };
  
  // Helper to render the correct sort icon
  const renderSortIcon = (column: string) => {
    if (queryParams.sortBy !== column) {
      return <FaSort className="sort-icon" />;
    }
    if (queryParams.order === 'asc') {
      return <FaSortUp className="sort-icon active" />;
    }
    return <FaSortDown className="sort-icon active" />;
  };

return (
    <div className="page-container purchases-page-container">
      <header className="page-header">
        <h1>Purchase History</h1>
      </header>
      <div className="filters-container">
        <div className="form-group search-filter">
          <label htmlFor="search">Filter by Ingredient</label>
          <input 
            id="search"
            type="text" 
            name="search"
            placeholder="e.g., flour, sugar..." 
            className="form-input"
            value={queryParams.search}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input 
            id="startDate"
            type="date"
            name="startDate"
            className="form-input"
            value={queryParams.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input 
            id="endDate"
            type="date"
            name="endDate"
            className="form-input"
            value={queryParams.endDate}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th data-sortable="true" onClick={() => handleSort('ingredientId.name')}>
                Ingredient {renderSortIcon('ingredientId.name')}
              </th>
              <th data-sortable="true" onClick={() => handleSort('price')}>
                Price {renderSortIcon('price')}
              </th>
              <th>Quantity</th>
              <th data-sortable="true" onClick={() => handleSort('purchaseDate')}>
                Date {renderSortIcon('purchaseDate')}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (

              <tr>
                <td colSpan={4} className="loading-row">
                    <div className="loading-spinner"></div>
                </td>
              </tr>
            ) : error ? (
              // Error State
              <tr className="empty-row">
                <td colSpan={4}>{error}</td>
              </tr>
            ) : data?.purchases.length === 0 ? (
              // Empty State
              <tr className="empty-row">
                <td colSpan={4}>No purchases found matching your criteria.</td>
              </tr>
            ) : (
                // Data Loaded State
                data?.purchases.map(p => (
                  <tr key={p._id}>
                    <td>{p.ingredientId.name}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.quantityPurchased} {p.purchaseUnit}</td>
                    <td style={{ textAlign: 'right' }}>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="pagination-container">
          <button 
            onClick={() => setQueryParams(p => ({...p, page: (p.page ?? 1) - 1}))} 
            disabled={data.currentPage === 1 || isLoading}
          >
            Previous
          </button>
          
          <span>Page {data.currentPage} of {data.totalPages || 1}</span>
          
          <button 
            onClick={() => setQueryParams(p => ({...p, page: (p.page ?? 1) + 1}))} 
            disabled={data.currentPage === data.totalPages || isLoading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
export default PurchasesPage;