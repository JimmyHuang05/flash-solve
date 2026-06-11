import BaseModal from './BaseModal'

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = '确认', cancelText = '取消', variant = 'danger' }) {
  if (!open) return null
  return (
    <BaseModal size="sm" onClose={onClose}>
      <div className="p-6 text-center">
        <p className="text-sm font-semibold text-stone-700 mb-2">{title}</p>
        <p className="text-xs text-stone-400 mb-5">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-500 bg-stone-100 rounded-xl hover:bg-stone-200 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all ${
              variant === 'danger'
                ? 'bg-red-400 hover:bg-red-500'
                : 'bg-gradient-to-r from-warm-coral to-warm-coralHover'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

export function NoticeDialog({ open, onClose, icon, title, message, buttonText = '知道了' }) {
  if (!open) return null
  return (
    <BaseModal size="sm" onClose={onClose}>
      <div className="p-8 text-center">
        {icon && <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">{icon}</div>}
        <h3 className="text-lg font-bold text-stone-700 mb-2">{title}</h3>
        <p className="text-sm text-stone-400 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-gradient-to-r from-warm-coral to-warm-coralHover text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          {buttonText}
        </button>
      </div>
    </BaseModal>
  )
}
