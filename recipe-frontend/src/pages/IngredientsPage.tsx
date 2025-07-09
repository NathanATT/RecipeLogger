import React, { useState, useEffect,  } from 'react';
import type {FormEvent} from 'react';
import * as api from '../api/apiService';
import type { Ingredient } from '../types';
import './IngredientsPage.css'; 
import { FaPlus, FaTimes, FaWarehouse, FaDollarSign , FaSave} from 'react-icons/fa'; // Icons

const IngredientsPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for forms/modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState<boolean>(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  // State for "Create Ingredient" form
  const [newIngredientName, setNewIngredientName] = useState<string>('');
  
  // State for "Log Purchase" form
  const [purchaseForm, setPurchaseForm] = useState({ price: '', quantity: '', unit: 'kg' });

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

  const handleCreateIngredient = async (e: FormEvent) => {
    e.preventDefault();
    if (!newIngredientName.trim()) return;
    try {
      await api.createIngredient({ name: newIngredientName });
      setNewIngredientName('');
      setIsCreateModalOpen(false);
      fetchIngredients(); // Refresh the list
    } catch (err) {
      console.error("Error creating ingredient:", err);
    }
  };
  
  const handleOpenPurchaseModal = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsPurchaseModalOpen(true);
  };
  
  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsPurchaseModalOpen(false);
    setSelectedIngredient(null);
    setPurchaseForm({ price: '', quantity: '', unit: 'kg' });
  };

  const handleLogPurchase = async (e: FormEvent) => {
      e.preventDefault();
      if (!selectedIngredient || !purchaseForm.price || !purchaseForm.quantity) return;
      try {
          await api.logPurchase({
              ingredientId: selectedIngredient._id,
              price: parseFloat(purchaseForm.price),
              quantityPurchased: parseFloat(purchaseForm.quantity),
              purchaseUnit: purchaseForm.unit,
          });
          handleCloseModals();
          fetchIngredients();
      } catch (err) {
          console.error("Error logging purchase:", err);
      }
  };

  if (isLoading) return <div className="loading-spinner">Loading Ingredients...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container ingredients-page-container">
      <header className="page-header">
        <h1>My Ingredients</h1>
        <button className="action-button" onClick={() => setIsCreateModalOpen(true)}>
          <FaPlus /> Add Ingredient
        </button>
      </header>

      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Ingredient Name</th>
              <th>Latest Price per Gram</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing) => (
              <tr key={ing._id}>
                <td>{ing.name}</td>
                <td>${ing.latestPricePerGram.toFixed(6)}</td>
                <td>{ing.lastUpdated ? new Date(ing.lastUpdated).toLocaleDateString() : 'N/A'}</td>
                <td className="action-cell">
                  <button className="icon-button" onClick={() => handleOpenPurchaseModal(ing)} title="Log New Purchase">
                    <FaWarehouse />
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Create Ingredient Modal --- */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={handleCloseModals}><FaTimes /></button>
            <h2>Add New Ingredient</h2>
            <form onSubmit={handleCreateIngredient}>
              <div className="form-group">
                <label htmlFor="ingredientName">Ingredient Name</label>
                <input
                  id="ingredientName"
                  className="form-input"
                  type="text"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  placeholder="e.g., Baking Soda"
                  required
                />
              </div>
              <button type="submit" className="submit-button">
                <FaSave /> Save Ingredient
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- Log Purchase Modal --- */}
      {isPurchaseModalOpen && selectedIngredient && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <button className="modal-close-button" onClick={handleCloseModals}><FaTimes /></button>
                  <h2>Log Purchase for {selectedIngredient.name}</h2>
                   <form onSubmit={handleLogPurchase}>
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