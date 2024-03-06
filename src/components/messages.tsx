import ScrollToBottom from 'react-scroll-to-bottom';
import { AssistantMessage } from './messages/assistant';
import { FunctionMessage } from './messages/function';
import { SystemMessage } from './messages/system';
import { UserMessage } from './messages/user';

export type Message =
  | {
      id: number;
      role: 'assistant' | 'system' | 'function';
      content: React.ReactNode;
    }
  | {
      id: number;
      role: 'user';
      content: string;
    };

type MessagesProps = {
  messages: Message[];
};

export const Messages = ({ messages }: MessagesProps) => {
  return (
    <div className="overflow-y-scroll h-full w-full">
      {messages.length >= 1 && (
        <ScrollToBottom initialScrollBehavior="auto" mode="bottom" className="h-full p-2">
          {messages.map((message) => {
            switch (message.role) {
              case 'user':
                return <UserMessage key={message.id}>{message.content}</UserMessage>;
              case 'assistant':
                return <AssistantMessage key={message.id}>{message.content}</AssistantMessage>;
              case 'system':
                return <SystemMessage key={message.id}>{message.content}</SystemMessage>;
              case 'function':
                return <FunctionMessage key={message.id}>{message.content}</FunctionMessage>;
            }
          })}
        </ScrollToBottom>
      )}
    </div>
  );
};
