import React, { useState, useEffect,  } from 'react';
import type {FormEvent} from 'react'
import * as api from '../api/apiService';
import type { Ingredient } from '../types';
import './IngredientsPage.css';
import { FaPlus, FaTimes, FaWarehouse, FaSave, FaEdit, FaTrash, FaDollarSign } from 'react-icons/fa';

const IngredientsPage: React.FC = () => {
  // --- State ---
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{
    mode: 'create' | 'edit' | 'purchase' | null;
    selectedIngredient: Ingredient | null;
  }>({ mode: null, selectedIngredient: null });

  // State for the Create/Edit form
  const [ingredientForm, setIngredientForm] = useState({ id: '', name: '', description: '' });
  
  // State for the Log Purchase form
  const [purchaseForm, setPurchaseForm] = useState({ price: '', quantity: '', unit: 'kg' });

  // --- Data Fetching ---
  useEffect(() => {
    fetchIngredients();
  }, []);

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

  // --- Modal & Form Handlers ---
  const handleOpenModal = (mode: 'create' | 'edit' | 'purchase', ingredient: Ingredient | null = null) => {
    setError(null); 
    setModalState({ mode, selectedIngredient: ingredient });
    
    if (mode === 'edit' && ingredient) {
      setIngredientForm({ id: ingredient._id, name: ingredient.name, description: ingredient.description || '' });
    }
  };
  
  const handleCloseModals = () => {
    setModalState({ mode: null, selectedIngredient: null });
    setIngredientForm({ id: '', name: '', description: '' });
    setPurchaseForm({ price: '', quantity: '', unit: 'kg' });
  };
  
  // --- API handlers ---
  const handleIngredientSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (modalState.mode === 'edit') {
        await api.updateIngredient(ingredientForm.id, { name: ingredientForm.name, description: ingredientForm.description });
      } else {
        await api.createIngredient({ name: ingredientForm.name, description: ingredientForm.description });
      }
      handleCloseModals();
      fetchIngredients(); 
    } catch (err) {
      setError("Failed to save ingredient.");
      console.error("Error saving ingredient:", err);
    }
  };

  const handleDeleteIngredient = async (ingredientId: string) => {
    if (window.confirm("Are you sure you want to delete this ingredient? This action cannot be undone.")) {
      try {
        await api.deleteIngredient(ingredientId);
        fetchIngredients();
      } catch (err) {
        alert("Failed to delete ingredient.");
        console.error("Error deleting ingredient:", err);
      }
    }
  };

  const handleLogPurchase = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!modalState.selectedIngredient || !purchaseForm.price || !purchaseForm.quantity) {
        setError("Please fill out all purchase fields.");
        return;
    }
      
    try {
      await api.logPurchase({
        ingredientId: modalState.selectedIngredient._id,
        price: parseFloat(purchaseForm.price),
        quantityPurchased: parseFloat(purchaseForm.quantity),
        purchaseUnit: purchaseForm.unit,
      });
      handleCloseModals();
      fetchIngredients();
    } catch (err) {
      setError("Failed to log purchase.");
      console.error("Error logging purchase:", err);
    }
  };

  // --- Render Logic ---
  if (isLoading) return <div className="loading-spinner">Counting eggs...</div>;
  
  return (
    <div className="page-container ingredients-page-container">
      <header className="page-header">
        <h1>My Ingredients</h1>
        <button className="action-button" onClick={() => handleOpenModal('create')}>
          <FaPlus /> Add Ingredient
        </button>
      </header>

      {error && !modalState.mode && <div className="error-message page-error">{error}</div>}

      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Ingredient Name</th>
              <th>Latest Price per Gram</th>
              <th>Last Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing) => (
              <tr key={ing._id}>
                <td>{ing.name}</td>
                <td>${ing.latestPricePerGram > 1 ? ing.latestPricePerGram.toFixed(2) 
                      : ing.latestPricePerGram < 1 && ing.latestPricePerGram > 0 ? ing.latestPricePerGram.toFixed(6) 
                      :'N/A'}</td>
                <td>{ing.lastUpdated ? new Date(ing.lastUpdated).toLocaleDateString() : 'N/A'}</td>
                <td className="action-cell">
                  <button className="icon-button" onClick={() => handleOpenModal('purchase', ing)} title="Log New Purchase">
                    <FaWarehouse />
                  </button>
                  <button className="icon-button" onClick={() => handleOpenModal('edit', ing)} title="Edit Ingredient">
                    <FaEdit />
                  </button>
                  <button className="icon-button delete" onClick={() => handleDeleteIngredient(ing._id)} title="Delete Ingredient">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Create/Edit Ingredient Modal --- */}
      {(modalState.mode === 'create' || modalState.mode === 'edit') && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={handleCloseModals}><FaTimes /></button>
            <h2>{modalState.mode === 'edit' ? 'Edit Ingredient' : 'Add New Ingredient'}</h2>
            <form onSubmit={handleIngredientSubmit}>
              {error && <div className="error-message form-feedback">{error}</div>}
              <div className="form-group">
                <label htmlFor="name">Ingredient Name</label>
                <input id="name" className="form-input" type="text" value={ingredientForm.name} onChange={(e) => setIngredientForm({...ingredientForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea id="description" className="form-textarea" value={ingredientForm.description} onChange={(e) => setIngredientForm({...ingredientForm, description: e.target.value})} />
              </div>
              <button type="submit" className="submit-button"><FaSave /> Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* --- Log Purchase Modal --- */}
      {modalState.mode === 'purchase' && modalState.selectedIngredient && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <button className="modal-close-button" onClick={handleCloseModals}><FaTimes /></button>
                  <h2>Log Purchase for {modalState.selectedIngredient.name}</h2>
                   <form onSubmit={handleLogPurchase}>
                       {error && <div className="error-message form-feedback">{error}</div>}
                       <div className="form-group">
                           <label htmlFor="price">Total Price Paid</label>
                           <div className="input-with-icon">
                               <FaDollarSign className="input-icon" />
                               <input id="price" type="number" step="0.01" className="form-input" placeholder="e.g., 10.50" value={purchaseForm.price} onChange={e => setPurchaseForm({...purchaseForm, price: e.target.value})} required />
                           </div>
                       </div>
                       <div className="form-group">
                           <label htmlFor="quantity">Quantity Purchased</label>
                           <input id="quantity" type="number" step="0.01" className="form-input" placeholder="e.g., 5" value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, quantity: e.target.value})} required />
                       </div>
                       <div className="form-group">
                           <label htmlFor="unit">Purchase Unit</label>
                           <select id="unit" className="form-select" value={purchaseForm.unit} onChange={e => setPurchaseForm({...purchaseForm, unit: e.target.value})}>
                               <option value="kg">Kilogram (kg)</option>
                               <option value="g">Gram (g)</option>
                               <option value="lb">Pound (lb)</option>
                               <option value="oz">Ounce (oz)</option>
                           </select>
                       </div>
                       <button type="submit" className="submit-button">Save Purchase</button>
                   </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default IngredientsPage;