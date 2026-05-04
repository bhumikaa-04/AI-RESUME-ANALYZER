import { useEffect, useState } from 'react'
import { resumeAPI } from '../services/api'

const tabs = ['Upload', 'Analysis', 'Job Match', 'History']

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Upload')
  const [file, setFile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [jd, setJd] = useState('')
  const [matchResult, setMatchResult] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const handleFile = (event) => setFile(event.target.files[0])

  const handleAnalyze = async () => {
    if (!file) {
      alert('Please upload a file first')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await resumeAPI.upload(formData)
      const data = response.data

      setAnalysis({
        id: data.id,
        ats_score: data.atsScore,
        skills: data.skills || [],
        missingSkills: data.missingSkills || [],
        word_count: data.wordCount ?? 0,
        experience: data.experience ?? 0,
        topKeywords: data.topKeywords || [],
        suggestions: data.suggestions || [],
      })
      setActiveTab('Analysis')
      setMatchResult(null)
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Error analyzing resume')
    } finally {
      setLoading(false)
    }
  }

  const handleMatch = async () => {
    if (!analysis?.id || !jd) return

    try {
      const response = await resumeAPI.matchJob(analysis.id, jd)
      setMatchResult(response.data)
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Match failed')
    }
  }

  useEffect(() => {
    if (activeTab !== 'History') {
      return
    }

    let isActive = true

    const loadHistory = async () => {
      setHistoryLoading(true)
      try {
        const response = await resumeAPI.getHistory()
        if (isActive) {
          setHistory(response.data.items || [])
        }
      } catch (error) {
        console.error(error)
        if (isActive) {
          setHistory([])
        }
      } finally {
        if (isActive) {
          setHistoryLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      isActive = false
    }
  }, [activeTab])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 61px)' }}>
      <div style={{ background: '#13131A', borderRight: '1px solid #2A2A38', padding: '1.5rem' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#8A8A9E', textTransform: 'uppercase',
          letterSpacing: '0.08em', marginBottom: '1rem' }}>Navigation</div>
        {tabs.map((tab) => (
          <div key={tab} onClick={() => setActiveTab(tab)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 10, cursor: 'pointer', fontSize: 14, marginBottom: 4,
            color: activeTab === tab ? '#F0EFF8' : '#8A8A9E',
            background: activeTab === tab ? 'rgba(108,99,255,0.12)' : 'transparent',
            borderLeft: activeTab === tab ? '2px solid #6C63FF' : '2px solid transparent',
            transition: 'all 0.2s'
          }}>{tab}</div>
        ))}
      </div>

      <div style={{ padding: '2rem', overflowY: 'auto' }}>
        {activeTab === 'Upload' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>Upload Resume</h2>
              <p style={{ color: '#8A8A9E', fontSize: 14 }}>Upload your resume to get AI-powered analysis</p>
            </div>
            <label style={{ display: 'block', border: '2px dashed #2A2A38', borderRadius: 20,
              padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
              background: '#13131A', transition: 'all 0.3s' }}>
              <input type="file" accept=".pdf,.docx" onChange={handleFile} style={{ display: 'none' }} />
              <div style={{ fontSize: 48, marginBottom: '1rem' }}>📄</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 8 }}>
                {file ? file.name : 'Drop your resume here'}
              </h3>
              <p style={{ color: '#8A8A9E', fontSize: 14 }}>
                {file ? `${(file.size / 1024).toFixed(0)} KB — Click to change` : 'Click to browse or drag and drop'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1rem' }}>
                {['PDF', 'DOCX'].map((type) => (
                  <span key={type} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                    background: 'rgba(108,99,255,0.15)', color: '#A09AFF',
                    border: '1px solid rgba(108,99,255,0.25)' }}>{type}</span>
                ))}
              </div>
            </label>
            {file && (
              <button onClick={handleAnalyze} disabled={loading} style={{
                marginTop: '1.5rem', background: 'linear-gradient(135deg,#6C63FF,#8B7FFF)',
                color: '#fff', border: 'none', padding: '13px 32px', borderRadius: 12,
                fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif',
                opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Analyzing...' : 'Analyze Resume →'}
              </button>
            )}
          </div>
        )}

        {activeTab === 'Analysis' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>Analysis Results</h2>
              <p style={{ color: '#8A8A9E', fontSize: 14 }}>AI-powered insights from your resume</p>
            </div>
            {!analysis ? (
              <p style={{ color: '#8A8A9E' }}>No analysis yet — upload a resume first.</p>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    ['ATS Score', analysis.ats_score ?? '—', '#00D4AA'],
                    ['Skills Found', analysis.skills?.length ?? '—', '#6C63FF'],
                    ['Word Count', analysis.word_count ?? '—', '#FF6B9D'],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ background: '#1C1C26', border: '1px solid #2A2A38',
                      borderRadius: 14, padding: '1.25rem' }}>
                      <div style={{ fontSize: 11, color: '#8A8A9E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>
                {analysis.skills?.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: '#8A8A9E' }}>Detected Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {analysis.skills.map((skill) => (
                        <span key={skill} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                          background: 'rgba(0,212,170,0.1)', color: '#4EEFD1',
                          border: '1px solid rgba(0,212,170,0.3)' }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.suggestions?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: '#8A8A9E' }}>Suggestions</div>
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} style={{ background: '#1C1C26', border: '1px solid #2A2A38',
                        borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 10,
                        display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,180,50,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>💡</div>
                        <p style={{ fontSize: 13, color: '#8A8A9E', lineHeight: 1.6 }}>{suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
                {analysis.topKeywords?.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: '#8A8A9E' }}>Top Resume Keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {analysis.topKeywords.map((keyword) => (
                        <span key={keyword} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                          background: 'rgba(108,99,255,0.12)', color: '#A09AFF',
                          border: '1px solid rgba(108,99,255,0.25)' }}>{keyword}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Job Match' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>Job Description Matcher</h2>
              <p style={{ color: '#8A8A9E', fontSize: 14 }}>Paste a job description to see how well your resume matches</p>
            </div>
            <textarea value={jd} onChange={(event) => setJd(event.target.value)}
              placeholder="Paste the full job description here..."
              style={{ width: '100%', background: '#13131A', border: '1px solid #2A2A38',
                borderRadius: 12, padding: '1rem', color: '#F0EFF8',
                fontFamily: 'DM Sans,sans-serif', fontSize: 14, minHeight: 160,
                outline: 'none', resize: 'vertical', marginBottom: '1rem' }} />
            <button onClick={handleMatch} style={{
              background: 'linear-gradient(135deg,#6C63FF,#8B7FFF)', color: '#fff',
              border: 'none', padding: '12px 28px', borderRadius: 10, fontSize: 15,
              fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
              Match Resume →
            </button>
            {matchResult && (
              <div style={{ marginTop: '1.5rem', background: '#1C1C26',
                border: '1px solid #2A2A38', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Match Score</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '2rem', fontWeight: 700, color: '#00D4AA' }}>
                    {matchResult.score}%
                  </div>
                </div>
                <div style={{ marginBottom: 12, color: '#8A8A9E', fontSize: 13 }}>
                  {matchResult.summary || 'Match complete'}
                </div>
                <div style={{ background: '#2A2A38', borderRadius: 100, height: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 100, width: `${matchResult.score}%`,
                    background: 'linear-gradient(90deg,#6C63FF,#FF6B9D)', transition: 'width 1s ease' }} />
                </div>
                {matchResult.matchedSkills?.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: 13, color: '#8A8A9E', marginBottom: 8 }}>Matched skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {matchResult.matchedSkills.map((skill) => (
                        <span key={skill} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                          background: 'rgba(0,212,170,0.1)', color: '#4EEFD1',
                          border: '1px solid rgba(0,212,170,0.3)' }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {matchResult.missingKeywords?.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: 13, color: '#8A8A9E', marginBottom: 8 }}>Missing keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {matchResult.missingKeywords.map((keyword) => (
                        <span key={keyword} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                          background: 'rgba(255,180,50,0.1)', color: '#FFCA66',
                          border: '1px solid rgba(255,180,50,0.3)' }}>{keyword}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'History' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>Resume History</h2>
              <p style={{ color: '#8A8A9E', fontSize: 14 }}>Your previously analyzed resumes</p>
            </div>
            {historyLoading ? (
              <p style={{ color: '#8A8A9E' }}>Loading history...</p>
            ) : history.length ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {history.map((item) => (
                  <div key={item.id} style={{ background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: 14, padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: 8 }}>
                      <div style={{ fontWeight: 500 }}>{item.fileName}</div>
                      <div style={{ color: '#00D4AA', fontWeight: 700 }}>{item.atsScore}%</div>
                    </div>
                    <div style={{ color: '#8A8A9E', fontSize: 13 }}>
                      Skills: {item.skills?.join(', ') || 'None detected'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#8A8A9E' }}>No history yet — analyze a resume to see it here.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}