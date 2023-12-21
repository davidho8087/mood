'use client'

import { useState } from 'react'

import { JournalEntry } from '.prisma/client'
import { deleteEntry, updateEntry } from '@/utils/api'
import { useRouter } from 'next/navigation'
import { useAutosave } from 'react-autosave'
import Spinner from './Spinner'

const Editor = ({ entry }: { entry: JournalEntry }) => {
  const [text, setText] = useState(entry.content)
  const [currentEntry, setEntry] = useState(entry)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    await deleteEntry(entry.id)
    router.push('/journal')
  }

  useAutosave({
    data: text,
    onSave: async (_text) => {
      if (_text === entry.content) return
      setIsSaving(true)
      const { data } = await updateEntry(entry.id, { content: _text })

      setEntry(data)
      setIsSaving(false)
    },
  })

  return (
    <div className="relative grid h-full w-full grid-cols-3 gap-0">
      <div className="absolute left-0 top-0 p-2">
        {isSaving ? (
          <Spinner />
        ) : (
          <div className="h-[16px] w-[16px] rounded-full bg-green-500"></div>
        )}
      </div>
      <div className="col-span-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-full w-full p-8 text-xl"
        />
      </div>
      <div className="border-l border-black/5">
        <div
          style={{ background: currentEntry.analysis?.color }}
          className="h-[100px] bg-blue-600 p-8 text-white"
        ></div>
        <div>
          <ul role="list" className="divide-y divide-gray-200">
            <li className="flex items-center justify-between px-8 py-4">
              <div className="w-1/3 text-xl font-semibold">Subject</div>
              <div className="text-xl">{currentEntry.analysis?.subject}</div>
            </li>

            <li className="flex items-center justify-between px-8 py-4">
              <div className="text-xl font-semibold">Mood</div>
              <div className="text-xl">{currentEntry.analysis?.mood}</div>
            </li>

            <li className="flex items-center justify-between px-8 py-4">
              <div className="text-xl font-semibold">Negative</div>
              <div className="text-xl">
                {currentEntry.analysis?.negative ? 'True' : 'False'}
              </div>
            </li>
            <li className="flex items-center justify-between px-8 py-4">
              <button
                onClick={handleDelete}
                type="button"
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Delete
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Editor
