import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { GiCook, GiThreeLeaves, GiSettingsKnobs } from 'react-icons/gi'; // Example icons
import { FaShoppingBasket } from 'react-icons/fa';

import RecipesPage from './pages/RecipePage';
import IngredientsPage from './pages/IngredientsPage';
import SettingsPage from './pages/SettingsPage';
import RecipeDetailPage from './pages/RecipeDetailsPage';
import PurchasesPage from './pages/PurchasesPage';
import './App.css';
import './styles/forms.css'

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar Navigation */}
        <nav className="sidebar">
          <div className="sidebar-header">
            <h3>Recipe Logger</h3>
          </div>
          <ul className="sidebar-nav-list">
            <li>
              <NavLink to="/" end>
                <GiCook className="nav-icon" />
                <span>Recipes</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/ingredients">
                <GiThreeLeaves className="nav-icon" />
                <span>Ingredients</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/purchases">
                <FaShoppingBasket className="nav-icon" />
                <span>Purchases</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings">
                <GiSettingsKnobs className="nav-icon" />
                <span>Settings</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<RecipesPage />} />
            <Route path="/ingredients" element={<IngredientsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;