import React, { useState, useEffect, useMemo } from "react";
import type { FormEvent } from "react";
import * as api from "../api/apiService";
import type { Ingredient } from "../types";
import LogPurchaseModal from "../components/LogPurchaseModal";
import "./IngredientsPage.css";
import {
  FaPlus,
  FaTimes,
  FaWarehouse,
  FaSave,
  FaEdit,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";

type SortConfig = {
  key: keyof Ingredient;
  direction: "ascending" | "descending";
};

const IngredientsPage: React.FC = () => {
  // --- State ---
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{
    mode: "create" | "edit" | "purchase" | null;
    selectedIngredient: Ingredient | null;
  }>({ mode: null, selectedIngredient: null });

  // State for the Create/Edit form
  const [ingredientForm, setIngredientForm] = useState({
    id: "",
    name: "",
    description: "",
  });

  // State for search and sorting
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
  });

  // --- Data Fetching ---
  useEffect(() => {
    fetchIngredients();
  }, []);

  // Filtering and Sorting with useMemo
  const filteredAndSortedIngredients = useMemo(() => {
    let sortableIngredients = [...ingredients];

    // 1. Apply search filter (no change here)
    if (searchTerm) {
      sortableIngredients = sortableIngredients.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Apply sorting (THIS IS THE CORRECTED LOGIC)
    if (sortConfig.key) {
      sortableIngredients.sort((a, b) => {
        // Extract the values to be compared
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle cases where values might be null or undefined
        if (aValue == null) return 1; // nulls/undefined to the end
        if (bValue == null) return -1; // nulls/undefined to the end

        // Now, perform the actual comparison on the guaranteed-to-exist values
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0; // Values are equal
      });
    }

    return sortableIngredients;
  }, [ingredients, searchTerm, sortConfig]);

  const [purchaseModal, setPurchaseModal] = useState({
    isOpen: false,
    ingredientId: "", // To pre-select an ingredient
  });
  const fetchIngredients = async () => {
    try {
      setIsLoading(true);
      const response = await api.getIngredients();
      setIngredients(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load ingredients.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchIngredients();
  }, []);

  // --- Sorting Handler ---
  const handleSort = (key: keyof Ingredient) => {
    let direction: "ascending" | "descending" = "ascending";
    // If clicking the same column, toggle the direction
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: keyof Ingredient) => {
    if (sortConfig.key !== key) {
      return <FaSort className="sort-icon" />;
    }
    return sortConfig.direction === "ascending" ? (
      <FaSortUp className="sort-icon active" />
    ) : (
      <FaSortDown className="sort-icon active" />
    );
  };

  // --- Modal & Form Handlers ---
  const handleOpenPurchaseModal = (ingredient: Ingredient) => {
    setPurchaseModal({ isOpen: true, ingredientId: ingredient._id });
  };

  const handleClosePurchaseModal = () => {
    setPurchaseModal({ isOpen: false, ingredientId: "" });
  };

  const handleOpenModal = (
    mode: "create" | "edit" | "purchase",
    ingredient: Ingredient | null = null
  ) => {
    setError(null);
    setModalState({ mode, selectedIngredient: ingredient });

    if (mode === "edit" && ingredient) {
      setIngredientForm({
        id: ingredient._id,
        name: ingredient.name,
        description: ingredient.description || "",
      });
    }
  };

  const handleCloseModals = () => {
    setModalState({ mode: null, selectedIngredient: null });
    setIngredientForm({ id: "", name: "", description: "" });
  };

  // --- API handlers ---
  const handleIngredientSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (modalState.mode === "edit") {
        await api.updateIngredient(ingredientForm.id, {
          name: ingredientForm.name,
          description: ingredientForm.description,
        });
      } else {
        await api.createIngredient({
          name: ingredientForm.name,
          description: ingredientForm.description,
        });
      }
      handleCloseModals();
      fetchIngredients();
    } catch (err) {
      setError("Failed to save ingredient.");
      console.error("Error saving ingredient:", err);
    }
  };

  const handleDeleteIngredient = async (ingredientId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this ingredient? This action cannot be undone."
      )
    ) {
      try {
        await api.deleteIngredient(ingredientId);
        fetchIngredients();
      } catch (err) {
        alert("Failed to delete ingredient.");
        console.error("Error deleting ingredient:", err);
      }
    }
  };

  // --- Render Logic ---
  if (isLoading) return <div className="loading-spinner">Counting eggs...</div>;

  return (
    <div className="page-container ingredients-page-container">
      <header className="page-header">
        <h1>My Ingredients</h1>
        <button
          className="action-button"
          onClick={() => handleOpenModal("create")}
        >
          <FaPlus /> Add Ingredient
        </button>
      </header>

      <div className="filters-container">
        <div className="form-group search-filter">
          <input
            type="text"
            className="form-input"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && !modalState.mode && (
        <div className="error-message page-error">{error}</div>
      )}

      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th data-sortable="true" onClick={() => handleSort('name')}>
                <div className="header-content">
                  <span>Ingredient Name</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              
              <th data-sortable="true" onClick={() => handleSort('latestPricePerGram')}>
                <div className="header-content" style={{ justifyContent: 'flex-end' }}>
                  <span>Price per Gram</span>
                  {renderSortIcon('latestPricePerGram')}
                </div>
              </th>

              <th data-sortable="true" onClick={() => handleSort('lastUpdated')}>
                <div className="header-content" style={{ justifyContent: 'flex-end' }}>
                  <span>Last Updated</span>
                  {renderSortIcon('lastUpdated')}
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedIngredients.map((ing) => (
              <tr key={ing._id}>
                <td>{ing.name}</td>
                <td>${ing.latestPricePerGram > 0 ? ing.latestPricePerGram.toFixed(6) : 'N/A'}</td>
                <td>{ing.lastUpdated ? new Date(ing.lastUpdated).toLocaleDateString() : 'N/A'}</td>
                <td >
                  <button className="icon-button" onClick={() => handleOpenPurchaseModal( ing)} title="Log New Purchase" style={{ float: 'right' }}>
                    <FaWarehouse />
                  </button>
                  <button className="icon-button" onClick={() => handleOpenModal('edit', ing)} title="Edit Ingredient" style={{ float: 'right'}}>
                    <FaEdit />
                  </button>
                  <button className="icon-button delete" onClick={() => handleDeleteIngredient(ing._id)} title="Delete Ingredient" style={{ float: 'right'}}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Create/Edit Ingredient Modal --- */}
      {(modalState.mode === "create" || modalState.mode === "edit") && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={handleCloseModals}>
              <FaTimes />
            </button>
            <h2>
              {modalState.mode === "edit"
                ? "Edit Ingredient"
                : "Add New Ingredient"}
            </h2>
            <form onSubmit={handleIngredientSubmit}>
              {error && (
                <div className="error-message form-feedback">{error}</div>
              )}
              <div className="form-group">
                <label htmlFor="name">Ingredient Name</label>
                <input
                  id="name"
                  className="form-input"
                  type="text"
                  value={ingredientForm.name}
                  onChange={(e) =>
                    setIngredientForm({
                      ...ingredientForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  className="form-textarea"
                  value={ingredientForm.description}
                  onChange={(e) =>
                    setIngredientForm({
                      ...ingredientForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <button type="submit" className="submit-button">
                <FaSave /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
      {/* --- Log Purchase Modal --- */}
      <LogPurchaseModal
        isOpen={purchaseModal.isOpen}
        onClose={handleClosePurchaseModal}
        onSuccess={fetchIngredients} // The success callback refetches the ingredient list
        allIngredients={ingredients}
        initialIngredientId={purchaseModal.ingredientId}
      />
    </div>
  );
};

export default IngredientsPage;
