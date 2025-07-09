import React, { useState, useEffect} from 'react';
import type { FormEvent } from 'react'
import * as api from '../api/apiService';
import './SettingsPage.css'; // New CSS file
import { FaSave, FaPlus, FaTrash } from 'react-icons/fa';

// Use a more convenient array format for state management in the UI
type ConversionRule = {
  unit: string;
  grams: number;
};

const SettingsPage: React.FC = () => {
  const [conversions, setConversions] = useState<ConversionRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await api.getSettings();
        const settingsMap = response.data.customToGramConversions;
        
        // Convert the map from the API into an array 
        const settingsArray = Object.entries(settingsMap).map(([unit, grams]) => ({
          unit,
          grams,
        }));
        
        setConversions(settingsArray);
        setError(null);
      } catch (err) {
        setError("Failed to load settings.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleRuleChange = (index: number, field: 'unit' | 'grams', value: string) => {
    const updatedConversions = [...conversions];
    if (field === 'grams') {
      updatedConversions[index][field] = parseFloat(value) || 0;
    } else {
      updatedConversions[index][field] = value;
    }
    setConversions(updatedConversions);
  };

  const addConversionRule = () => {
    setConversions([...conversions, { unit: '', grams: 0 }]);
  };

  const removeConversionRule = (index: number) => {
    setConversions(conversions.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Convert the array of rules back into a map object for the API
    const conversionsMap: { [key: string]: number } = conversions.reduce((acc, rule) => {
      if (rule.unit.trim()) { // Only include rules with a unit name
        acc[rule.unit.trim().toLowerCase()] = rule.grams;
      }
      return acc;
    }, {} as { [key: string]: number });

    try {
      await api.updateSettings({ customToGramConversions: conversionsMap });
      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
      console.error(err);
    }
  };

  if (isLoading) return <div className="loading-spinner">Loading Settings...</div>;

  return (
    <div className="page-container settings-page-container">
      <header className="page-header">
        <h1>Global Conversion Settings</h1>
      </header>

      <p className="settings-description">
        Define custom conversions from common units (like cups, tablespoons) to grams. These rules will be used across all recipes to ensure accurate cost calculations.
      </p>

      <form className="settings-form" onSubmit={handleSaveChanges}>
        <div className="settings-table-header">
          <span>Unit Name (e.g., cup, tbsp)</span>
          <span>Equivalent in Grams (g)</span>
          <span>Action</span>
        </div>
        <div className="settings-rules-list">
          {conversions.map((rule, index) => (
            <div key={index} className="settings-rule-row">
              <input
                type="text"
                className="form-input" 
                placeholder="e.g., cup"
                value={rule.unit}
                onChange={(e) => handleRuleChange(index, 'unit', e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                className="form-input" 
                placeholder="e.g., 240"
                value={rule.grams}
                onChange={(e) => handleRuleChange(index, 'grams', e.target.value)}
                required
              />
              <button type="button" className="delete-rule-btn" onClick={() => removeConversionRule(index)}>
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" className="add-rule-btn" onClick={addConversionRule}>
            <FaPlus /> Add New Rule
          </button>
          <button type="submit" className="save-settings-btn">
            <FaSave /> Save Changes
          </button>
        </div>
        
        {error && <div className="error-message form-feedback">{error}</div>}
        {successMessage && <div className="success-message form-feedback">{successMessage}</div>}
      </form>
    </div>
  );
};

export default SettingsPage;