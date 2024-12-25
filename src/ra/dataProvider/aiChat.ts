import type { ChatMessage } from '@/types';
import { userManager } from '@/utilities/auth';

const { VITE_API_URL: baseApiUrl } = import.meta.env;

const aiChatDataProvider = {
  create: async (_resource: string, params: { data: ChatMessage[] }) => {
    const { data } = params;

    const user = await userManager.getUser();

    if (!user) {
      throw new Error('User not found');
    }

    const token = user.id_token;

    const url = new URL('ai/chat', baseApiUrl);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        messages: data,
      }),
    });

    const responseData = await response.json();

    const messages = responseData.messages;

    return { data: { messages, id: '1' } };
  },
};

export default aiChatDataProvider;
