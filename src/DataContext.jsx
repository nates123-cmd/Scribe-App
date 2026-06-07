// Loads the user's Scribe data from Supabase (seeding demo fixtures on first
// run) and exposes it + the prototype helpers, bound to the loaded data, via
// context. Replaces the old module-level fixture imports the screens used.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loadAll, seedIfEmpty } from './lib/db'

const DataCtx = createContext(null)
export function useData() { return useContext(DataCtx) }

export function DataProvider({ children }) {
  const [areas, setAreas] = useState([])
  const [notes, setNotes] = useState([])
  const [inbox, setInbox] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      setStatus('loading')
      await seedIfEmpty()
      const data = await loadAll()
      setAreas(data.areas); setNotes(data.notes); setInbox(data.inbox)
      setStatus('ready')
    } catch (e) {
      setError(e); setStatus('error')
    }
  }
  useEffect(() => { load() }, [])

  // Helpers bound to the loaded data — same semantics as the prototype's
  // module-level helpers (notably actionsForProject: roll up BY ASSIGNMENT).
  const value = useMemo(() => {
    const noteById = (id) => notes.find((n) => n.id === id)
    const projectName = (id) => {
      for (const a of areas) { const p = a.projects.find((x) => x.id === id); if (p) return p.name }
      return null
    }
    const areaOfProject = (id) => areas.find((a) => a.projects.some((p) => p.id === id))
    const areaName = (id) => { const a = areas.find((x) => x.id === id); return a ? a.name : null }
    const ownedNotes = (id) => notes.filter((n) => n.project === id)
    const linkedMeetings = (id) => notes.filter((n) => n.project !== id && (n.projects || []).includes(id))
    const actionsForProject = (id) => {
      const out = []
      notes.forEach((n) => {
        if (n.kind !== 'meeting' || !n.actions) return
        n.actions.forEach((a) => {
          const belongs = a.project ? a.project === id : n.project === id
          if (belongs) out.push({ ...a, meeting: n.title, mid: n.id, linked: n.project !== id })
        })
      })
      return out
    }
    const notesByTag = (tag) => notes.filter((n) => n.tags.includes(tag))
    const ALL_TAGS = [...new Set(notes.flatMap((n) => n.tags))].sort()
    return {
      areas, notes, inbox, status, error, reload: load,
      noteById, projectName, areaOfProject, areaName,
      ownedNotes, linkedMeetings, actionsForProject, notesByTag, ALL_TAGS,
    }
  }, [areas, notes, inbox, status, error])

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}
