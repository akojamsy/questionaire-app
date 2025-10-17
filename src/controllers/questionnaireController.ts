import { Request, Response } from 'express'
import { questionnaireService } from '../services'

export const questionnaireController = {
  // POST /api/questionnaires - Accept questionnaire response
  async submitQuestionnaire(req: Request, res: Response) {
    try {
      const { name, questionnaireRef, sections } = req.body

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Name is required',
        })
      }

      if (!sections || !Array.isArray(sections) || sections.length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Sections array is required and must not be empty',
        })
      }

      // Validate sections structure
      for (const section of sections) {
        if (!section.sectionName) {
          return res.status(400).json({
            error: 'Validation Error',
            message: 'Each section must have a sectionName',
          })
        }

        if (!section.questions || !Array.isArray(section.questions)) {
          return res.status(400).json({
            error: 'Validation Error',
            message: 'Each section must have a questions array',
          })
        }

        // Validate questions structure
        for (const question of section.questions) {
          if (!question.questionId || !question.questionText) {
            return res.status(400).json({
              error: 'Validation Error',
              message: 'Each question must have questionId and questionText',
            })
          }

          if (question.score === undefined || question.score === null) {
            return res.status(400).json({
              error: 'Validation Error',
              message: 'Each question must have a score',
            })
          }

          if (
            typeof question.score !== 'number' ||
            question.score < 1 ||
            question.score > 5
          ) {
            return res.status(400).json({
              error: 'Validation Error',
              message: 'Score must be a number between 1 and 5',
            })
          }
        }
      }

      // Save the questionnaire response
      const savedResponse =
        await questionnaireService.saveQuestionnaireResponse({
          name,
          questionnaireRef: questionnaireRef || null,
          sections,
        })

      res.status(201).json({
        success: true,
        message: 'Questionnaire response submitted successfully',
        data: {
          id: savedResponse._id,
          name: savedResponse.name,
          questionnaireRef: savedResponse.questionnaireRef,
          sections: savedResponse.sections,
          createdAt: savedResponse.createdAt,
        },
      })
    } catch (error) {
      console.error('Error submitting questionnaire:', error)
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to submit questionnaire response',
      })
    }
  },

  // GET /api/questionnaires - Get all questionnaire responses
  async getAllQuestionnaires(req: Request, res: Response) {
    try {
      const responses =
        await questionnaireService.getAllQuestionnaireResponses()

      res.json({
        success: true,
        data: responses,
      })
    } catch (error) {
      console.error('Error fetching questionnaires:', error)
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch questionnaire responses',
      })
    }
  },

  // GET /api/questionnaires/:name - Get questionnaire responses by name
  async getQuestionnairesByName(req: Request, res: Response) {
    try {
      const { name } = req.params
      const responses =
        await questionnaireService.getQuestionnaireResponsesByName(name)

      res.json({
        success: true,
        data: responses,
      })
    } catch (error) {
      console.error('Error fetching questionnaires by name:', error)
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch questionnaire responses',
      })
    }
  },

  // GET /api/questionnaires/summaries - Get questionnaire summaries grouped by name
  async getQuestionnaireSummaries(req: Request, res: Response) {
    try {
      const summaries = await questionnaireService.getQuestionnaireSummaries()

      res.json({
        success: true,
        data: summaries,
      })
    } catch (error) {
      console.error('Error fetching questionnaire summaries:', error)
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch questionnaire summaries',
      })
    }
  },
}
