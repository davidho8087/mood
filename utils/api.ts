/**
 * Creates a URL by concatenating the current window's location origin with the provided path.
 *
 * @param {string} path - The path to append to the URL.
 * @returns {string} The generated URL.
 */
const createURL = (path: string): string => window.location.origin + path
export const fetcher = (...args: [string, RequestInit?]) =>
  fetch(...args).then((res) => res.json())

/**
 * Deletes an entry from the server.
 *
 * @param {string} id - The ID of the entry to delete.
 * @returns {Promise} A promise that resolves to the deleted entry's data if successful, or rejects with an error if something went wrong on the API server.
 */
export const deleteEntry = async (id: string): Promise<any> => {
  const res = await fetch(
    new Request(createURL(`/api/entry/${id}`), {
      method: 'DELETE',
    }),
  )

  if (res.ok) {
    return res.json()
  } else {
    throw new Error('Something went wrong on API server!')
  }
}

/**
 * Creates a new entry by sending a POST request to the API server.
 *
 * @async
 * @function newEntry
 * @returns {Promise<object>} - A Promise that resolves to the JSON response from the server.
 * @throws {Error} - If something went wrong on the API server.
 */

export const newEntry = async (): Promise<object> => {
  const res = await fetch(
    new Request(createURL('/api/entry'), {
      method: 'POST',
      body: JSON.stringify({ content: 'new entry' }),
    }),
  )

  if (res.ok) {
    return res.json()
  } else {
    console.log('error here')
    throw new Error('Something went wrong on API server!')
  }
}

export const updateEntry = async (id: string, updates: { content: string }) => {
  const res = await fetch(
    new Request(createURL(`/api/entry/${id}`), {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    }),
  )

  if (res.ok) {
    return res.json()
  } else {
    throw new Error('Something went wrong on API server!')
  }
}

export const askQuestion = async (question: string) => {
  const res = await fetch(
    new Request(createURL(`/api/question`), {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
  )

  if (res.ok) {
    return res.json()
  } else {
    throw new Error('Something went wrong on API server!')
  }
}
