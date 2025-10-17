import { Response } from '../models/questionnaireSchema'

export interface QuestionnaireSubmission {
  name: string
  questionnaireRef?: string | null
  sections: Array<{
    sectionName: string
    questions: Array<{
      questionId: string
      questionText: string
      score: number
    }>
  }>
}

export const questionnaireService = {
  // Save a questionnaire response to the database
  async saveQuestionnaireResponse(submission: QuestionnaireSubmission) {
    try {
      const response = new Response({
        name: submission.name,
        questionnaireRef: submission.questionnaireRef,
        sections: submission.sections,
      })

      const savedResponse = await response.save()
      return savedResponse
    } catch (error) {
      console.error('Error saving questionnaire response:', error)
      throw new Error('Failed to save questionnaire response')
    }
  },

  // Get all questionnaire responses
  async getAllQuestionnaireResponses() {
    try {
      const responses = await Response.find().sort({ createdAt: -1 })
      return responses
    } catch (error) {
      console.error('Error fetching all questionnaire responses:', error)
      throw new Error('Failed to fetch questionnaire responses')
    }
  },

  // Get questionnaire responses by name
  async getQuestionnaireResponsesByName(name: string) {
    try {
      const responses = await Response.find({ name }).sort({ createdAt: -1 })
      return responses
    } catch (error) {
      console.error('Error fetching questionnaire responses by name:', error)
      throw new Error('Failed to fetch questionnaire responses by name')
    }
  },

  // Get questionnaire response by ID
  async getQuestionnaireResponseById(id: string) {
    try {
      const response = await Response.findById(id)
      return response
    } catch (error) {
      console.error('Error fetching questionnaire response by ID:', error)
      throw new Error('Failed to fetch questionnaire response')
    }
  },

  // Get questionnaire summaries grouped by name with average scores
  async getQuestionnaireSummaries() {
    try {
      const responses = await Response.find().sort({ createdAt: -1 })

      // Group responses by name
      const groupedByName: { [key: string]: any[] } = {}
      responses.forEach((response) => {
        if (!groupedByName[response.name]) {
          groupedByName[response.name] = []
        }
        groupedByName[response.name].push(response)
      })

      // Calculate summaries for each name
      const summaries = Object.keys(groupedByName).map((name) => {
        const userResponses = groupedByName[name]

        // Calculate section averages
        const sectionTotals: { [key: string]: { sum: number; count: number } } =
          {}
        let totalScoreSum = 0
        let totalScoreCount = 0

        userResponses.forEach((response) => {
          response.sections.forEach((section: any) => {
            const sectionName = section.sectionName
            if (!sectionName) return

            if (!sectionTotals[sectionName]) {
              sectionTotals[sectionName] = { sum: 0, count: 0 }
            }

            section.questions.forEach((question: any) => {
              if (question.score !== null && question.score !== undefined) {
                sectionTotals[sectionName].sum += question.score
                sectionTotals[sectionName].count++
                totalScoreSum += question.score
                totalScoreCount++
              }
            })
          })
        })

        // Calculate final averages
        const sectionAverages: { [key: string]: number } = {}
        Object.keys(sectionTotals).forEach((sectionName) => {
          if (sectionTotals[sectionName].count > 0) {
            sectionAverages[sectionName] =
              sectionTotals[sectionName].sum / sectionTotals[sectionName].count
          }
        })

        const totalAverage =
          totalScoreCount > 0 ? totalScoreSum / totalScoreCount : 0

        return {
          name,
          questionnaireCount: userResponses.length,
          sectionAverages,
          totalAverage: Math.round(totalAverage * 100) / 100, // Round to 2 decimal places
          lastSubmission: userResponses[0].createdAt,
        }
      })

      return summaries
    } catch (error) {
      console.error('Error getting questionnaire summaries:', error)
      throw new Error('Failed to get questionnaire summaries')
    }
  },

  // Calculate average scores by section for a specific name
  async getAverageScoresByName(name: string) {
    try {
      const responses = await Response.find({ name })

      if (responses.length === 0) {
        return null
      }

      // Calculate averages for each section
      const sectionAverages: { [key: string]: number } = {}
      const sectionCounts: { [key: string]: number } = {}

      responses.forEach((response) => {
        response.sections.forEach((section) => {
          const sectionName = section.sectionName

          if (sectionName && !sectionAverages[sectionName]) {
            sectionAverages[sectionName] = 0
            sectionCounts[sectionName] = 0
          }

          if (sectionName) {
            section.questions.forEach((question) => {
              if (question.score !== null && question.score !== undefined) {
                sectionAverages[sectionName] += question.score
                sectionCounts[sectionName]++
              }
            })
          }
        })
      })

      // Calculate final averages
      const result: { [key: string]: number } = {}
      Object.keys(sectionAverages).forEach((sectionName) => {
        if (sectionCounts[sectionName] > 0) {
          result[sectionName] =
            sectionAverages[sectionName] / sectionCounts[sectionName]
        }
      })

      return result
    } catch (error) {
      console.error('Error calculating average scores:', error)
      throw new Error('Failed to calculate average scores')
    }
  },
}
