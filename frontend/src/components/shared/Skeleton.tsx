interface SkeletonRowProps {
  columns?: number;
  actionColumn?: boolean;
}

export function SkeletonRow({ columns = 5, actionColumn = false }: SkeletonRowProps) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="p-3">
          <div
            className="skeleton-pulse shimmer-loading h-4 rounded-md bg-slate-200"
            style={{ width: `${index === 1 ? 70 : 38 + ((index * 11) % 24)}%` }}
          />
        </td>
      ))}
      {actionColumn && (
        <td className="p-3 text-center">
          <div className="skeleton-pulse shimmer-loading mx-auto h-8 w-24 rounded-lg bg-slate-200" />
        </td>
      )}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-6">
      <div className="skeleton-pulse shimmer-loading h-6 w-3/4 rounded-md bg-slate-200" />
      <div className="space-y-2">
        <div className="skeleton-pulse shimmer-loading h-4 w-full rounded-md bg-slate-200" />
        <div className="skeleton-pulse shimmer-loading h-4 w-5/6 rounded-md bg-slate-200" />
      </div>
      <div className="skeleton-pulse shimmer-loading h-10 rounded-md bg-slate-200" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton-pulse shimmer-loading h-4 rounded-md bg-slate-200"
          style={{ width: index === lines - 1 ? '80%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return <div className={`${sizeClasses[size]} skeleton-pulse shimmer-loading rounded-full bg-slate-200`} />;
}
