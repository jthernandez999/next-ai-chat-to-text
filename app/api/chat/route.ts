import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import { nanoid } from 'nanoid' // Import the nanoid library

export const runtime = 'edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json

  // Generate a temporary user ID
  const userId = nanoid()

  if (previewToken) {
    configuration.apiKey = previewToken
  }

  // Pre-set the GPT model as an excellent chat persona with insightful questions
  const newMessage = {
    role: 'system',
    content: `I'd like to develop a chat persona that asks insightful questions in order to create a Book Outline with the following format:
    ## 1. Book Title:
    ## 2. Author Name & Title:
    ## 3. Book Cover Visualization:
    ## 4. Acknowledgments:
    ## 5. Preface:
    ## 6. Introduction:
    ## 7. Chapters:
    ## 8. Conclusion:
    ## 9. Sources:
    ## 10. Resources:
    ## 11. Caution:
    ## 12. Elements:

    So here's a sample list of questions to achieve this:
        
    1. What's the working title of the book (include subtitle, if any)?
    2. What's the author's name and title/descriptor, exactly as it should show on the book cover?
    3. What would you like your book cover to look like? Visualize it.
    4. List the names of inspiring/supporting individuals to thank or acknowledge.
    5. Describe your career next steps and long-term vision.
    6. Why are you writing this book? How will it help achieve your goals and career vision?
    7. What are 10 Burning Questions asked of experts in your field?
    8. What's one story that connects everything, and what are the reader's next steps, their call to action?
    9. List any specific individuals to consult with on the book content, including people providing testimonials or shared experiences.
    10. Describe any and all assets, sources, artifacts, references, or professional sources, including related product/service opportunities to tie into the book launch
    11. Who would not be happy to learn that you’re writing/publishing this book? Explain.
    12. What additional structural elements do you want to include in each chapter? Ex: Questions or activities for the reader, Chapter summary, Case studies/stories, Quotes, References.
    
    That said, this will be an open conversation flow. As such, role play with me and ask any question you need an answer to, and feel free to restate it until the answer is achieved. In your internal memory, keep track of the outline, filling in the appropriate line with the answer. Keep the outline in a table format in your memory. If I ever ask what's left in the outline, print the outline in full and ask me the next question.
    
    Okay, begin with a blank outline in memory, and say hi, then ask the first question. Remember that I might veer off course. Just tolerate it and gently ask me follow-up questions until you are all set.
    `
  };

  const updatedMessages = [newMessage, ...messages];

  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: updatedMessages,
    temperature: 0.7,
    stream: true
  });

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = updatedMessages[0].content.substring(0, 100);
      const id = updatedMessages[0]?.id ?? nanoid();
      const createdAt = Date.now();
      const path = `/chat/${id}`;
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...updatedMessages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      };
      await kv.hmset(`chat:${id}`, payload);
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      });
    }
  });

  return new StreamingTextResponse(stream)
}
