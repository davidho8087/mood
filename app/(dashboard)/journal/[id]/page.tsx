import Editor from '@/components/Editor'

import { JournalEntry } from '.prisma/client'
import { getUserFromClerkID } from '@/utils/auth'
import { prisma } from '@/utils/db'

const getEntry = async (id: string): Promise<JournalEntry | null> => {
  const user = await getUserFromClerkID()
  // find unique,which means everything that you put in where has to be a unique index.
  const entry = await prisma.journalEntry.findUnique({
    where: {
      // compound index
      userId_id: {
        userId: user.id,
        id,
      },
    },
    include: {
      analysis: true,
    },
  })

  return entry
}

type ParamsProp = {
  params: { id: string }
}

const JournalEditorPage = async ({ params }: ParamsProp) => {
  const entry = await getEntry(params.id)

  return (
    <div className="h-full w-full">
      <Editor entry={entry} />
    </div>
  )
}

export default JournalEditorPage
