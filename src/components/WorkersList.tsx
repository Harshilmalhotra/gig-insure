import { AdminWorker } from '@/lib/api';

type WorkersListProps = {
  users: AdminWorker[];
  loading: boolean;
};

export function WorkersList({ users, loading }: WorkersListProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Workers</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Worker directory</h2>
        </div>
        <span className="rounded-full bg-slate-900/90 px-4 py-2 text-xs uppercase tracking-[0.16em] text-slate-400">
          {users.length} workers
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-slate-900/80">
        <table className="min-w-full border-collapse text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Trust</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  Loading workers...
                </td>
              </tr>
            ) : users.length ? (
              users.map((user) => (
                <tr key={user.id} className="border-t border-slate-800">
                  <td className="px-4 py-4 text-white">{user.id}</td>
                  <td className="px-4 py-4">{user.trustScore}</td>
                  <td className="px-4 py-4 text-slate-200">{user.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  No workers available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
