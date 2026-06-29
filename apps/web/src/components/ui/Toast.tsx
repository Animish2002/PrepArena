import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconX } from '@tabler/icons-react'
import { useFeedStore, type Toast } from '../../store/feedStore'

const TYPE_STYLES: Record<Toast['type'], string> = {
  success:
    'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/30 text-emerald-800 dark:text-emerald-300',
  info: 'bg-blue-50 dark:bg-blue-950/60 border-blue-500/30 text-blue-800 dark:text-blue-300',
  battle:
    'bg-violet-50 dark:bg-violet-950/60 border-violet-500/30 text-violet-800 dark:text-violet-300',
  friend_request:
    'bg-(--color-surface) border-(--color-border) text-(--color-text-primary)',
}

const ACTION_STYLES: Record<'primary' | 'danger', string> = {
  primary: 'bg-(--color-accent)/10 text-(--color-accent) hover:bg-(--color-accent)/20',
  danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useFeedStore((s) => s.removeToast)

  useEffect(() => {
    if (toast.persistent) return
    const id = setTimeout(() => removeToast(toast.id), 4000)
    return () => clearTimeout(id)
  }, [toast.id, toast.persistent, removeToast])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex flex-col gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium max-w-xs w-full pointer-events-auto ${TYPE_STYLES[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        <p className="flex-1 leading-snug">{toast.message}</p>
        <button
          onClick={() => removeToast(toast.id)}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
          aria-label="Dismiss"
        >
          <IconX size={14} />
        </button>
      </div>

      {toast.actions && toast.actions.length > 0 && (
        <div className="flex gap-2">
          {toast.actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                action.onClick()
                removeToast(toast.id)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${ACTION_STYLES[action.variant]}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function ToastStack() {
  const toasts = useFeedStore((s) => s.toasts)

  return (
    <div className="fixed top-4 right-4 z-200 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
