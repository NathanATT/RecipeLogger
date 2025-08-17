import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import * as api from '../api/apiService';
import * as validationService from '../services/validationService';
import type { Ingredient } from '../types';
import { FaTimes, FaDollarSign, FaSave } from 'react-icons/fa';
// import './LogPurchaseModal.css'; 


interface LogPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // A callback to tell the parent to refetch data
  allIngredients: Ingredient[]; // List of ingredients for the dropdown
  initialIngredientId?: string; // Optional: pre-select an ingredient
}

const LogPurchaseModal: React.FC<LogPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  allIngredients,
  initialIngredientId = '',
}) => {
  const [purchaseForm, setPurchaseForm] = useState({
    ingredientId: initialIngredientId,
    price: '',
    quantity: '',
    unit: 'kg'
  });
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // This effect runs when the modal opens or the pre-selected ingredient changes.
  useEffect(() => {
    if (isOpen) {
      // Fetch the list of valid units when the modal becomes visible
      validationService.getValidUnits().then(unitsSet => {
        setAvailableUnits(Array.from(unitsSet).sort());
      });
      // Reset the form, pre-populating with the initial ID if provided
      setPurchaseForm({
        ingredientId: initialIngredientId,
        price: '',
        quantity: '',
        unit: 'kg'
      });
      setError(null); // Clear any previous errors
    }
  }, [isOpen, initialIngredientId]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPurchaseForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!purchaseForm.ingredientId || !purchaseForm.price || !purchaseForm.quantity) {
      setError("Please fill out all fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.logPurchase({
        ingredientId: purchaseForm.ingredientId,
        price: parseFloat(purchaseForm.price),
        quantityPurchased: parseFloat(purchaseForm.quantity),
        purchaseUnit: purchaseForm.unit,
      });
      onSuccess(); 
      onClose();   
    } catch (err) {
      setError("Failed to log purchase.");
      console.error("Error logging purchase:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null; 
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}><FaTimes /></button>
        <h2>Log New Purchase</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message form-feedback">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="ingredientId">Ingredient</label>
            <select
              id="ingredientId"
              name="ingredientId"
              className="form-select"
              value={purchaseForm.ingredientId}
              onChange={handleFormChange}
              required
              // The dropdown is disabled if an ingredient was pre-selected from the Ingredients page.
              disabled={!!initialIngredientId} 
            >
              <option value="" disabled>Select an ingredient...</option>
              {allIngredients.map(ing => (
                <option key={ing._id} value={ing._id}>{ing.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Total Price Paid</label>
            <div className="input-with-icon">
              <FaDollarSign className="input-icon" />
              <input id="price" name="price" type="number" step="0.01" className="form-input" placeholder="e.g., 10.50" value={purchaseForm.price} onChange={handleFormChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity Purchased</label>
            <input id="quantity" name="quantity" type="number" step="0.01" className="form-input" placeholder="e.g., 5" value={purchaseForm.quantity} onChange={handleFormChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Purchase Unit</label>
            <select id="unit" name="unit" className="form-select" value={purchaseForm.unit} onChange={handleFormChange}>
              {availableUnits.map(unitOption => (
                <option key={unitOption} value={unitOption}>{unitOption}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : <><FaSave /> Save Purchase</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogPurchaseModal;