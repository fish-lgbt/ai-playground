'use client';

import { useState } from 'react';
import { useUIState, useActions } from 'ai/rsc';
import { AI, Actions } from '@/app/action';
import { Messages } from '@/components/messages';
import { UserButton } from '@clerk/nextjs';

export const runtime = 'edge';

export default function Page() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>() as Actions;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

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
    <main className="flex flex-col items-center h-full w-full p-2">
      <div className="flex flex-col p-2 gap-2 items-center h-full w-full">
        <Messages messages={messages} />

        <div className="flex flex-row gap-2 w-full">
          <form className="flex w-full gap-1" onSubmit={onSubmit}>
            <input
              className="dark:text-white p-2 w-full border dark:bg-[#181818] rounded"
              placeholder="Send a message..."
              value={inputValue}
              type="text"
              autoComplete="off"
              onChange={(event) => {
                setInputValue(event.target.value);
              }}
            />
            <button className="p-2 dark:text-white border dark:bg-[#181818] rounded" type="submit">
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
