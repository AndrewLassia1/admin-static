import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PaymentsManager({ token }) {
  const [payments, setPayments] = useState([]);
  const [printedPayments, setPrintedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('digital');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    loadPayments();
  }, [token]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const [digitalRes, printedRes] = await Promise.all([
        axios.get('/api/admin/payments').catch(() => ({ data: [] })),
        axios.get('/api/admin/printed-exam-payments').catch(() => ({ data: [] }))
      ]);
      setPayments(digitalRes.data);
      setPrintedPayments(printedRes.data);
    } catch (err) {
      setMessage('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalDigital: payments.length,
    successfulDigital: payments.filter(p => p.status === 'completed' || p.status === 'PENDING').length, // adjust based on actual status
    totalPrinted: printedPayments.length,
    successfulPrinted: printedPayments.filter(p => p.status === 'completed').length
  };

  return (
    <div className="main-content">
      <div className="page-header mb-5">
        <h1 className="mb-1">
          <i className="bi bi-credit-card-2-front text-success me-3"></i>
          Payments Overview
        </h1>
        <p className="text-muted mb-0">Complete view of all digital and printed exam payments</p>
      </div>

      {message && (
        <div className={`alert alert-${message.includes('failed') ? 'danger' : 'success'} alert-dismissible fade show mb-4`} role="alert">
          <i className={`bi bi-${message.includes('failed') ? 'x-circle-fill' : 'check-circle-fill'} me-2`}></i>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card stat-card h-100 text-center">
            <div className="card-body">
              <i className="bi bi-download display-4 text-primary mb-3"></i>
              <div className="stat-number text-primary">{stats.totalDigital}</div>
              <h6 className="text-muted">Digital Payments</h6>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card h-100 text-center">
            <div className="card-body">
              <i className="bi bi-printer display-4 text-info mb-3"></i>
              <div className="stat-number text-info">{stats.totalPrinted}</div>
              <h6 className="text-muted">Printed Payments</h6>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'digital' ? 'active' : ''}`} 
                onClick={() => setActiveTab('digital')}
              >
                Digital Exam Payments ({payments.length})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'printed' ? 'active' : ''}`} 
                onClick={() => setActiveTab('printed')}
              >
                Printed Exam Payments ({printedPayments.length})
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-0">
          {activeTab === 'digital' && (
            <div className="table-responsive" style={{ maxHeight: '600px' }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Exam</th>
                      <th>Phone</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>M-Pesa Receipt</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment.id} className="align-middle">
                        <td><strong>#{payment.id}</strong></td>
                        <td>
                          {payment.exam_title || 'N/A'}
                        </td>
                        <td>{payment.phone_number}</td>
                        <td>
                          <strong className="text-success">KSh {parseFloat(payment.amount || 0).toLocaleString()}</strong>
                        </td>
                        <td>
                          <span className={`badge fs-6 px-3 py-2 fw-semibold lh-1 ${
                            payment.status === 'completed' ? 'bg-success' :
                            payment.status === 'PENDING' ? 'bg-warning text-dark' :
                            payment.status === 'failed' ? 'bg-danger' : 'bg-secondary'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td>{payment.mpesa_receipt_number || '-'}</td>
                        <td>
                          <small>{new Date(payment.created_at || payment.timestamp).toLocaleDateString('en-GB')}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'printed' && (
            <div className="table-responsive" style={{ maxHeight: '600px' }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Order Tracking</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Receipt</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printedPayments.map(payment => (
                      <tr key={payment.id} className="align-middle">
                        <td><strong>#{payment.id}</strong></td>
                        <td>
                          #{payment.order_tracking || payment.order_id || 'N/A'}
                        </td>
                        <td>
                          <strong className="text-success">KSh {parseFloat(payment.amount || 0).toLocaleString()}</strong>
                        </td>
                        <td>{payment.payment_method || 'mpesa'}</td>
                        <td>
                          <span className={`badge fs-6 px-3 py-2 fw-semibold lh-1 ${
                            payment.status === 'completed' ? 'bg-success' :
                            payment.status === 'pending' ? 'bg-warning text-dark' :
                            payment.status === 'failed' ? 'bg-danger' : 'bg-secondary'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td>{payment.mpesa_receipt || '-'}</td>
                        <td>
                          <small>{new Date(payment.created_at).toLocaleDateString('en-GB')}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentsManager;
