'use client';
export default function TermsPage() {
  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text2)' }}>Last updated: February 22, 2026</p>
      {[
        ['Acceptance', 'By using Swarm AI, you agree to these terms.'],
        ['Description', 'Swarm AI is open-source, self-hosted software for synchronizing user profiles across AI agents, provided under the MIT License.'],
        ['Self-Hosting', 'You are responsible for your own deployment, security, backups, and compliance with applicable laws.'],
        ['Acceptable Use', 'Do not use the Service to store illegal content, attempt unauthorized access, or violate any applicable laws.'],
        ['Disclaimer', 'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. PEONAI SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM USE OF THE SERVICE.'],
        ['Changes', 'We may update these terms. Continued use constitutes acceptance.'],
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
