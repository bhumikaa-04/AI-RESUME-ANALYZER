const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs/promises')
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')
const Resume = require('../models/Resume')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

const uploadDir = path.join(__dirname, '..', 'uploads')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    const allowedExtensions = ['.pdf', '.docx']
    const extension = path.extname(file.originalname).toLowerCase()

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(extension)) {
      cb(null, true)
      return
    }

    cb(new Error('Only PDF and DOCX files are supported'))
  },
})

const skillKeywords = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'HTML',
  'CSS',
  'Python',
  'Java',
  'C++',
  'SQL',
  'Git',
  'GitHub',
  'REST API',
  'Redux',
  'Next.js',
  'Tailwind',
  'Machine Learning',
  'Docker',
  'Kubernetes',
  'CI/CD',
]

const stopWords = new Set([
  'and', 'the', 'with', 'for', 'that', 'this', 'from', 'your', 'you', 'are', 'our',
  'will', 'must', 'have', 'has', 'into', 'over', 'more', 'than', 'any', 'all', 'not',
  'role', 'job', 'position', 'work', 'team', 'teams', 'experience', 'years', 'year',
  'skills', 'skill', 'ability', 'abilities', 'knowledge', 'candidate', 'candidates',
  'responsibilities', 'responsibility', 'requirements', 'requirement', 'preferred',
  'strong', 'good', 'excellent', 'using', 'use', 'used', 'based', 'etc', 'etc.',
])

const synonymGroups = {
  'web developer': ['javascript', 'react', 'node.js', 'express', 'html', 'css', 'frontend', 'backend', 'api'],
  'frontend': ['react', 'html', 'css', 'javascript', 'typescript', 'tailwind', 'redux'],
  'backend': ['node.js', 'express', 'api', 'mongodb', 'sql', 'rest api'],
  'back-end': ['node.js', 'express', 'api', 'mongodb', 'sql', 'rest api'],
  'user interface': ['html', 'css', 'react', 'frontend', 'tailwind'],
  'user interfaces': ['html', 'css', 'react', 'frontend', 'tailwind'],
  'responsive': ['html', 'css', 'react', 'tailwind', 'frontend'],
  'api integration': ['api', 'rest api', 'express', 'node.js'],
  'api': ['api', 'rest api', 'express', 'node.js'],
  'troubleshooting': ['debugging', 'testing', 'git', 'github'],
}

function normalizeToken(token) {
  return token.toLowerCase().replace(/\s+/g, ' ').trim()
}

function expandTerms(text) {
  const normalizedText = normalizeToken(text)
  const terms = new Set()

  for (const [phrase, expansions] of Object.entries(synonymGroups)) {
    if (normalizedText.includes(phrase)) {
      terms.add(phrase)
      expansions.forEach((term) => terms.add(term))
    }
  }

  return terms
}

function normalizeKeyword(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

function extractKeywordSet(text) {
  const normalizedText = text.toLowerCase()
  const keywords = new Set()

  expandTerms(normalizedText).forEach((term) => keywords.add(normalizeToken(term)))

  for (const skill of skillKeywords) {
    if (normalizedText.includes(skill.toLowerCase())) {
      keywords.add(normalizeKeyword(skill))
    }
  }

  const tokens = normalizedText
    .replace(/[^a-z0-9.+/#\-\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token && token.length > 2 && !stopWords.has(token))

  for (const token of tokens) {
    if (token === 'node' || token === 'nodejs') {
      keywords.add('node.js')
      continue
    }

    if (token === 'reactjs') {
      keywords.add('react')
      continue
    }

    if (token === 'mongodb' || token === 'mongo') {
      keywords.add('mongodb')
      continue
    }

    keywords.add(token)
  }

  return keywords
}

function extractSkills(text) {
  const lowerText = text.toLowerCase()
  return skillKeywords.filter((skill) => lowerText.includes(skill.toLowerCase()))
}

function extractTopKeywords(text, limit = 12) {
  const frequency = new Map()
  const normalized = text.toLowerCase().replace(/[^a-z0-9.+/#\-\s]/g, ' ')

  normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token && token.length > 2 && !stopWords.has(token))
    .forEach((token) => {
      const nextCount = (frequency.get(token) || 0) + 1
      frequency.set(token, nextCount)
    })

  return [...frequency.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([keyword]) => keyword)
}

function calculateMatchScore(resumeKeywords, jobKeywords, resumeSkills, jobDescription) {
  const exactSkillMatches = resumeSkills.filter((skill) => jobKeywords.has(skill.toLowerCase()))
  const semanticMatches = [...resumeKeywords].filter((keyword) => jobKeywords.has(keyword))

  const uniqueResumeSkills = Math.max(1, resumeSkills.length)
  const exactSkillScore = Math.round((exactSkillMatches.length / uniqueResumeSkills) * 60)
  const semanticScore = jobKeywords.size
    ? Math.round((semanticMatches.length / jobKeywords.size) * 40)
    : 0

  const bonusTerms = ['web developer', 'frontend', 'backend', 'api', 'react', 'node.js']
  const jobHasRelevantRole = bonusTerms.some((term) => jobDescription.includes(term))
  const resumeHasRelevantStack = ['react', 'node.js', 'express', 'html', 'css', 'javascript'].some((term) =>
    [...resumeKeywords].includes(term)
  )

  const bonus = jobHasRelevantRole && resumeHasRelevantStack ? 10 : 0

  return Math.min(100, exactSkillScore + semanticScore + bonus)
}

function getMissingSkills(skills) {
  const targetSkills = ['JavaScript', 'React', 'Node.js', 'Git', 'MongoDB', 'SQL']
  return targetSkills.filter((skill) => !skills.includes(skill))
}

function calculateAtsScore(skills, text) {
  const baseScore = Math.min(100, skills.length * 12)
  const textBonus = text && text.length > 1000 ? 10 : 0
  return Math.min(100, baseScore + textBonus)
}

function estimateExperience(text) {
  const years = text.match(/(\d+)\+?\s+years?/i)
  return years ? Number(years[1]) : 0
}

async function parseResumeText(filePath, mimeType) {
  if (mimeType === 'application/pdf' || path.extname(filePath).toLowerCase() === '.pdf') {
    const buffer = await fs.readFile(filePath)

    // Some PDFs (often scanner/export variants) fail on the default parser version.
    // Retry with a newer parser bundle before marking the file as unreadable.
    try {
      const result = await pdfParse(buffer)
      return result.text || ''
    } catch (firstError) {
      try {
        const fallbackResult = await pdfParse(buffer, { version: 'v2.0.550' })
        return fallbackResult.text || ''
      } catch (secondError) {
        const combinedMessage = `${firstError?.message || ''} ${secondError?.message || ''}`.toLowerCase()
        if (combinedMessage.includes('xref') || combinedMessage.includes('formaterror') || combinedMessage.includes('invalid pdf')) {
          const error = new Error('Unreadable PDF structure')
          error.code = 'UNREADABLE_PDF'
          throw error
        }

        throw secondError
      }
    }
  }

  const result = await mammoth.extractRawText({ path: filePath })
  return result.value || ''
}

router.post('/upload', requireAuth, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF or DOCX file' })
  }

  const filePath = req.file.path

  try {
    const text = await parseResumeText(filePath, req.file.mimetype)

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: 'Could not extract text from this file. Please upload a text-based PDF or DOCX.',
      })
    }

    const skills = extractSkills(text)
    const missingSkills = getMissingSkills(skills)
    const atsScore = calculateAtsScore(skills, text)
    const wordCount = text.split(/\s+/).filter(Boolean).length
    const experience = estimateExperience(text)
    const topKeywords = extractTopKeywords(text)

    const resume = await Resume.create({
      userId: req.user.sub,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      text,
      skills,
      missingSkills,
      atsScore,
      wordCount,
      experience,
    })

    return res.json({
      message: 'Resume analyzed successfully',
      id: resume._id.toString(),
      atsScore,
      skills,
      missingSkills,
      wordCount,
      experience,
      topKeywords,
      suggestions: [
        missingSkills.length ? `Add ${missingSkills[0]} to strengthen your resume` : 'Your resume already covers the core keywords',
        skills.length < 5 ? 'Add more role-specific keywords to improve ATS match' : 'Good keyword coverage detected',
        experience > 0 ? `Detected about ${experience} years of experience` : 'No clear years of experience detected',
      ],
    })
  } catch (error) {
    if (error.code === 'UNREADABLE_PDF') {
      return res.status(400).json({
        message: 'This PDF appears corrupted or image-only. Please re-export it as a standard PDF or upload DOCX.',
      })
    }

    console.error('Upload error:', error.message)
    return res.status(500).json({ message: 'Could not analyze resume' })
  } finally {
    await fs.unlink(filePath).catch(() => {})
  }
})

router.get('/history', requireAuth, async (req, res) => {
  try {
    const history = await Resume.find({ userId: req.user.sub })
      .sort({ createdAt: -1 })
      .select('originalName atsScore skills missingSkills wordCount experience createdAt')

    return res.json({
      items: history.map((item) => ({
        id: item._id.toString(),
        fileName: item.originalName,
        atsScore: item.atsScore,
        skills: item.skills,
        missingSkills: item.missingSkills,
        wordCount: item.wordCount,
        experience: item.experience,
        createdAt: item.createdAt,
      })),
    })
  } catch (error) {
    console.error('History error:', error)
    return res.status(500).json({ message: 'Could not load history' })
  }
})

router.get('/:id/analysis', requireAuth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.sub })
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    return res.json({
      id: resume._id.toString(),
      atsScore: resume.atsScore,
      skills: resume.skills,
      missingSkills: resume.missingSkills,
      wordCount: resume.wordCount,
      experience: resume.experience,
      createdAt: resume.createdAt,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return res.status(500).json({ message: 'Could not load analysis' })
  }
})

router.post('/:id/match', requireAuth, async (req, res) => {
  try {
    const jobDescription = (req.body.job_description || '').toLowerCase()
    if (!jobDescription) {
      return res.status(400).json({ message: 'Job description is required' })
    }

    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.sub })
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    const resumeKeywords = extractKeywordSet(resume.text || resume.skills.join(' '))
    const jobKeywords = extractKeywordSet(jobDescription)
    const matchedSkills = resume.skills.filter((skill) => jobKeywords.has(skill.toLowerCase()))
    const matchedKeywords = [...resumeKeywords].filter((keyword) => jobKeywords.has(keyword))
    const score = calculateMatchScore(resumeKeywords, jobKeywords, resume.skills, jobDescription)

    const missingKeywords = [...jobKeywords]
      .filter((keyword) => !resumeKeywords.has(keyword))
      .filter((keyword) => !stopWords.has(keyword))
      .slice(0, 10)

    return res.json({
      score,
      matchedSkills,
      matchedKeywords,
      missingKeywords,
      jobKeywords: [...jobKeywords].slice(0, 20),
      summary: score >= 70
        ? 'Strong match'
        : score >= 40
          ? 'Moderate match'
          : 'Low match',
    })
  } catch (error) {
    console.error('Match error:', error)
    return res.status(500).json({ message: 'Could not calculate match' })
  }
})

module.exports = router