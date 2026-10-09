import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDialog.css';

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = true,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrap">
          <AlertTriangle size={24} className="confirm-icon" />
        </div>

        <div className="confirm-content">
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-message">{message}</p>
        </div>

        <div className="confirm-actions">
          <button className="btn-outline" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`btn-primary ${isDanger ? 'btn-danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
