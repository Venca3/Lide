import { useEffect, useState } from 'react'
import { api } from './api'

type TagView = { id: string; name: string }

type EntryWithRole = {
  id: string
  type: string
  title?: string | null
  content: string
  occurredAt?: string | null
  role?: string | null
}

type RelationView = {
  id: string
  fromPersonId: string
  toPersonId: string
  type: string
  note?: string | null
  validFrom?: string | null
  validTo?: string | null
  otherPersonDisplayName?: string | null
}

export type PersonDetailView = {
  id: string
  firstName: string
  lastName?: string | null
  nickname?: string | null
  birthDate?: string | null
  phone?: string | null
  email?: string | null
  note?: string | null
  tags: TagView[]
  entries: EntryWithRole[]
  relationsOut: RelationView[]
  relationsIn: RelationView[]
}

export function PersonDetail(props: { personId: string; onClose: () => void }) {
  const { personId, onClose } = props

  const [data, setData] = useState<PersonDetailView | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const d = await api<PersonDetailView>(`/api/personread/${personId}`)
      setData(d)
    } catch (e: any) {
      setError(e?.message ?? 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [personId])

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h2 style={{ margin: 0 }}>Detail osoby</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load}>Refresh</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#ffe5e5', border: '1px solid #ffb3b3', padding: 10, marginTop: 10 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 10 }}>Loading…</div>
      ) : !data ? (
        <div style={{ marginTop: 10, color: '#777' }}>No data</div>
      ) : (
        <div style={{ marginTop: 10, display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {data.firstName} {data.lastName ?? ''}
              {data.nickname ? <span style={{ fontWeight: 400, color: '#666' }}> — {data.nickname}</span> : null}
            </div>
            <div style={{ color: '#666', fontSize: 13, marginTop: 4, fontFamily: 'ui-monospace, Menlo, monospace' }}>
              {data.id}
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 6px 0' }}>Tagy</h3>
            {data.tags.length === 0 ? (
              <div style={{ color: '#777' }}>—</div>
            ) : (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {data.tags.map((t) => (
                  <span key={t.id} style={{ padding: '2px 8px', border: '1px solid #ddd', borderRadius: 999 }}>
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ margin: '0 0 6px 0' }}>Záznamy (entries)</h3>
            {data.entries.length === 0 ? (
              <div style={{ color: '#777' }}>—</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {data.entries.map((e) => (
                  <li key={e.id}>
                    <b>{e.type}</b>
                    {e.title ? `: ${e.title}` : ''}
                    {e.role ? <span style={{ color: '#666' }}> (role: {e.role})</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0' }}>Vztahy OUT</h3>
              {data.relationsOut.length === 0 ? (
                <div style={{ color: '#777' }}>—</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {data.relationsOut.map((r) => (
                    <li key={r.id}>
                      <b>{r.type}</b> → {r.otherPersonDisplayName ?? r.toPersonId}
                      {r.note ? <span style={{ color: '#666' }}> — {r.note}</span> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 style={{ margin: '0 0 6px 0' }}>Vztahy IN</h3>
              {data.relationsIn.length === 0 ? (
                <div style={{ color: '#777' }}>—</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {data.relationsIn.map((r) => (
                    <li key={r.id}>
                      <b>{r.type}</b> ← {r.otherPersonDisplayName ?? r.fromPersonId}
                      {r.note ? <span style={{ color: '#666' }}> — {r.note}</span> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
