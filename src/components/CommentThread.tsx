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
  currentUserId: string | null
  onAdd: (body: string) => Promise<void>
  onUpdate: (id: string, body: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function CommentThread({ comments, currentUserId, onAdd, onUpdate, onDelete }: CommentThreadProps) {
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
    <details className="mt-3 border-t border-zinc-800 pt-2.5">
      <summary className="cursor-pointer text-xs font-medium text-zinc-500">
        Comments {comments.length > 0 && `(${comments.length})`}
      </summary>

      <div className="mt-2.5 space-y-2.5">
        {comments.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            canModify={comment.author_id === currentUserId}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}

        <div className="flex gap-2">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={submitting || !draft.trim()}
            className="self-end rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:from-red-500 hover:to-orange-400 disabled:opacity-50"
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
  canModify,
  onUpdate,
  onDelete,
}: {
  comment: SubscriptionComment
  canModify: boolean
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
    <div className="rounded-lg bg-zinc-950 p-2 text-xs">
      <div className="flex items-center justify-between text-zinc-500">
        <span>{comment.author_email ?? 'Unknown'}</span>
        <span>{timestampFormat.format(new Date(comment.updated_at))}</span>
      </div>

      {editing ? (
        <div className="mt-1 flex gap-2">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
          />
          <div className="flex flex-col gap-1">
            <button type="button" onClick={handleSave} className="text-zinc-300 underline">
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(comment.body)
                setEditing(false)
              }}
              className="text-zinc-500 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-1 whitespace-pre-wrap text-zinc-300">{comment.body}</p>
          {canModify && (
            <div className="mt-1 flex gap-3 text-zinc-500">
              <button type="button" onClick={() => setEditing(true)} className="hover:text-zinc-200">
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this comment?')) onDelete(comment.id)
                }}
                className="hover:text-red-400"
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
