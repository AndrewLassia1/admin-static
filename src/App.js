import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import './login-styles.css';
import Dashboard from './components/Dashboard';
import ExamsManager from './components/ExamsManager';
import OrdersManager from './components/OrdersManager';
import SubjectsManager from './components/SubjectsManager';
import GradesManager from './components/GradesManager';
import PricesManager from './components/PricesManager';
import PrintedExamOrdersManager from './components/PrintedExamOrdersManager';
import PaymentsManager from './components/PaymentsManager';
import axios from 'axios';
import './index.css';

axios.defaults.baseURL = 'https://api.vyntexassessments.co.ke';

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border"></div></div>;

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={token ? <Dashboard token={token} logout={logout} /> : <Navigate to="/login" />} />
          <Route path="/exams" element={token ? <ExamsManager token={token} /> : <Navigate to="/login" />} />
          <Route path="/orders" element={token ? <OrdersManager token={token} /> : <Navigate to="/login" />} />
          <Route path="/subjects" element={token ? <SubjectsManager token={token} /> : <Navigate to="/login" />} />
          <Route path="/grades" element={token ? <GradesManager token={token} /> : <Navigate to="/login" />} />
          <Route path="/pricing" element={token ? <PricesManager token={token} /> : <Navigate to="/login" />} />
          <Route path="/printed-orders" element={token ? <PrintedExamOrdersManager token={token} /> : <Navigate to="/login" />} />
          <Route path="/payments" element={token ? <PaymentsManager token={token} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
