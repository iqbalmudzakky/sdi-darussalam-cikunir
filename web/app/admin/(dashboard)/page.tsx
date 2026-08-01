export default function AdminDashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pilih section di sidebar untuk mulai edit konten website.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
        Ringkasan konten akan ditambahkan di sini.
      </div>
    </div>
  );
}
