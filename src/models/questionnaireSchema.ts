import mongoose from 'mongoose'

const QuestionSchema = new mongoose.Schema({
  questionId: String,
  questionText: String,
  score: { type: Number, min: 1, max: 5 },
})

const SectionSchema = new mongoose.Schema({
  sectionName: String,
  questions: [QuestionSchema],
})

const ResponseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  questionnaireRef: { type: String, default: null },
  sections: [SectionSchema],
  createdAt: { type: Date, default: Date.now },
})

export const Response = mongoose.model('Response', ResponseSchema)
