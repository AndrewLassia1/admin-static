import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PrintedExamOrdersManager({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    loadOrders();
  }, [token]);

  const loadOrders = async () => {
    try {
      const response = await axios.get('/api/admin/printed-exam-orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to load printed orders:', err);
      setMessage('Failed to load printed exam orders');
    }
  };

  const updateStatus = async (orderId, status, type = 'order') => {
    if (!window.confirm(`Set ${type} status to ${status}?`)) return;
    setLoading(true);
    try {
      const endpoint = type === 'payment' ? `/api/admin/printed-exam-payments/${orderId}/status` : `/api/admin/printed-exam-orders/${orderId}/status`;
      await axios.put(endpoint, { status });
      setMessage(`${type === 'payment' ? 'Payment' : 'Order'} ${status.toLowerCase()} updated`);
      loadOrders();
    } catch (err) {
      setMessage('Update failed');
    }
    setLoading(false);
  };

  // Parse order_items GROUP_CONCAT string to array of objects
  const parsedOrders = orders.map((order) => ({
    ...order,
    order_items: order.order_items 
      ? (() => {
          try {
            // Backend GROUP_CONCAT format: {\"grade_name\":\"Grade 1\",\"number_of_learners\":10},...
            let itemsStr = '[' + order.order_items + ']';
            // Fix last item (remove trailing , if present)
            if (itemsStr.endsWith(',]')) itemsStr = itemsStr.slice(0, -1) + ']';
            return JSON.parse(itemsStr);
          } catch (e) {
            console.warn('Parse error order_items:', order.order_items, e);
            return [];
          }
        })()
      : []
  }));

  const stats = {
    pendingOrders: parsedOrders.filter(o => o.status === 'pending').length,
    pendingPayments: parsedOrders.filter(o => o.payment_status === 'pending').length
  };

  return (
    <div className="main-content">
      <div className="page-header mb-5">
        <h1 className="mb-1">
          <i className="bi bi-printer text-info me-3"></i>
          Printed Exam Orders
        </h1>
        <p className="text-muted mb-0">Manage school printed exam requests and fulfillment</p>
      </div>
      
      {message && (
        <div className={`alert alert-${message.includes('failed') ? 'danger' : 'success'} alert-dismissible fade show mb-4`} role="alert">
          <i className={`bi bi-${message.includes('failed') ? 'x-circle-fill' : 'check-circle-fill'} me-2`}></i>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}
      
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Printed Orders ({orders.length})
          </h5>
          <div>
            <span className="badge bg-warning fs-6 me-2">{stats.pendingOrders} Pending</span>
            <span className="badge bg-info fs-6">{stats.pendingPayments} Pending Payments</span>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>School / Contact</th>
                <th>Items</th>
                <th>Learners</th>
                <th>Amount</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parsedOrders.map(order => (
                <tr key={order.id} className="align-middle">
                  <td>
                    <strong className="text-info">#{order.tracking_number}</strong>
                  </td>
                  <td>
                    <div>{order.school_name}</div>
                    <small className="text-muted">{order.contact_person} / {order.phone}</small>
                  </td>
                  <td>
                    {order.order_items && order.order_items.length > 0 ? (
                      <div className="small">
                        <span className="badge bg-secondary mb-1 d-block">{order.order_items.length} grades</span>
                        {order.order_items.slice(0, 2).map(item => (
                          <div key={item.grade_name} className="text-truncate">{item.grade_name}</div>
                        ))}
                        {order.order_items.length > 2 && <small className="text-muted">+{order.order_items.length - 2} more</small>}
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td>
                    <strong>{order.total_learners}</strong>
                  </td>
                  <td>
                    <strong className="text-success">KSh {parseFloat(order.total_amount || 0).toLocaleString()}</strong>
                  </td>
                  <td>
                    <span className={`badge fs-6 px-3 py-2 fw-semibold lh-1 ${
                      order.status === 'delivered' ? 'bg-success' :
                      order.status === 'printing' ? 'bg-info' :
                      order.status === 'pending' ? 'bg-warning text-dark' :
                      order.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge fs-6 px-3 py-2 fw-semibold lh-1 ${
                      order.payment_status === 'paid' ? 'bg-success' :
                      order.payment_status === 'pending' ? 'bg-warning text-dark' :
                      order.payment_status === 'failed' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {order.payment_status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <small>{new Date(order.created_at).toLocaleDateString('en-GB')}</small>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      {order.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-sm btn-success" 
                            title="Confirm Order" 
                            onClick={() => updateStatus(order.id, 'confirmed')}
                            disabled={loading}
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            title="Cancel" 
                            onClick={() => updateStatus(order.id, 'cancelled')}
                            disabled={loading}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </>
                      )}
                      {order.payment_status === 'pending' && (
                        <button 
                          className="btn btn-sm btn-success" 
                          title="Mark Payment Paid" 
                          onClick={() => updateStatus(order.id, 'paid', 'payment')}
                          disabled={loading}
                        >
                          <i className="bi bi-credit-card"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && !loading && (
          <div className="text-center py-5">
            <i className="bi bi-printer display-1 text-muted mb-4"></i>
            <h5 className="text-muted mb-3">No printed orders yet</h5>
            <p className="text-muted mb-4">Printed exam requests from schools will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrintedExamOrdersManager;
