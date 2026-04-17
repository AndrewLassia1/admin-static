import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ExamsManager({ token }) {
  const [exams, setExams] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    grade_id: '',
    subject_id: '',
    term: '',
    price: '',
    description: '',
    exam_link: '',
    status: 'active'
  });

const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);

const terms = ['opener', 'mid', 'end', 'gold', 'silver', 'bronze'];


  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    loadExams();
    loadDropdowns();
  }, [token]);

const loadDropdowns = async () => {
    try {
      const [gradesRes, subjectsRes] = await Promise.all([
        axios.get('/api/admin/grades'),
        axios.get('/api/admin/subjects')
      ]);
      setGrades(gradesRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      console.error('Failed to load dropdowns');
    }
  };

  const loadExams = async () => {
    try {
      const response = await axios.get('/api/admin/exams');
      setExams(response.data);
    } catch (err) {
      setMessage('Failed to load exams');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData(e.target);
    try {
      if (editingId) {
        await axios.put(`/api/admin/exams/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage('Exam updated');
      } else {
        await axios.post('/api/admin/exams', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage('Exam created');
      }
      loadExams();
      setFormData({ title: '', grade_id: '', term: '', subject_id: '', price: '', description: '', exam_link: '', status: 'active' });
      setEditingId(null);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error');
    }
    setLoading(false);
  };

  const editExam = (exam) => {
      setFormData({
        title: exam.title,
        grade_id: exam.grade_id,
        term: exam.term || exam.type,
        subject_id: exam.subject_id,
        price: exam.price || exam.amount,
        description: exam.description || '',
        exam_link: exam.exam_link || '',
        status: exam.status
      });
    setEditingId(exam.id);
  };

  const deleteExam = async (id) => {
    if (window.confirm('Delete exam?')) {
      try {
        await axios.delete(`/api/admin/exams/${id}`);
        loadExams();
        setMessage('Exam deleted');
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
                {editingId ? 'Edit Exam' : 'Add New Exam'}
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
                  <label className="form-label fw-semibold">Exam Title <span className="text-danger">*</span></label>
                  <input className="form-control" name="title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Enter exam title" />
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Grade <span className="text-danger">*</span></label>
                    <select className="form-select" name="grade_id" value={formData.grade_id} onChange={(e) => setFormData({...formData, grade_id: e.target.value})}>
                      <option value="">Select Grade</option>
                      {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Term <span className="text-danger">*</span></label>
                    <select className="form-select" name="term" value={formData.term} onChange={(e) => setFormData({...formData, term: e.target.value})}>
                      <option value="">Select Term</option>
                      {terms.map(t => <option key={t} value={t}>{t.replace(/^\w/, c => c.toUpperCase())}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Subject <span className="text-danger">*</span></label>
                  <select className="form-select" name="subject_id" value={formData.subject_id} onChange={(e) => setFormData({...formData, subject_id: e.target.value})}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Price (KSh) <span className="text-danger">*</span></label>
                    <input type="number" className="form-control" name="price" step="0.01" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="150.00" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Status</label>
                    <select className="form-select" name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief description of the exam..." />
                </div>
                  <div className="mb-4">
  <label className="form-label fw-semibold">Exam File (PDF) <span className="text-danger">*</span></label>
                  <input type="file" className="form-control" name="file" accept=".pdf" required />
                  <div className="form-text">Upload PDF exam paper. Max 10MB.</div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Preview File <span className="text-muted fs-6">(Optional)</span></label>
                  <input type="file" className="form-control" name="preview_file" accept="image/*,.pdf" />
                  <div className="form-text">Upload preview image or PDF. Max 5MB.</div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Exam Link <span className="text-muted fs-6">(Optional)</span></label>
                  <input type="url" className="form-control" name="exam_link" value={formData.exam_link} onChange={(e) => setFormData({...formData, exam_link: e.target.value})} placeholder="https://example.com/direct-exam-link" />
                  <div className="form-text">Direct link to exam file.</div>
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className={`btn btn-lg py-3 ${loading ? 'btn-secondary' : 'btn-gradient-primary'}`} disabled={loading}>
                    {loading ? <>
                      <i className="bi bi-hourglass-split me-2 spinner-border spinner-border-sm"></i>
                      Saving...
                    </> : <>
                      <i className="bi bi-check-lg me-2"></i>
                      {editingId ? 'Update Exam' : 'Create Exam'}
                    </>}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={() => {
                      setEditingId(null);
                      setFormData({title:'',grade_id:'',term:'',subject_id:'',price:'',description:'',exam_link:'',status:'active'});
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
                Exams List ({exams.length})
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="table-responsive" style={{height: 'calc(100% - 60px)', overflow: 'auto'}}>
                <table className="table table-sm table-striped table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Grade</th>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          <i className="bi bi-inbox display-4 opacity-25 mb-3 d-block"></i>
                          <p>No exams yet. Create your first exam!</p>
                        </td>
                      </tr>
                    ) : (
                      exams.map(exam => (
                        <tr key={exam.id}>
                          <td>{exam.title}</td>
                          <td>{exam.grade_name || 'N/A'}</td>
                          <td>{exam.display_term || exam.term || 'N/A'}</td>
                          <td>{exam.subject_name || 'N/A'}</td>
                          <td>KSh {exam.price || exam.amount}</td>

                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editExam(exam)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteExam(exam.id)}>
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

export default ExamsManager;
