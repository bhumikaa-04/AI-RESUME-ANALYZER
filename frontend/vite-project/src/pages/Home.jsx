import { useNavigate } from 'react-router-dom'

const features = [
  { icon:'🧠', color:'rgba(108,99,255,0.15)', title:'AI-Powered Analysis', desc:'Deep NLP analysis extracts skills, experience, and keywords from your resume instantly.' },
  { icon:'🎯', color:'rgba(255,107,157,0.15)', title:'ATS Score', desc:'See exactly how Applicant Tracking Systems score your resume and what to fix.' },
  { icon:'🔍', color:'rgba(0,212,170,0.15)', title:'Job Matching', desc:'Paste any job description and get an instant match score with keyword gaps.' },
  { icon:'💡', color:'rgba(255,180,50,0.15)', title:'Smart Suggestions', desc:'Get actionable tips to improve your resume for your target role.' },
  { icon:'📊', color:'rgba(108,99,255,0.15)', title:'Skill Gap Analysis', desc:'Identify missing skills and get recommendations to close the gap.' },
  { icon:'⚡', color:'rgba(0,212,170,0.15)', title:'Instant Results', desc:'Get your full analysis in under 30 seconds. No waiting, no fluff.' },
]

export default function Home() {
  const navigate = useNavigate()
  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign:'center', padding:'5rem 2rem 3rem', maxWidth:800, margin:'0 auto' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6,
          background:'rgba(108,99,255,0.12)', border:'1px solid rgba(108,99,255,0.3)',
          borderRadius:100, padding:'6px 16px', fontSize:12, color:'#6C63FF',
          marginBottom:'2rem', fontWeight:500 }}>
          ✨ AI-Powered Resume Intelligence
        </div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(2.5rem,6vw,4rem)',
          fontWeight:800, lineHeight:1.1, marginBottom:'1.5rem' }}>
          Land More Interviews<br/>
          <span style={{ background:'linear-gradient(135deg,#6C63FF,#FF6B9D)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            With AI Analysis
          </span>
        </h1>
        <p style={{ color:'#8A8A9E', fontSize:'1.1rem', lineHeight:1.7,
          marginBottom:'2.5rem', maxWidth:540, margin:'0 auto 2.5rem' }}>
          Upload your resume and get instant feedback on ATS compatibility,
          skill gaps, and personalized suggestions to beat the competition.
        </p>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/auth')} style={{
            background:'linear-gradient(135deg,#6C63FF,#8B7FFF)', color:'#fff',
            border:'none', padding:'14px 32px', borderRadius:12, fontSize:15,
            fontWeight:500, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
            Analyze My Resume →
          </button>
          <button onClick={() => navigate('/auth')} style={{
            background:'transparent', color:'#F0EFF8', border:'1px solid #2A2A38',
            padding:'14px 32px', borderRadius:12, fontSize:15, fontWeight:500,
            cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
            See Demo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', justifyContent:'center', gap:'3rem', padding:'2rem',
        borderTop:'1px solid #2A2A38', borderBottom:'1px solid #2A2A38',
        background:'#13131A', flexWrap:'wrap' }}>
        {[['50K+','Resumes Analyzed'],['94%','ATS Pass Rate'],['3x','More Interviews'],['< 30s','Analysis Time']].map(([num, label]) => (
          <div key={label} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:'1.8rem', fontWeight:700 }}>{num}</div>
            <div style={{ fontSize:12, color:'#8A8A9E', marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding:'4rem 2rem', maxWidth:1100, margin:'0 auto' }}>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.8rem', fontWeight:700,
          textAlign:'center', marginBottom:'3rem' }}>Everything You Need to Get Hired</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.5rem' }}>
          {features.map(f => (
            <div key={f.title} style={{ background:'#1C1C26', border:'1px solid #2A2A38',
              borderRadius:16, padding:'1.5rem', transition:'border-color 0.2s,transform 0.2s',
              cursor:'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#6C63FF'; e.currentTarget.style.transform='translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#2A2A38'; e.currentTarget.style.transform='translateY(0)' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:f.color,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:20, marginBottom:'1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'#8A8A9E', lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}