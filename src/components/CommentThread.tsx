import { useState } from 'react'
import type { SubscriptionComment } from '../types'

const timestampFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

interface CommentThreadProps {
  comments: SubscriptionComment[]
  onAdd: (body: string) => Promise<void>
  onUpdate: (id: string, body: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function CommentThread({ comments, onAdd, onUpdate, onDelete }: CommentThreadProps) {
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAdd = async () => {
    if (!draft.trim()) return
    setSubmitting(true)
    try {
      await onAdd(draft.trim())
      setDraft('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <details className="mt-3 border-t border-slate-100 pt-3">
      <summary className="cursor-pointer text-xs font-medium text-slate-500">
        Comments {comments.length > 0 && `(${comments.length})`}
      </summary>

      <div className="mt-3 space-y-3">
        {comments.map((comment) => (
          <CommentRow key={comment.id} comment={comment} onUpdate={onUpdate} onDelete={onDelete} />
        ))}

        <div className="flex gap-2">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={submitting || !draft.trim()}
            className="self-end rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </details>
  )
}

function CommentRow({
  comment,
  onUpdate,
  onDelete,
}: {
  comment: SubscriptionComment
  onUpdate: (id: string, body: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(comment.body)

  const handleSave = async () => {
    if (!draft.trim()) return
    await onUpdate(comment.id, draft.trim())
    setEditing(false)
  }

  return (
    <div className="rounded-lg bg-slate-50 p-2 text-xs">
      <div className="flex items-center justify-between text-slate-400">
        <span>{comment.author_email ?? 'Unknown'}</span>
        <span>{timestampFormat.format(new Date(comment.updated_at))}</span>
      </div>

      {editing ? (
        <div className="mt-1 flex gap-2">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs focus:border-slate-500 focus:outline-none"
          />
          <div className="flex flex-col gap-1">
            <button type="button" onClick={handleSave} className="text-slate-700 underline">
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(comment.body)
                setEditing(false)
              }}
              className="text-slate-400 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-1 whitespace-pre-wrap text-slate-700">{comment.body}</p>
          <div className="mt-1 flex gap-3 text-slate-400">
            <button type="button" onClick={() => setEditing(true)} className="hover:text-slate-700">
              Edit
            </button>
            <button type="button" onClick={() => onDelete(comment.id)} className="hover:text-red-600">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
