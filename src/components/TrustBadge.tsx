import clsx from 'clsx';

type TrustBadgeProps = {
  score: number;
  level: 'High' | 'Medium' | 'Low';
};

export function TrustBadge({ score, level }: TrustBadgeProps) {
  const tone =
    level === 'High'
      ? 'bg-emerald-500 text-emerald-950'
      : level === 'Medium'
      ? 'bg-amber-400 text-slate-950'
      : 'bg-rose-500 text-white';

  return (
    <div className={clsx('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm', tone)}>
      <span>{level} trust</span>
      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{score}</span>
    </div>
  );
}
