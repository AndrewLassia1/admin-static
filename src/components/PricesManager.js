import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PricesManager({ token }) {
  const [prices, setPrices] = useState([]);
  const [grades, setGrades] = useState([]);
  const [formData, setFormData] = useState({
    grade_id: '',
    price_per_learner: '',
    status: 'active'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const [pricesRes, gradesRes] = await Promise.all([
        axios.get('/api/admin/prices'),
        axios.get('/api/admin/grades')
      ]);
      setPrices(pricesRes.data);
      setGrades(gradesRes.data);
    } catch (err) {
      setMessage('Failed to load data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
await axios.put(`/api/admin/prices/${editingId}`, formData);
        setMessage('Price updated');
      } else {
await axios.post('/api/admin/prices', formData);
        setMessage('Price created');
      }
      loadData();
      setFormData({ grade_id: '', price_per_learner: '', status: 'active' });
      setEditingId(null);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error saving price');
    }
    setLoading(false);
  };

  const editPrice = (price) => {
    setFormData({
      grade_id: price.grade_id,
      price_per_learner: price.price_per_learner,
      status: price.status
    });
    setEditingId(price.id);
  };

  const deletePrice = async (id) => {
    if (window.confirm('Delete price?')) {
      try {
await axios.delete(`/api/admin/prices/${id}`);
        loadData();
        setMessage('Price deleted');
      } catch (err) {
        setMessage('Delete failed');
      }
    }
  };

  const getGradeName = (grade_id) => {
    const grade = grades.find(g => g.id == grade_id);
    return grade ? grade.name : 'Unknown';
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-gradient-primary">
              <h5 className="card-title mb-0 text-white">
                <i className="bi bi-plus-circle me-2"></i>
                {editingId ? 'Edit Price' : 'Add New Price'}
              </h5>
            </div>
            <div className="card-body p-4">
              {message && <div className={`alert alert-${message.includes('Error') || message.includes('failed') ? 'danger' : 'success'} alert-dismissible fade show mb-4`} role="alert">
                <i className={`bi bi-${message.includes('Error') || message.includes('failed') ? 'x-circle-fill' : 'check-circle-fill'} me-2`}></i>
                {message} 
                <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
              </div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Grade <span className="text-danger">*</span></label>
                  <select className="form-select" name="grade_id" value={formData.grade_id} onChange={(e) => setFormData({...formData, grade_id: e.target.value})} required>
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>{grade.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Price per Learner (KSh) <span className="text-danger">*</span></label>
                  <input type="number" step="0.01" className="form-control" name="price_per_learner" required value={formData.price_per_learner} onChange={(e) => setFormData({...formData, price_per_learner: e.target.value})} placeholder="50.00" />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Status</label>
                  <select className="form-select" name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className={`btn btn-lg py-3 ${loading ? 'btn-secondary' : 'btn-gradient-primary'}`} disabled={loading}>
                    {loading ? <>
                      <i className="bi bi-hourglass-split me-2 spinner-border spinner-border-sm"></i>
                      Saving...
                    </> : <>
                      <i className="bi bi-check-lg me-2"></i>
                      {editingId ? 'Update Price' : 'Create Price'}
                    </>}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={() => {
                      setEditingId(null);
                      setFormData({ grade_id: '', price_per_learner: '', status: 'active' });
                      setMessage('');
                    }}>
                      <i className="bi bi-x-lg me-2"></i>Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-gradient-success">
              <h5 className="card-title mb-0 text-white">
                <i className="bi bi-list-ul me-2"></i>
                Prices List ({prices.length})
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="table-responsive" style={{height: 'calc(100% - 60px)', overflow: 'auto'}}>
                <table className="table table-sm table-striped table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Grade</th>
                      <th>Price/Learner</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          <i className="bi bi-currency-exchange display-4 opacity-25 mb-3 d-block"></i>
                          <p>No prices set. Create prices for grades!</p>
                        </td>
                      </tr>
                    ) : (
                      prices.map(price => (
                        <tr key={price.id}>
                          <td><strong>{price.grade_name}</strong></td>
                          <td>KSh {price.price_per_learner.toLocaleString()}</td>
                          <td>
                            <span className={`badge bg-${price.status === 'active' ? 'success' : 'secondary'}`}>
                              {price.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editPrice(price)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deletePrice(price.id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricesManager;

