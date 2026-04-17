import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrdersManager({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    loadOrders();
  }, [token]);

  const loadOrders = async () => {
    try {
      const response = await axios.get('/api/admin/digital-orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Digital orders error:', err.response?.status, err.message);
      setMessage(`Failed to load digital orders: ${err.response?.status || 'Unknown error'}`);
    }
  };

  const updateStatus = async (orderId, status) => {
    if (!window.confirm(`Set order status to ${status}?`)) return;

    setLoading(true);
    try {
      await axios.put(`/api/admin/digital-orders/${orderId}/status`, { status });
      setMessage('Order status updated successfully');
      loadOrders();
    } catch (err) {
      setMessage('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    pendingPayments: orders.filter(o => o.status === 'pending').length,
    paidPayments: orders.filter(o => o.status === 'paid').length
  };



  return (
    <div className="main-content">
      <div className="page-header mb-5">
        <h1 className="mb-1">
          <i className="bi bi-receipt-cutoff text-warning me-3"></i>
          Orders & Payments
        </h1>
        <p className="text-muted mb-0">Manage customer orders and payment status</p>
      </div>
      
      {message && <div className={`alert alert-${message.includes('failed') ? 'danger' : 'success'} alert-dismissible fade show mb-4`} role="alert">
        <i className={`bi bi-${message.includes('failed') ? 'x-circle-fill' : 'check-circle-fill'} me-2`}></i>
        {message} <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
      </div>}
      
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Digital Exam Orders ({orders.length})
          </h5>
          <div>
            <span className="badge bg-warning fs-6 me-2">{stats.pendingPayments} Pending</span>
            <span className="badge bg-success fs-6">{stats.paidPayments} Paid</span>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Exams</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id || order.order_id} className="align-middle">
                  <td>
                    <strong>#{order.id ? order.id.slice(-8).toUpperCase() : 'N/A'}</strong>
                  </td>
                  <td>
                    <strong>{order.user_phone}</strong>
                  </td>
                <td>
                  <div className="small">
                    <span className="badge bg-primary mb-1 d-block">
                      {order.exam_title ? order.exam_title : 'N/A'}
                    </span>
                    {order.exam_id && (
                      <small className="text-muted">Exam ID: {order.exam_id}</small>
                    )}
                    {/* download_count not in API response yet 
                      {order.download_count !== null && (
                        <div className="badge bg-info mt-1">
                          Downloads: {order.download_count || 0}
                        </div>
                      )} */}

                  </div>
                </td>
                  <td>
                    <strong className="text-success">KSh {parseFloat(order.total_amount || 0).toLocaleString()}</strong>
                  </td>
                  <td>
                    <span className={`badge fs-6 px-3 py-2 fw-semibold lh-1 ${order.status === 'paid' ? 'bg-success' : order.status === 'pending' ? 'bg-warning text-dark' : order.status === 'failed' ? 'bg-danger' : 'bg-secondary'}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {order.mpesa_receipt_number ? (
                      <small className="text-success fw-semibold d-block">
                        M-Pesa: {order.mpesa_receipt_number}
                      </small>
                    ) : order.external_reference ? (
                      <small className="text-muted">Ref: {order.external_reference ? order.external_reference.slice(-8) : 'N/A'}</small>
                    ) : (
                      <span className="badge bg-light text-dark">Pending</span>
                    )}
                    {order.download_token && (
                      <small className="text-info d-block">
                        <i className="bi bi-download"></i> Token ready
                      </small>
                    )}
                  </td>
                  <td>
                    <small>{new Date(order.timestamp).toLocaleDateString('en-GB')}</small>
                    <br />
                    <small className="text-muted">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
{order.status === 'pending' && (
                        <button className="btn btn-sm btn-success" title="Mark as Paid" onClick={() => updateStatus(order.id, 'paid')} disabled={loading}>
                          <i className="bi bi-check-lg"></i>
                        </button>
                      )}

{order.status === 'paid' && (
                        <button className="btn btn-sm btn-warning" title="Process Refund" onClick={() => updateStatus(order.id, 'refunded')} disabled={loading}>
                          <i className="bi bi-arrow-counterclockwise"></i>
                        </button>
                      )}

                      {order.status === 'refunded' && (
                        <button className="btn btn-sm btn-outline-secondary" title="View Details" disabled>
                          <i className="bi bi-eye"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-receipt display-1 text-muted mb-4"></i>
            <h5 className="text-muted mb-3">No orders yet</h5>
            <p className="text-muted mb-4">Test the mobile app to generate orders for management.</p>
            <button type="button" className="btn btn-outline-primary">
              <i className="bi bi-phone me-2"></i>Test Mobile App
            </button>
          </div>
        )}
      </div>
      <div className="card-footer py-3 bg-light">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          Orders sync in real-time from mobile payments. Use Mark Paid for M-Pesa confirmations.
        </small>
      </div>
    </div>
  );
}

export default OrdersManager;
