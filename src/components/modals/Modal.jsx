function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[1px] p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-gray-100 my-auto max-h-[92vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default Modal
