import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { questionnaireController } from './src/controllers/questionnaireController'
import { connectDB } from './src/config/db'

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Questionnaire Scoring API',
  })
})

// API Routes
const apiRouter = express.Router()

// Questionnaire endpoints
apiRouter.post('/questionnaires', questionnaireController.submitQuestionnaire)
apiRouter.get('/questionnaires', questionnaireController.getAllQuestionnaires)
apiRouter.get(
  '/questionnaires/summaries',
  questionnaireController.getQuestionnaireSummaries
)
apiRouter.get(
  '/questionnaires/:name',
  questionnaireController.getQuestionnairesByName
)

app.use('/api', apiRouter)

app.get('/', (req, res) => {
  res.json({
    message: 'Questionnaire Scoring API',
    version: '1.0.0',
    endpoints: {
      'POST /api/questionnaires': 'Submit a questionnaire response',
      'GET /api/questionnaires': 'Get all questionnaire responses',
      'GET /api/questionnaires/summaries': 'Get questionnaire summaries',
      'GET /api/questionnaires/:name':
        'Get questionnaire responses for a specific name',
      'GET /health': 'Health check',
    },
    sampleSubmission: {
      name: 'John Doe',
      questionnaireRef: 'optional-questionnaire-ref',
      sections: [
        {
          sectionName: 'Communication Skills',
          questions: [
            {
              questionId: 'q1',
              questionText: 'Rate communication effectiveness',
              score: 4,
            },
            {
              questionId: 'q2',
              questionText: 'How well do you listen to others?',
              score: 5,
            },
          ],
        },
        {
          sectionName: 'Leadership',
          questions: [
            {
              questionId: 'q3',
              questionText: 'Rate your leadership abilities',
              score: 3,
            },
          ],
        },
      ],
    },
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
  })
})

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Something went wrong',
    })
  }
)

app.listen(PORT, () => {
  console.log(`🚀 Questionnaire Scoring API server running on port ${PORT}`)
  console.log(`📖 API Documentation available at http://localhost:${PORT}`)
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`)
})

export default app
