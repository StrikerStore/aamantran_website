import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

const CREAM = '#f5f1eb';
const BURGUNDY = '#6e1f2e';
const GOLD = '#c9922a';

/** Branded 1200×630 Open Graph card used as the default share image site-wide. */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: CREAM,
          padding: 40,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${GOLD}`,
            borderRadius: 16,
            padding: 48,
          }}
        >
          <div style={{ display: 'flex', fontSize: 26, letterSpacing: 10, color: GOLD, textTransform: 'uppercase' }}>
            Digital Wedding Invitations
          </div>
          <div style={{ display: 'flex', fontSize: 120, fontWeight: 700, color: BURGUNDY, marginTop: 18 }}>
            Aamantran
          </div>
          <div style={{ display: 'flex', fontSize: 32, color: '#4a3f38', marginTop: 22, textAlign: 'center' }}>
            Your love story, beautifully told.
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 44 }}>
            {['From ₹999', 'WhatsApp-ready', 'Live RSVP tracking'].map(label => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  fontSize: 26,
                  color: CREAM,
                  background: BURGUNDY,
                  padding: '12px 28px',
                  borderRadius: 999,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
