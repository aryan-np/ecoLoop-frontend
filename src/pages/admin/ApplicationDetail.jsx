import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminAPI from '../../api/admin';
import Toast from '../../components/Toast';
import { getErrorMessage } from '../../utils/errorHandler';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(null); // 'approve', 'reject', or null
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getRoleApplication(id);

      const appData = response?.Result || response?.result || response;

      if (response?.IsSuccess || appData?.id) {
        setApplication(appData);
        setAdminNotes(appData.admin_notes || '');
      } else {
        setToast({ 
          show: true, 
          message: getErrorMessage(response, 'Failed to load application'), 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading application:', error);
      setToast({ 
        show: true, 
        message: getErrorMessage(error, 'Failed to load application'), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action) => {
    if (!adminNotes.trim()) {
      setToast({
        show: true,
        message: 'Admin notes are required',
        type: 'error'
      });
      return;
    }

    try {
      setSubmittingAction(action);
      const response = await adminAPI.reviewRoleApplication(id, {
        action,
        status: action === 'approve' ? 'approved' : 'rejected',
        admin_notes: adminNotes
      });

      if (response?.IsSuccess || response?.Result || response?.result || response?.id) {
        setToast({
          show: true,
          message: `Application ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
          type: 'success'
        });

        setTimeout(() => {
          navigate('/admin/verifications');
        }, 1500);
      } else {
        setToast({
          show: true,
          message: getErrorMessage(response, `Failed to ${action} application`),
          type: 'error'
        });
      }
    } catch (error) {
      console.error(`Error ${action} application:`, error);
      setToast({
        show: true,
        message: getErrorMessage(error, `Failed to ${action} application`),
        type: 'error'
      });
    } finally {
      setSubmittingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading application...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Application not found</div>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: 'yellow', text: 'Pending Review' },
    approved: { color: 'green', text: 'Approved' },
    rejected: { color: 'red', text: 'Rejected' }
  };

  const currentStatus = statusConfig[application.status] || statusConfig.pending;

  return (
    <div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/verifications')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Applications
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {application.organization_name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                application.role_type === 'NGO'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {application.role_type}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${currentStatus.color}-100 text-${currentStatus.color}-800`}>
                {currentStatus.text}
              </span>
              <span>Submitted: {new Date(application.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Applicant Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
            <div className="text-gray-900">{application.applicant?.full_name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <div className="text-gray-900">{application.applicant?.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
            <div className="text-gray-900">{application.applicant?.phone_number}</div>
          </div>
        </div>
      </div>

      {/* Organization Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Organization Name</label>
            <div className="text-gray-900">{application.organization_name}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Registration Number</label>
            <div className="text-gray-900">{application.registration_number}</div>
          </div>

          {application.established_date && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Established Date</label>
              <div className="text-gray-900">{new Date(application.established_date).toLocaleDateString()}</div>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
            <div className="text-gray-900">{application.address}</div>
          </div>

          {application.description && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
              <div className="text-gray-900 whitespace-pre-wrap">{application.description}</div>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      {application.documents && application.documents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {application.documents.map((doc, index) => (
              <a
                key={doc.id}
                href={doc.document}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-400 hover:shadow-md transition"
              >
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">Document {index + 1}</p>
                  <p className="text-sm text-gray-500">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Admin Review Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Review</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Notes <span className="text-red-600">*</span>
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            placeholder="Enter notes about this application review..."
            disabled={submittingAction !== null}
          />
          <p className="text-sm text-gray-500 mt-1">
            Please provide detailed notes about your decision. This will be shared with the applicant.
          </p>
        </div>

        {application.status === 'pending' && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleReview('approve')}
              disabled={submittingAction !== null || !adminNotes.trim()}
              className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingAction === 'approve' ? 'Processing...' : 'Approve Application'}
            </button>
            <button
              onClick={() => handleReview('reject')}
              disabled={submittingAction !== null || !adminNotes.trim()}
              className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingAction === 'reject' ? 'Processing...' : 'Reject Application'}
            </button>
          </div>
        )}

        {application.status !== 'pending' && (
          <div className={`p-4 rounded-lg ${
            application.status === 'approved' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className="text-sm font-medium text-gray-900 mb-1">
              This application has been {application.status}.
            </p>
            {application.reviewed_at && (
              <p className="text-sm text-gray-600">
                Reviewed on: {new Date(application.reviewed_at).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetail;
