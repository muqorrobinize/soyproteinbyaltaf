import { createClient as createServiceClient } from '@supabase/supabase-js'
import QrManager from './QrManager'

export const dynamic = 'force-dynamic';

export default async function AdminQrPage() {
  const supabaseAdmin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: codes } = await supabaseAdmin.from('qr_codes').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>QR Codes</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Klik baris untuk preview &amp; download gambar QR. QR encode URL langsung ke halaman redeem.
        </p>
      </div>
      <QrManager initialCodes={codes || []} />
    </div>
  )
}
