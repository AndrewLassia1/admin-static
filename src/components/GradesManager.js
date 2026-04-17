import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GradesManager({ token }) {
  const [grades, setGrades] = useState([]);
  const [levels, setLevels] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    level_id: '',
    description: '',
    sort_order: 0,
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
      const [gradesRes, levelsRes] = await Promise.all([
        axios.get('/api/admin/grades'),
        axios.get('/api/admin/levels')
      ]);
      setGrades(gradesRes.data);
      setLevels(levelsRes.data);
    } catch (err) {
      setMessage('Failed to load data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/admin/grades/${editingId}`, formData);
        setMessage('Grade updated');
      } else {
        await axios.post('/api/admin/grades', formData);
        setMessage('Grade created');
      }
      loadData();
      setFormData({ name: '', level_id: '', description: '', sort_order: 0, status: 'active' });
      setEditingId(null);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error saving grade');
    }
    setLoading(false);
  };

  const editGrade = (grade) => {
    setFormData({
      name: grade.name,
      level_id: grade.level_id,
      description: grade.description || '',
      sort_order: grade.sort_order || 0,
      status: grade.status
    });
    setEditingId(grade.id);
  };

  const deleteGrade = async (id) => {
    if (window.confirm('Delete grade? This may affect exams and prices.')) {
      try {
        await axios.delete(`/api/admin/grades/${id}`);
        loadData();
        setMessage('Grade deleted');
      } catch (err) {
        setMessage('Delete failed');
      }
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-gradient-primary">
              <h5 className="card-title mb-0 text-white">
                <i className="bi bi-plus-circle me-2"></i>
                {editingId ? 'Edit Grade' : 'Add New Grade'}
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
                  <label className="form-label fw-semibold">Grade Name <span className="text-danger">*</span></label>
                  <input className="form-control" name="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Grade 5" />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">School Level <span className="text-danger">*</span></label>
                  <select className="form-select" name="level_id" value={formData.level_id} onChange={(e) => setFormData({...formData, level_id: e.target.value})} required>
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>{level.name || 'N/A'}</option>
                    ))}
                  </select>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Sort Order</label>
                    <input type="number" className="form-control" name="sort_order" value={formData.sort_order} onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} placeholder="0" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Status</label>
                    <select className="form-select" name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Optional description..." />
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className={`btn btn-lg py-3 ${loading ? 'btn-secondary' : 'btn-gradient-primary'}`} disabled={loading}>
                    {loading ? <>
                      <i className="bi bi-hourglass-split me-2 spinner-border spinner-border-sm"></i>
                      Saving...
                    </> : <>
                      <i className="bi bi-check-lg me-2"></i>
                      {editingId ? 'Update Grade' : 'Create Grade'}
                    </>}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={() => {
                      setEditingId(null);
                      setFormData({ name: '', level_id: '', description: '', sort_order: 0, status: 'active' });
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
                Grades List ({grades.length})
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="table-responsive" style={{height: 'calc(100% - 60px)', overflow: 'auto'}}>
                <table className="table table-sm table-striped table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Level</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          <i className="bi bi-mortarboard display-4 opacity-25 mb-3 d-block"></i>
                          <p>No grades yet. Create your first grade!</p>
                        </td>
                      </tr>
                    ) : (
                      grades.map(grade => (
                        <tr key={grade.id}>
                          <td><strong>{grade.name}</strong></td>
                          <td>{grade.level_name || 'N/A'}</td>
                          <td>{grade.sort_order}</td>
                          <td>
                            <span className={`badge bg-${grade.status === 'active' ? 'success' : 'secondary'}`}>
                              {grade.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editGrade(grade)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteGrade(grade.id)}>
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

export default GradesManager;

