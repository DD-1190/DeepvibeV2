import { VibeMark } from './VibeMark';

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5" role="status" aria-label="Assistant is typing">
      <VibeMark size={26} />
      <span className="chat-bubble-ai inline-flex items-center gap-1.5 rounded-[20px] rounded-bl-md px-4 py-[1.05rem]">
        <i className="chat-dot" />
        <i className="chat-dot [animation-delay:150ms]" />
        <i className="chat-dot [animation-delay:300ms]" />
      </span>
    </div>
  );
}
