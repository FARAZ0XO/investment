import { useEffect, useState, type FormEvent } from 'react';
import { Download, FileText, Lock, LogOut, ShieldCheck } from 'lucide-react';
import { formatPkr } from '../utils/investmentMath';

interface PortalHolding {
  holdingId: string;
  propertyTitle: string;
  location: string;
  unitRef: string;
  acquiredDate: string;
  purchasePricePkr: number;
  currentValuePkr: number;
  paidPercent: number;
  status: string;
}

interface PortalInstallment {
  installmentId: string;
  propertyTitle: string;
  dueDate: string;
  amountPkr: number;
  status: 'Paid' | 'Upcoming' | 'Scheduled';
}

interface PortalDocument {
  docId: string;
  title: string;
  category: string;
  issuedDate: string;
  verificationHash: string;
}

interface PortalBooking {
  id: string;
  propertyId: string;
  preferredDate: string;
  visitType: string;
  status: string;
}

interface PortalUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  clientCode: string;
  portfolio: {
    totalInvestedPkr: number;
    currentValuationPkr: number;
    unrealizedGainPercent: number;
    annualRentalIncomePkr: number;
    holdings: PortalHolding[];
    installments: PortalInstallment[];
    documents: PortalDocument[];
  };
}

interface ClientPortalProps {
  refreshTrigger: number;
}

const TOKEN_STORAGE_KEY = 'arish_portal_jwt';

export function ClientPortal({ refreshTrigger }: ClientPortalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [token, setToken] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<PortalUser | null>(null);
  const [bookings, setBookings] = useState<PortalBooking[]>([]);
  const [loadingSession, setLoadingSession] = useState<boolean>(Boolean(token));
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Load authenticated user session on mount or refreshTrigger
  useEffect(() => {
    if (!token) {
      setLoadingSession(false);
      return;
    }

    let cancelled = false;
    setLoadingSession(true);

    fetch('/api/portal/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Session expired');
        return res.json() as Promise<{ user: PortalUser; bookings: PortalBooking[] }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user);
          setBookings(data.bookings || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          try {
            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          } catch {
            // ignore
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, refreshTrigger]);

  const performLogin = async (loginEmail: string, loginPasscode: string) => {
    setAuthError('');
    if (!loginEmail.trim() || !loginPasscode.trim()) {
      setAuthError('Please enter both your registered investor email and passcode.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, passcode: loginPasscode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed. Check your credentials.');
        return;
      }

      try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      } catch {
        // ignore
      }
      setToken(data.token);
      setUser(data.user);
      setBookings(data.bookings || []);
    } catch {
      setAuthError('Unable to reach the Arish Client Portal server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await performLogin(email, passcode);
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!fullName.trim() || !email.trim() || !phone.trim() || passcode.trim().length < 6) {
      setAuthError(
        'Please complete all fields (full name, valid email, mobile number, and 6+ character passcode).',
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/portal/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Registration failed.');
        return;
      }
      try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      } catch {
        // ignore
      }
      setToken(data.token);
      setUser(data.user);
      setBookings(data.bookings || []);
    } catch {
      setAuthError('Unable to create investor account right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setEmail('tariq.mehmood@karachicapital.pk');
    setPasscode('ARISH-2026');
    await performLogin('tariq.mehmood@karachicapital.pk', 'ARISH-2026');
  };

  const handleSignOut = async () => {
    await fetch('/api/portal/logout', { method: 'POST' }).catch(() => {});
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setToken(null);
    setUser(null);
    setBookings([]);
    setPasscode('');
  };

  const handleDownloadDocument = async (docId: string) => {
    if (!token) return;
    const res = await fetch(`/api/portal/documents/${encodeURIComponent(docId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="client-portal" className="scroll-mt-16 border-b border-slate-200 bg-slate-950 py-16 text-white">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wide text-emerald-300">
              03. Investor Governance &amp; Custody
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Secure Client Portal
            </h2>
            <p className="mt-2 max-w-2xl text-base text-slate-300">
              Track property valuations, installment schedules, FBR tax receipts, and verified title
              deeds in real time from anywhere in the world.
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{user.fullName}</p>
                <p className="font-mono text-xs text-emerald-300 tabular-nums">
                  ID: {user.clientCode}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 whitespace-nowrap"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loadingSession ? (
          <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-sm text-slate-300">Verifying encrypted investor session...</p>
          </div>
        ) : !user ? (
          /* Unauthenticated Portal Login / Register Card */
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8 lg:col-span-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  <h3 className="font-display text-lg font-semibold text-white">
                    {authMode === 'login' ? 'Investor Sign In' : 'Register Investor Account'}
                  </h3>
                </div>
                <div className="inline-flex rounded-lg bg-slate-800 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      authMode === 'login'
                        ? 'bg-emerald-800 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError('');
                    }}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      authMode === 'register'
                        ? 'bg-emerald-800 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    New Investor
                  </button>
                </div>
              </div>

              {authError && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-red-500/40 bg-red-950/50 px-4 py-3 text-xs font-medium text-red-200"
                >
                  {authError}
                </div>
              )}

              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4" noValidate>
                  <div>
                    <label htmlFor="portal-email" className="block text-xs font-medium text-slate-300">
                      Registered Email Address
                    </label>
                    <input
                      id="portal-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tariq.mehmood@karachicapital.pk"
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="portal-passcode"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Portal Passcode
                    </label>
                    <input
                      id="portal-passcode"
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter your passcode"
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
                    >
                      {submitting ? 'Authenticating...' : 'Access Client Portal'}
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleDemoSignIn}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-slate-700 whitespace-nowrap"
                    >
                      Sign In with Demo Investor
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-4" noValidate>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="reg-name" className="block text-xs font-medium text-slate-300">
                        Full Name
                      </label>
                      <input
                        id="reg-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Bilal Ahmed Khan"
                        className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-phone" className="block text-xs font-medium text-slate-300">
                        Mobile Number
                      </label>
                      <input
                        id="reg-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="03075522866"
                        className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="reg-email" className="block text-xs font-medium text-slate-300">
                      Email Address
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="investor@domain.pk"
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-passcode" className="block text-xs font-medium text-slate-300">
                      Create Passcode (min 6 characters)
                    </label>
                    <input
                      id="reg-passcode"
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Create a secure passcode"
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {submitting ? 'Creating Account...' : 'Create Investor Account'}
                  </button>
                </form>
              )}
            </div>

            {/* Security & Custody Architecture Overview */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 lg:col-span-6">
              <div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  <h3 className="font-display text-lg font-semibold text-white">
                    What Clients Access Inside the Portal
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Designed specifically for local and overseas Pakistani investors who require
                  transparent documentation without visiting multiple municipal registries in person.
                </p>

                <dl className="mt-6 space-y-4 border-t border-slate-800 pt-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-white">Verified Title Vault</dt>
                    <dd className="text-right text-slate-400">
                      SBCA, DHA &amp; KDA allotment scans
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-slate-800/80 pt-3">
                    <dt className="font-medium text-white">Installment &amp; Rent Ledger</dt>
                    <dd className="text-right text-slate-400">
                      Cleared receipts &amp; upcoming due dates
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-slate-800/80 pt-3">
                    <dt className="font-medium text-white">Quarterly Market Valuation</dt>
                    <dd className="text-right text-slate-400">
                      Independent comparable transaction updates
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs text-slate-400">
                <p className="font-semibold text-slate-200">Demo Investor Credentials</p>
                <p className="mt-1 font-mono text-emerald-300">
                  Email: tariq.mehmood@karachicapital.pk · Passcode: ARISH-2026
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Investor Dashboard */
          <div className="mt-10 space-y-6" data-testid="portal-dashboard">
            {/* KPI Summary Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-xs text-slate-400">Current Portfolio Valuation</p>
                <p className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                  {formatPkr(user.portfolio.currentValuationPkr)}
                </p>
                <p className="mt-1 font-mono text-xs text-emerald-400 tabular-nums">
                  +{user.portfolio.unrealizedGainPercent}% Unrealized Appreciation
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-xs text-slate-400">Invested Capital</p>
                <p className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                  {formatPkr(user.portfolio.totalInvestedPkr)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Across {user.portfolio.holdings.length} active holdings
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-xs text-slate-400">Annualized Rental Income</p>
                <p className="mt-1 font-mono text-2xl font-bold text-emerald-300 tabular-nums">
                  {formatPkr(user.portfolio.annualRentalIncomePkr)}
                </p>
                <p className="mt-1 text-xs text-slate-400">Disbursed quarterly</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-xs text-slate-400">Scheduled Visits &amp; Briefings</p>
                <p className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                  {bookings.length}
                </p>
                <p className="mt-1 text-xs text-slate-400">Fortune Towers advisory calendar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Holdings & Installments */}
              <div className="space-y-6 lg:col-span-7">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="font-display text-base font-semibold text-white">
                    Active Property Holdings
                  </h3>
                  {user.portfolio.holdings.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-400">
                      No closed acquisitions yet. Schedule an advisory session below to allocate
                      capital into verified Karachi properties.
                    </p>
                  ) : (
                    <div className="mt-4 divide-y divide-slate-800">
                      {user.portfolio.holdings.map((h) => (
                        <div key={h.holdingId} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-white">{h.propertyTitle}</p>
                              <p className="mt-0.5 text-xs text-slate-400">
                                {h.unitRef} · {h.location} · {h.status}
                              </p>
                            </div>
                            <div className="text-right font-mono tabular-nums">
                              <p className="text-sm font-semibold text-emerald-300">
                                {formatPkr(h.currentValuePkr)}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Cost: {formatPkr(h.purchasePricePkr)} · {h.paidPercent}% Paid
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Installment Schedule */}
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="font-display text-base font-semibold text-white">
                    Installment &amp; Payment Ledger
                  </h3>
                  {user.portfolio.installments.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-400">
                      No active installment schedules on file.
                    </p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-800 text-slate-400">
                          <tr>
                            <th className="py-2 pr-3 font-medium">Asset</th>
                            <th className="py-2 pr-3 font-medium">Due Date</th>
                            <th className="py-2 pr-3 font-medium">Amount</th>
                            <th className="py-2 text-right font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 font-mono tabular-nums">
                          {user.portfolio.installments.map((ins) => (
                            <tr key={ins.installmentId}>
                              <td className="py-2.5 pr-3 font-sans text-slate-200">
                                {ins.propertyTitle}
                              </td>
                              <td className="py-2.5 pr-3 text-slate-400">{ins.dueDate}</td>
                              <td className="py-2.5 pr-3 text-white">{formatPkr(ins.amountPkr)}</td>
                              <td className="py-2.5 text-right">
                                <span
                                  className={
                                    ins.status === 'Paid'
                                      ? 'text-emerald-400'
                                      : ins.status === 'Upcoming'
                                        ? 'text-amber-300'
                                        : 'text-slate-400'
                                  }
                                >
                                  {ins.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Documents & Session Bookings */}
              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="font-display text-base font-semibold text-white">
                    Verified Legal &amp; Valuation Vault
                  </h3>
                  <div className="mt-4 space-y-3">
                    {user.portfolio.documents.map((doc) => (
                      <div
                        key={doc.docId}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3.5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-start gap-2">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                            <p className="text-sm font-medium leading-snug text-white">{doc.title}</p>
                          </div>
                          <p className="mt-1 pl-6 font-mono text-[11px] text-slate-400">
                            {doc.category} · {doc.issuedDate} · {doc.verificationHash}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(doc.docId)}
                          aria-label={`Download ${doc.title}`}
                          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="font-display text-base font-semibold text-white">
                    Your Booked Consultations
                  </h3>
                  {bookings.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-400">
                      Submit a booking form below using {user.email} to sync appointments here.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-2.5">
                      {bookings.map((b) => (
                        <div
                          key={b.id}
                          className="rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-semibold text-emerald-300">{b.id}</span>
                            <span className="text-slate-300">{b.status}</span>
                          </div>
                          <p className="mt-1 text-slate-300">
                            Date: <span className="font-mono">{b.preferredDate}</span> ·{' '}
                            {b.visitType.replace('-', ' ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
