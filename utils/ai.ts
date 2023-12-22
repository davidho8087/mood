import { loadQARefineChain } from 'langchain/chains'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { OpenAI } from 'langchain/llms/openai'
import { PromptTemplate } from 'langchain/prompts'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'

import { JournalEntry } from '.prisma/client'
import { Document } from 'langchain/document'
import {
  OutputFixingParser,
  StructuredOutputParser,
} from 'langchain/output_parsers'
import { z } from 'zod'

/**
 * A parser for structured output data.
 * StructuredOutputParser, a tool likely used to parse outputs from the AI model.
 * This parser configuration expects the AI output to be an object with keys
 * like 'mood', 'subject', 'color' etc.
 *
 * @class
 */
const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    mood: z
      .string()
      .describe('the mood of the person who wrote the journal entry.'),
    subject: z.string().describe('the subject of the journal entry.'),
    negative: z
      .boolean()
      .describe(
        'is the journal entry negative? (i.e. does it contain negative emotions?).',
      ),
    summary: z.string().describe('quick summary of the entire entry.'),
    color: z
      .string()
      .describe(
        'a hexidecimal color code that represents the mood of the entry. Example #0101fe for blue representing happiness.',
      ),
    sentimentScore: z
      .number()
      .describe(
        'sentiment of the text and rated on a scale from -10 to 10, where -10 is extremely negative, 0 is neutral, and 10 is extremely positive.',
      ),
  }),
)

/**
 * Returns a formatted prompt for analyzing a journal entry.
 * This asynchronous function is used to create a formatted input prompt to feed
 * into the AI model. The prompt asks the model to analyze a journal entry following
 * a certain format. This format is derived from the previously defined parser.
 *
 * @async
 * @param {string} content - The content of the journal entry.
 * @returns {Promise<string>} A promise that resolves to the formatted prompt.
 */
const getPrompt = async (content: string): Promise<string> => {
  const format_instructions = parser.getFormatInstructions()

  // write good prompt for AI consistency
  const prompt = new PromptTemplate({
    // Instruction to AI
    template:
      'Analyze the following journal entry. Follow the instruction and ' +
      'format your response to match the format instructions, ' +
      'no matter what! \n{format_instructions}\n{entry}',

    inputVariables: ['entry'],
    partialVariables: { format_instructions },
  })

  // format the prompt if entry: content
  const input = await prompt.format({
    entry: content,
  })

  return input
}

/**
 * Analyzes a journal entry by getting user prompt,
 * This function takes a JournalEntry object as input,
 * formats it using the getPrompt function, and then passes it to the OpenAI model
 * for analysis. The output of the model is then parsed using the parser.
 * If parsing fails, it uses a OutputFixingParser to correct the output.
 *
 * @async
 * @param {JournalEntry} entry - The journal entry to analyze.
 * @returns {Promise<Object>} - The parsed output of the analysis.
 * @throws Will throw an error if parsing fails.
 */
export const analyzeEntry = async (entry: JournalEntry): Promise<object> => {
  const input = await getPrompt(entry.content)
  const model = new OpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo' })
  const output = await model.call(input)

  try {
    return parser.parse(output)
  } catch (e) {
    const fixParser = OutputFixingParser.fromLLM(
      new OpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo' }),
      parser,
    )
    const fix = await fixParser.parse(output)
    return fix
  }
}

/**
 * Executes a question answering task using the given question and entries.
 *
 * @param {string} question - The question to ask.
 * @param {Array<Object>} entries - The array of entries containing content and metadata.
 * @returns {Promise<string>} - A promise that resolves to the output text from the question answering task.
 */
// Import the necessary dependencies and modules.

// Define the 'qa' function.
export const qa = async (question: string, entries: any[]): Promise<string> => {
  // Create an array of 'Document' objects from the 'entries'.
  const docs = entries.map(
    (entry) =>
      new Document({
        pageContent: entry.content, // Content of the entry.
        metadata: { source: entry.id, date: entry.createdAt }, // Metadata with source and date.
      }),
  )

  // Create a new OpenAI model instance with specific settings.
  const model = new OpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo' })

  // Load the QA refine chain using the model.
  const chain = loadQARefineChain(model)

  // Create an instance of OpenAIEmbeddings.
  const embeddings = new OpenAIEmbeddings()

  // Create a memory-based vector store from the 'docs' and 'embeddings'.
  const store = await MemoryVectorStore.fromDocuments(docs, embeddings)

  // Perform a similarity search based on the 'question'.
  const relevantDocs = await store.similaritySearch(question)

  // Make a call to the QA refine chain with relevant documents and the 'question'.
  const res = await chain.call({
    input_documents: relevantDocs, // Relevant documents from the similarity search.
    question, // The user's question.
  })

  // Return the output text generated by the AI as the answer.
  return res.output_text
}
