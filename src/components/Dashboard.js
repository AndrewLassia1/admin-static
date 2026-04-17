import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ token, logout }) {
  const location = useLocation();
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    loadStats();
  }, [token]);

  const loadStats = async () => {
    try {
      const [examsRes, ordersRes] = await Promise.all([
axios.get('/api/admin/exams').catch(() => ({ data: [] })),
axios.get('/api/admin/digital-orders').catch(() => ({ data: [] }))
      ]);
      const exams = examsRes.data;
      const orders = ordersRes.data;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      setStats({
        totalExams: exams.length,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0)
      });
    } catch (err) {
      console.error('Stats load error', err);
    }
  };

  const chartData = {
    labels: ['Exams', 'Orders', 'Pending'],
    datasets: [{
      label: 'Count',
      data: [stats.totalExams || 0, stats.totalOrders || 0, stats.pendingOrders || 0],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)'
      ],
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="d-flex min-vh-100">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="d-flex align-items-center">
            <i className="bi bi-shield-check display-4 text-primary me-3"></i>
            <div>
              <h4 className="mb-0">Vyntex Admin</h4>
              <small>Assessment Portal</small>
            </div>
          </div>
        </div>
        <nav className="nav flex-column px-3">
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <i className="bi bi-house-door me-2"></i>Dashboard
          </Link>
          <Link to="/exams" className={`nav-link ${location.pathname === '/exams' ? 'active' : ''}`}>
            <i className="bi bi-book-half me-2"></i>Exams & Resources
          </Link>
          <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>
            <i className="bi bi-receipt me-2"></i>Digital Orders
          </Link>
          <Link to="/printed-orders" className={`nav-link ${location.pathname === '/printed-orders' ? 'active' : ''}`}>
            <i className="bi bi-printer me-2"></i>Printed Exam Orders
          </Link>
          <Link to="/payments" className={`nav-link ${location.pathname === '/payments' ? 'active' : ''}`}>
            <i className="bi bi-credit-card-2-front me-2"></i>Payments
          </Link>
          <Link to="/subjects" className={`nav-link ${location.pathname === '/subjects' ? 'active' : ''}`}>
            <i className="bi bi-book me-2"></i>Manage Subjects
          </Link>
          <Link to="/grades" className={`nav-link ${location.pathname === '/grades' ? 'active' : ''}`}>
            <i className="bi bi-mortarboard me-2"></i>Manage Grades
          </Link>
          <Link to="/pricing" className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}>
            <i className="bi bi-currency-exchange me-2"></i>Manage Prices
          </Link>
          <hr className="text-white-50 my-3" />
          <button className="btn btn-outline-light w-100" onClick={logout}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </nav>
      </div>
      <div className="flex-grow-1 main-content">
        <div className="page-header mb-5">
          <h1 className="mb-1">
            <i className="bi bi-speedometer2 text-primary me-3"></i>
            Dashboard Overview
          </h1>
          <p className="text-muted mb-0">Welcome back! Here's what's happening with your assessments.</p>
        </div>
        
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card stat-card h-100 text-center">
              <div className="card-body">
                <i className="bi bi-book display-4 text-primary mb-3"></i>
                <div className="stat-number text-primary">{stats.totalExams || 0}</div>
                <h6 className="text-muted">Total Exams</h6>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card h-100 text-center">
              <div className="card-body">
                <i className="bi bi-receipt display-4 text-success mb-3"></i>
                <div className="stat-number text-success">{stats.totalOrders || 0}</div>
                <h6 className="text-muted">Total Orders</h6>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card h-100 text-center">
              <div className="card-body">
                <i className="bi bi-clock-history display-4 text-warning mb-3"></i>
                <div className="stat-number text-warning">{stats.pendingOrders || 0}</div>
                <h6 className="text-muted">Pending Orders</h6>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card h-100 text-center">
              <div className="card-body">
                <i className="bi bi-currency-dollar display-4 text-info mb-3"></i>
                <div className="stat-number text-info">KSh {stats.totalRevenue?.toLocaleString() || 0}</div>
                <h6 className="text-muted">Total Revenue</h6>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0"><i className="bi bi-bar-chart me-2"></i>Analytics Overview</h5>
              </div>
              <div className="card-body p-4">
                <div className="chart-container">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
