'use client';

import { useState } from 'react';
import { useUIState, useActions } from 'ai/rsc';
import { AI, Actions } from '@/app/action';
import { Messages } from '@/components/messages';

export const runtime = 'edge';

export default function Page() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>() as Actions;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Add user message to UI state
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        role: 'user',
        content: inputValue,
      },
    ]);

    // Clear form
    setInputValue('');

    // Submit and get response message
    const responseMessage = await submitUserMessage(inputValue);
    setMessages((currentMessages) => [...currentMessages, responseMessage]);
  };

  return (
    <main className="flex flex-col items-center h-screen w-full">
      <div className="flex flex-col p-2 gap-2 items-center h-full w-1/2 border">
        <Messages messages={messages} />

        <form className="flex w-full" onSubmit={onSubmit}>
          <input
            className="text-black p-2 w-full"
            placeholder="Send a message..."
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
            }}
          />
        </form>
      </div>
    </main>
  );
}
