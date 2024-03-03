import { AssistantMessage } from './messages/assistant';
import { FunctionMessage } from './messages/function';
import { SystemMessage } from './messages/system';
import { UserMessage } from './messages/user';

export type Message = {
  id: number;
  role: 'user' | 'assistant' | 'system' | 'function';
  content: React.ReactNode;
};

type MessagesProps = {
  messages: Message[];
};

export const Messages = ({ messages }: MessagesProps) => {
  return (
    <div className="overflow-y-scroll h-full w-full">
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
    </div>
  );
};
