import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SubjectsManager({ token }) {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    loadSubjects();
  }, [token]);

  const loadSubjects = async () => {
    try {
      const response = await axios.get('/api/admin/subjects');
      setSubjects(response.data);
    } catch (err) {
      setMessage('Failed to load subjects');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
await axios.put(`/api/admin/subjects/${editingId}`, formData);
        setMessage('Subject updated');
      } else {
await axios.post('/api/admin/subjects', formData);
        setMessage('Subject created');
      }
      loadSubjects();
      setFormData({ name: '', code: '', description: '', status: 'active' });
      setEditingId(null);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error saving subject');
    }
    setLoading(false);
  };

  const editSubject = (subject) => {
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      status: subject.status
    });
    setEditingId(subject.id);
  };

  const deleteSubject = async (id) => {
    if (window.confirm('Delete subject? This may affect exams.')) {
      try {
await axios.delete(`/api/admin/subjects/${id}`);
        loadSubjects();
        setMessage('Subject deleted');
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
                {editingId ? 'Edit Subject' : 'Add New Subject'}
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
                  <label className="form-label fw-semibold">Subject Name <span className="text-danger">*</span></label>
                  <input className="form-control" name="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Mathematics" />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Subject Code</label>
                  <input className="form-control" name="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="e.g. MATH" />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Optional description..." />
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
                      {editingId ? 'Update Subject' : 'Create Subject'}
                    </>}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={() => {
                      setEditingId(null);
                      setFormData({ name: '', code: '', description: '', status: 'active' });
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
                Subjects List ({subjects.length})
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="table-responsive" style={{height: 'calc(100% - 60px)', overflow: 'auto'}}>
                <table className="table table-sm table-striped table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          <i className="bi bi-book display-4 opacity-25 mb-3 d-block"></i>
                          <p>No subjects yet. Create your first subject!</p>
                        </td>
                      </tr>
                    ) : (
                      subjects.map(subject => (
                        <tr key={subject.id}>
                          <td><strong>{subject.name}</strong></td>
                          <td>{subject.code}</td>
                          <td>
                            <span className={`badge bg-${subject.status === 'active' ? 'success' : 'secondary'}`}>
                              {subject.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editSubject(subject)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteSubject(subject.id)}>
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

export default SubjectsManager;

