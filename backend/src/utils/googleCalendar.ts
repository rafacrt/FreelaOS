import { google } from 'googleapis'
import dotenv from 'dotenv'

dotenv.config() // <-- MUITO IMPORTANTE



const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3001/auth/google/callback' // Essa URL PRECISA estar no painel do Google
  )

export const getAuthUrl = () => {
  const SCOPES = ['https://www.googleapis.com/auth/calendar']
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })
}

export const getTokens = async (code: string) => {
  const { tokens } = await oAuth2Client.getToken(code)
  oAuth2Client.setCredentials(tokens)
  return tokens
}

export const createCalendarEvent = async (tokens: any, evento: any) => {
  oAuth2Client.setCredentials(tokens)
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: evento
  })

  return response.data
}
