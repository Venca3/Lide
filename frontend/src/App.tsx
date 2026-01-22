import { useEffect, useState } from 'react'
import { api } from './api'
import './App.css'
import { PersonDetail } from './personDetail'

type PersonView = {
  id: string
  firstName: string
  lastName: string
  nickname?: string | null
  birthDate?: string | null
  phone?: string | null
  email?: string | null
  note?: string | null
}

type PersonCreate = {
  firstName: string
  lastName?: string
  nickname?: string
}

export default function App() {
  const [items, setItems] = useState<PersonView[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nickname, setNickname] = useState('')

  const [selectedId, setSelectedId] = useState<string | null>(null)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const data = await api<PersonView[]>('/api/persons')
      setItems(data)
    } catch (e: any) {
      setError(e?.message ?? 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function createPerson() {
    setError(null)
    const payload: PersonCreate = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      nickname: nickname.trim() || undefined,
    }

    if (!payload.firstName) {
      setError('First name is required')
      return
    }

    try {
      const created = await api<PersonView>('/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      })

      setItems((prev) => [created, ...prev])
      setFirstName('')
      setLastName('')
      setNickname('')
    } catch (e: any) {
      setError(e?.message ?? 'Create failed')
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Lidé</h1>

      <div style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <label>First name</label>
          <br />
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>

        <div>
          <label>Last name</label>
          <br />
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div>
          <label>Nickname</label>
          <br />
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </div>

        <button onClick={createPerson} style={{ height: 30 }}>
          Add
        </button>

        <button onClick={load} style={{ height: 30 }}>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: '#ffe5e5', border: '1px solid #ffb3b3', padding: 10, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th>Name</th>
              <th>Nickname</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr
                key={p.id}
                style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                onClick={() => setSelectedId(p.id)}
                title="Open detail"
              >
                <td>
                  {p.firstName} {p.lastName}
                </td>
                <td>{p.nickname ?? ''}</td>
                <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}>{p.id}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: '#777' }}>
                  No persons yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {selectedId && (
        <div style={{ marginTop: 16 }}>
          <PersonDetail personId={selectedId} onClose={() => setSelectedId(null)} />
        </div>
      )}
    </div>
  )
}
