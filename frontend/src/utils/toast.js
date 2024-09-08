// src/utils/toast.js
import toast from 'react-hot-toast';

const toastStyles = {
  style: {
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    border: '1px solid hsl(var(--border))',
    padding: '8px',
    borderRadius: 'var(--radius)',
  },
  success: {
    icon: '✅',
    style: {
      background: 'hsl(var(--background))',
      border: '1px solid hsl(var(--primary))',
    },
  },
  error: {
    icon: '❌',
    style: {
      background: 'hsl(var(--background))',
      border: '1px solid hsl(var(--destructive))',
    },
  },
  loading: {
    icon: '⏳',
  },
};

export const showSuccessToast = (message) => {
  toast.success(message, toastStyles.success);
};

export const showErrorToast = (message) => {
  toast.error(message, toastStyles.error);
};

export const showInfoToast = (message) => {
  toast(message, toastStyles);
};

export const showConfirmToast = (message, onConfirm, onCancel) => {
  toast(
    (t) => (
      <div>
        <p>{message}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => {
              onConfirm();
              toast.dismiss(t.id);
            }}
          >
            Confirm
          </button>
          <button
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            onClick={() => {
              if (onCancel) onCancel();
              toast.dismiss(t.id);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      ...toastStyles,
      duration: Infinity,
    }
  );
};