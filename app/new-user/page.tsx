import { prisma } from '@/utils/db'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

const NewUser = async () => {
  await createNewUser()
  return <div>...loading</div>
}

const createNewUser = async () => {
  const user = await currentUser()

  if (!user) {
    console.log('User Not found')
    redirect('/')
  }

  const match = await prisma.user.findUnique({
    where: {
      clerkId: user.id as string,
    },
  })

  if (!match) {
    await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user?.emailAddresses[0].emailAddress,
      },
    })
  }

  redirect('/journal')
}

export default NewUser
