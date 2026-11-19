import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { Request, Response } from 'express';
import {
  validateBookingInput,
  validateInquiryInput,
  type BookingFormInput,
  type InquiryFormInput,
} from './src/utils/investmentMath.ts';

interface StoredBooking extends BookingFormInput {
  id: string;
  createdAt: string;
  status: 'Confirmed' | 'Pending Review';
}

interface StoredInquiry extends InquiryFormInput {
  id: string;
  createdAt: string;
  status: 'Received';
}

interface PortalUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  clientCode: string;
  passwordHash: string;
  portfolio: {
    totalInvestedPkr: number;
    currentValuationPkr: number;
    unrealizedGainPercent: number;
    annualRentalIncomePkr: number;
    holdings: Array<{
      holdingId: string;
      propertyTitle: string;
      location: string;
      unitRef: string;
      acquiredDate: string;
      purchasePricePkr: number;
      currentValuePkr: number;
      paidPercent: number;
      status: string;
    }>;
    installments: Array<{
      installmentId: string;
      propertyTitle: string;
      dueDate: string;
      amountPkr: number;
      status: 'Paid' | 'Upcoming' | 'Scheduled';
    }>;
    documents: Array<{
      docId: string;
      title: string;
      category: string;
      issuedDate: string;
      verificationHash: string;
      summaryText: string;
    }>;
  };
}

interface StoreData {
  bookings: StoredBooking[];
  inquiries: StoredInquiry[];
  users: PortalUser[];
}

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'arish-store.json');
const TOKEN_SECRET = process.env.PORTAL_SESSION_SECRET || 'arish-property-consultants-karachi-portal-key';

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const derived = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 32);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function signSessionToken(userId: string, email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      email,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    }),
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string): { sub: string; email: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  if (sig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub: string;
      email: string;
      exp: number;
    };
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return { sub: parsed.sub, email: parsed.email };
  } catch {
    return null;
  }
}

function createSeedStore(): StoreData {
  const demoUser: PortalUser = {
    id: 'usr-tariq-01',
    fullName: 'Tariq Mehmood Siddiqui',
    email: 'tariq.mehmood@karachicapital.pk',
    phone: '03008214490',
    clientCode: 'APC-INV-2041',
    passwordHash: hashPassword('ARISH-2026'),
    portfolio: {
      totalInvestedPkr: 98_500_000,
      currentValuationPkr: 121_400_000,
      unrealizedGainPercent: 23.2,
      annualRentalIncomePkr: 4_760_000,
      holdings: [
        {
          holdingId: 'HLD-101',
          propertyTitle: 'Shahrah-e-Faisal Executive Corporate Suite',
          location: 'Block-6 PECHS, Karachi',
          unitRef: 'Suite 604 · 1,850 Sq. Ft.',
          acquiredDate: '2025-02-14',
          purchasePricePkr: 42_500_000,
          currentValuePkr: 51_200_000,
          paidPercent: 85,
          status: 'Leased · Active Cash Flow',
        },
        {
          holdingId: 'HLD-102',
          propertyTitle: 'Clifton Block 4 Sea-View Sky Penthouse',
          location: 'Block 4, Clifton, Karachi',
          unitRef: 'Level 19 · Unit B',
          acquiredDate: '2025-11-03',
          purchasePricePkr: 56_000_000,
          currentValuePkr: 70_200_000,
          paidPercent: 60,
          status: 'Under Construction · On Schedule',
        },
      ],
      installments: [
        {
          installmentId: 'INS-901',
          propertyTitle: 'Clifton Block 4 Sea-View Sky Penthouse',
          dueDate: '2026-10-15',
          amountPkr: 3_500_000,
          status: 'Paid',
        },
        {
          installmentId: 'INS-902',
          propertyTitle: 'Shahrah-e-Faisal Executive Corporate Suite',
          dueDate: '2026-12-01',
          amountPkr: 2_125_000,
          status: 'Upcoming',
        },
        {
          installmentId: 'INS-903',
          propertyTitle: 'Clifton Block 4 Sea-View Sky Penthouse',
          dueDate: '2027-01-15',
          amountPkr: 3_500_000,
          status: 'Scheduled',
        },
      ],
      documents: [
        {
          docId: 'DOC-SBCA-604',
          title: 'SBCA Commercial Lease & Floor Allotment Certificate',
          category: 'Title Verification',
          issuedDate: '2025-02-18',
          verificationHash: 'SBCA-KHI-88412-PECHS',
          summaryText:
            'ARISH PROPERTY CONSULTANTS — VERIFIED TITLE SUMMARY\nDocument: SBCA Commercial Lease & Floor Allotment Certificate\nClient: Tariq Mehmood Siddiqui (APC-INV-2041)\nAsset: Suite 604, Block-6 PECHS, Main Shahrah-e-Faisal, Karachi\nVerification Ref: SBCA-KHI-88412-PECHS\nAdvisory Office: Suite No. 302, 3rd Floor, Fortune Towers, Main Shahrah-e-Faisal, Block-6 PECHS, Karachi\nDirect Line: 03075522866\nStatus: Verified Clear & Encumbrance-Free',
        },
        {
          docId: 'DOC-VAL-2026Q4',
          title: 'Q4 2026 Independent Asset Valuation & Rental Ledger',
          category: 'Portfolio Audit',
          issuedDate: '2026-11-01',
          verificationHash: 'APC-VAL-2026-2041',
          summaryText:
            'ARISH PROPERTY CONSULTANTS — PORTFOLIO VALUATION STATEMENT\nClient: Tariq Mehmood Siddiqui (APC-INV-2041)\nTotal Invested Capital: PKR 98,500,000\nCurrent Appraised Value: PKR 121,400,000 (+23.2%)\nAnnualized Rental Yield: PKR 4,760,000\nAdvisory Office: Suite No. 302, 3rd Floor, Fortune Towers, Main Shahrah-e-Faisal, Block-6 PECHS, Karachi\nDirect Line: 03075522866',
        },
        {
          docId: 'DOC-DHA-TAX',
          title: 'FBR Section 236C / 236K Withholding Tax Receipt',
          category: 'Tax & Compliance',
          issuedDate: '2026-06-22',
          verificationHash: 'FBR-CPR-993014',
          summaryText:
            'ARISH PROPERTY CONSULTANTS — TAX COMPLIANCE RECORD\nCPR Ref: FBR-CPR-993014\nTaxpayer: Tariq Mehmood Siddiqui\nJurisdiction: Karachi Regional Tax Office\nAdvisory Contact: 03075522866',
        },
      ],
    },
  };

  return {
    bookings: [
      {
        id: 'APC-BK-1042',
        fullName: 'Tariq Mehmood Siddiqui',
        phone: '03008214490',
        email: 'tariq.mehmood@karachicapital.pk',
        propertyId: 'prop-fortune-corridor-floor',
        preferredDate: '2026-11-26',
        visitType: 'office-consultation',
        notes: 'Reviewing Q1 corporate floor acquisition terms at Fortune Towers.',
        createdAt: '2026-11-12T09:30:00.000Z',
        status: 'Confirmed',
      },
    ],
    inquiries: [],
    users: [demoUser],
  };
}

function loadStore(): StoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as StoreData;
      if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fall back to clean seeded state if file is unreadable
  }
  const seed = createSeedStore();
  saveStore(seed);
  return seed;
}

function saveStore(store: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch {
    // Non-fatal in read-only environments
  }
}

function sanitizeUser(user: PortalUser) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    clientCode: user.clientCode,
    portfolio: user.portfolio,
  };
}

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    for (const part of cookieHeader.split(';')) {
      const [key, ...rest] = part.trim().split('=');
      if (key === 'arish_portal_token') {
        return decodeURIComponent(rest.join('='));
      }
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const store = loadStore();

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'ARISH PROPERTY CONSULTANTS' });
  });

  app.post('/api/bookings', (req: Request, res: Response) => {
    const body = req.body as Partial<BookingFormInput>;
    const input: BookingFormInput = {
      fullName: String(body.fullName || '').trim(),
      phone: String(body.phone || '').trim(),
      email: String(body.email || '').trim(),
      propertyId: String(body.propertyId || '').trim(),
      preferredDate: String(body.preferredDate || '').trim(),
      visitType:
        body.visitType === 'site-visit' ||
        body.visitType === 'office-consultation' ||
        body.visitType === 'virtual-briefing'
          ? body.visitType
          : 'site-visit',
      notes: body.notes ? String(body.notes).trim() : '',
    };

    const validation = validateBookingInput(input);
    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }

    const booking: StoredBooking = {
      ...input,
      id: `APC-BK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
    };

    store.bookings.unshift(booking);
    saveStore(store);

    res.status(201).json({ booking });
  });

  app.post('/api/inquiries', (req: Request, res: Response) => {
    const body = req.body as Partial<InquiryFormInput>;
    const input: InquiryFormInput = {
      fullName: String(body.fullName || '').trim(),
      phone: String(body.phone || '').trim(),
      email: String(body.email || '').trim(),
      topic: String(body.topic || 'General Advisory').trim(),
      message: String(body.message || '').trim(),
    };

    const validation = validateInquiryInput(input);
    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }

    const inquiry: StoredInquiry = {
      ...input,
      id: `APC-INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'Received',
    };

    store.inquiries.unshift(inquiry);
    saveStore(store);

    res.status(201).json({ inquiry });
  });

  app.post('/api/portal/login', (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const passcode = String(req.body?.passcode || '').trim();

    if (!email || !passcode) {
      res.status(400).json({ error: 'Please enter both your client email and passcode.' });
      return;
    }

    const user = store.users.find((u) => u.email.toLowerCase() === email);
    if (!user || !verifyPassword(passcode, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid investor credentials. Please verify your email and passcode.' });
      return;
    }

    const token = signSessionToken(user.id, user.email);
    res.cookie('arish_portal_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const userBookings = store.bookings.filter(
      (b) => b.email.toLowerCase() === user.email.toLowerCase(),
    );

    res.json({
      token,
      user: sanitizeUser(user),
      bookings: userBookings,
    });
  });

  app.post('/api/portal/register', (req: Request, res: Response) => {
    const fullName = String(req.body?.fullName || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const phone = String(req.body?.phone || '').trim();
    const passcode = String(req.body?.passcode || '').trim();

    if (fullName.length < 2 || !email.includes('@') || phone.length < 10 || passcode.length < 6) {
      res.status(400).json({
        error: 'Provide full name, valid email, mobile number, and a passcode (minimum 6 characters).',
      });
      return;
    }

    if (store.users.some((u) => u.email.toLowerCase() === email)) {
      res.status(409).json({ error: 'An investor portal account with this email already exists.' });
      return;
    }

    const newUser: PortalUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      fullName,
      email,
      phone,
      clientCode: `APC-INV-${Math.floor(3000 + Math.random() * 6000)}`,
      passwordHash: hashPassword(passcode),
      portfolio: {
        totalInvestedPkr: 0,
        currentValuationPkr: 0,
        unrealizedGainPercent: 0,
        annualRentalIncomePkr: 0,
        holdings: [],
        installments: [],
        documents: [
          {
            docId: `DOC-WELCOME-${Date.now().toString().slice(-4)}`,
            title: 'Investor Onboarding & KYC Mandate Letter',
            category: 'Account Onboarding',
            issuedDate: new Date().toISOString().slice(0, 10),
            verificationHash: `APC-KYC-${Math.floor(10000 + Math.random() * 89999)}`,
            summaryText: `ARISH PROPERTY CONSULTANTS — INVESTOR ONBOARDING MANDATE\nClient: ${fullName}\nEmail: ${email}\nAdvisory Office: Suite No. 302, 3rd Floor, Fortune Towers, Main Shahrah-e-Faisal, Block-6 PECHS, Karachi\nDirect Line: 03075522866`,
          },
        ],
      },
    };

    store.users.push(newUser);
    saveStore(store);

    const token = signSessionToken(newUser.id, newUser.email);
    res.cookie('arish_portal_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    const userBookings = store.bookings.filter(
      (b) => b.email.toLowerCase() === newUser.email.toLowerCase(),
    );

    res.status(201).json({
      token,
      user: sanitizeUser(newUser),
      bookings: userBookings,
    });
  });

  app.get('/api/portal/me', (req: Request, res: Response) => {
    const token = getTokenFromRequest(req);
    if (!token) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const decoded = verifySessionToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'Session expired' });
      return;
    }

    const user = store.users.find((u) => u.id === decoded.sub);
    if (!user) {
      res.status(401).json({ error: 'Account not found' });
      return;
    }

    const userBookings = store.bookings.filter(
      (b) => b.email.toLowerCase() === user.email.toLowerCase(),
    );

    res.json({
      user: sanitizeUser(user),
      bookings: userBookings,
    });
  });

  app.post('/api/portal/logout', (_req: Request, res: Response) => {
    res.clearCookie('arish_portal_token');
    res.json({ ok: true });
  });

  app.get('/api/portal/documents/:docId', (req: Request, res: Response) => {
    const token = getTokenFromRequest(req);
    const decoded = token ? verifySessionToken(token) : null;
    if (!decoded) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = store.users.find((u) => u.id === decoded.sub);
    const doc = user?.portfolio.documents.find((d) => d.docId === req.params.docId);
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.docId}.txt"`);
    res.send(doc.summaryText);
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*splat', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ARISH PROPERTY CONSULTANTS server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
