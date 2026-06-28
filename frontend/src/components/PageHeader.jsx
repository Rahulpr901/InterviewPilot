const PageHeader = ({ title, description, action }) => (
  <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/20 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-2 text-slate-400 max-w-xl">{description}</p>
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default PageHeader;
