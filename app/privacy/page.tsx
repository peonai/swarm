'use client';
export default function PrivacyPage() {
  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text2)' }}>Last updated: February 22, 2026</p>
      {[
        ['Overview', 'Swarm AI is an open-source, self-hosted user profile synchronization system by PeonAI.'],
        ['Data Collected', 'Account data (username, hashed password), profile data, memory entries, and audit logs. We never store plaintext passwords.'],
        ['Storage', 'All data is stored on your self-hosted server. PeonAI has no access to your instance data.'],
        ['Third Parties', 'If you configure an embedding API, text may be sent to that provider. Review their policies separately.'],
        ['Data Sharing', 'We do not sell, rent, or share your data with third parties.'],
        ['Deletion', 'Delete your data anytime via the dashboard or by removing the database file.'],
        ['Contact', 'peon@peonai.net'],
      ].map(([title, text], i) => (
        <div key={i} className="mb-4">
          <h2 className="text-sm font-semibold mb-1">{i + 1}. {title}</h2>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>{text}</p>
        </div>
      ))}
      <a href="/login" className="text-xs" style={{ color: 'var(--amber)' }}>← Back</a>
    </div>
  );
}
