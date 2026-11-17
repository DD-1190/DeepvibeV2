import { cn } from '@/lib/cn';

/** The lime "v" from the DeepVibe wordmark, in a small glass orb — the assistant's avatar. */
export function VibeMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn('chat-orb relative grid shrink-0 place-items-center rounded-full', className)}
    >
      <svg viewBox="646 46 150 177" style={{ width: size * 0.46 }} className="relative h-auto">
        <path
          fill="#B9F56B"
          d="M670.9,217.7C661.8,211.5 658.4,199.7 654.1,158.5C651.4,133.2 649.6,102.0 650.3,94.0C651.9,75.9 659.2,67.1 672.7,67.0C679.0,67.0 683.5,70.2 684.9,75.8C685.4,77.8 686.4,99.1 687.0,123.0C687.6,146.9 688.2,166.6 688.3,166.6C688.4,166.7 695.7,155.5 704.5,141.7C739.6,86.7 755.8,63.1 762.8,56.9C768.0,52.3 775.7,49.5 780.6,50.4C787.9,51.8 794.0,61.8 792.5,69.9C791.3,76.4 787.7,82.0 760.4,120.0C692.2,214.7 691.6,215.5 685.8,218.6C681.6,220.8 674.9,220.4 670.9,217.7Z"
        />
      </svg>
    </span>
  );
}
