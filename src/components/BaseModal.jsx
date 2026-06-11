import { XIcon } from './Icons'

export default function BaseModal({ children, onClose, size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'max-w-[min(90vw,400px)]',
    md: 'max-w-[min(90vw,560px)]',
    lg: 'max-w-[min(90vw,720px)]',
  }

  const heightClass = size === 'sm' ? '' : 'max-h-[min(85vh,640px)] overflow-y-auto no-scrollbar'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-white/95 backdrop-blur-2xl rounded-3xl shadow-glass-lg border border-white/80 w-full mx-4 relative animate-[fadeInUp_0.3s_ease-out_forwards] ${sizeMap[size]} ${heightClass} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-all z-10"
        >
          <XIcon />
        </button>
        {children}
      </div>
    </div>
  )
}
