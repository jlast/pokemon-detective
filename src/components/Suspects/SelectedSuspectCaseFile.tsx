import { useEffect, useState } from 'react'
import type { Case, Suspect, SuspectInvestigationGroup, SuspectNoteStatus } from '../../game/caseModel'
import { getSuspectGroupDetails } from '../../game/suspectCaseFile'
import { MugShot } from './MugShot'

type SuspectNotebookTab = 'overview' | 'investigations'

interface SelectedSuspectCaseFileProps {
  selectedSuspect: Suspect | null
  currentCase: Case
  wrongAccusationIds: number[]
  setSuspectNoteStatus: (suspectId: number, noteStatus: SuspectNoteStatus) => void
  openAccusation: (suspectId: number) => void
  attemptsLeft: number
}

export function SelectedSuspectCaseFile({
  selectedSuspect,
  currentCase,
  wrongAccusationIds,
  setSuspectNoteStatus,
  openAccusation,
  attemptsLeft,
}: SelectedSuspectCaseFileProps) {
  const [activeTab, setActiveTab] = useState<SuspectNotebookTab>('overview')

  useEffect(() => {
    setActiveTab('overview')
  }, [selectedSuspect?.pokemonId])

  if (!selectedSuspect) {
    return (
      <div className="suspect-notebook-shell">
        <div className="suspect-notebook-tabs" role="tablist" aria-label="Suspect file sections">
          <button type="button" role="tab" aria-selected className="suspect-notebook-tab is-active">
            Overview
          </button>
        </div>
        <section className="selected-suspect-casefile dossier-panel notebook-card">
          <div className="suspect-notebook-body">
            <div className="selected-suspect-empty inspect-item">
              <strong>Select a suspect to open their case file.</strong>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const groupDetails = getSuspectGroupDetails(selectedSuspect.pokemonId)
  const noteOptions: Array<{ value: SuspectNoteStatus; label: string }> = [
    { value: 'suspect', label: 'Suspect' },
    { value: 'ruled-out', label: 'Cleared' },
  ]
  const investigationGroups: SuspectInvestigationGroup[] = ['appearance', 'records', 'habitat']
  const notebookTabs: Array<{ key: SuspectNotebookTab; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'investigations', label: 'Investigations' },
  ]
  const isFalseLead = wrongAccusationIds.includes(selectedSuspect.pokemonId)
  const statusText = isFalseLead ? 'False Lead' : selectedSuspect.noteStatus === 'ruled-out' ? 'Cleared' : 'Suspect'
  const statusClassName = isFalseLead ? 'is-false-lead' : selectedSuspect.noteStatus === 'ruled-out' ? 'is-cleared' : 'is-suspect'
  const suspectIndex = currentCase.suspects.findIndex((suspect) => suspect.pokemonId === selectedSuspect.pokemonId)
  const caseFileNumber = String(suspectIndex + 1).padStart(2, '0')
  const inspectedCount = investigationGroups.filter((groupKey) => selectedSuspect.inspectedGroups[groupKey]).length

  return (
    <div className="suspect-notebook-shell">
      <div className="suspect-notebook-tabs" role="tablist" aria-label="Suspect file sections">
        {notebookTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`suspect-notebook-tab ${activeTab === tab.key ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="selected-suspect-casefile dossier-panel notebook-card">
        <div className="suspect-notebook-body">
          {activeTab === 'overview' ? (
            <div className="selected-suspect-overview-grid">
            <section className="selected-suspect-section selected-suspect-section-plain inspect-item suspect-overview-identity">
              <p className="dossier-file-number">Case File #{caseFileNumber}</p>
              <div className="selected-suspect-mugshot mugshot-frame">
                <MugShot suspect={selectedSuspect} />
                <span className="mugshot-label">{selectedSuspect.name}</span>
              </div>
              <div className="selected-suspect-status-row">
                <span className="selected-suspect-status-label">Status</span>
                <span className={`status-stamp ${statusClassName}`}>{statusText}</span>
                </div>
                <div className="suspect-overview-progress">
                  <strong>Investigation progress</strong>
                  <div className="suspect-overview-progress-track" aria-hidden="true">
                    {investigationGroups.map((groupKey) => (
                      <span
                        key={groupKey}
                        className={`suspect-overview-progress-step ${selectedSuspect.inspectedGroups[groupKey] ? 'is-complete' : ''}`}
                      />
                    ))}
                  </div>
                  <p className="overview-section-hook">{inspectedCount} / {investigationGroups.length} folders inspected</p>
                </div>
              </section>

              <section className="selected-suspect-section inspect-item detective-notes suspect-overview-notes">
                <strong>Detective Notes</strong>
                <p className="overview-section-hook">The game never marks suspects automatically.</p>
                {isFalseLead ? (
                  <p className="overview-section-hook">This Pokemon was a false lead. You already accused them incorrectly.</p>
                ) : (
                  <div className="suspect-note-options">
                    {noteOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`secondary-button suspect-note-button ${selectedSuspect.noteStatus === option.value ? 'is-pressed' : ''}`}
                        onClick={() => setSuspectNoteStatus(selectedSuspect.pokemonId, option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {!isFalseLead ? (
                <div className="selected-suspect-actions suspect-overview-decision">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => openAccusation(selectedSuspect.pokemonId)}
                    disabled={currentCase.status !== 'active' || attemptsLeft <= 0}
                  >
                    Accuse this Pokemon
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {activeTab === 'investigations' ? (
            <section className="selected-suspect-section">
              <div className="suspect-case-section-heading">
                <h3>Open folders</h3>
              </div>

              <div className="suspect-group-list">
                {investigationGroups.map((groupKey) => {
                  const group = groupDetails[groupKey]

                  return (
                    <article
                      key={groupKey}
                      className="suspect-group-card folder-section folder-section-open is-open"
                    >
                      <div className="suspect-group-toggle">
                        <div>
                          <strong>
                            <span className="suspect-group-icon" aria-hidden="true">📂</span>
                            {group.title}
                          </strong>
                          <p className="subtle-text">{group.prompt}</p>
                        </div>
                      </div>

                      <div className="suspect-group-details">
                        {group.rows.map((row) => (
                          <div key={row.label} className="suspect-group-row">
                            <span className="suspect-group-label">{row.label}</span>
                            <span>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  )
}
