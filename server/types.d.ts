import 'express-session'

declare module 'express-session' {
  interface SessionData {
    authenticated: boolean
    userId: string
    oauthState:    string
    oauthClientId: string   // which client is being connected during an OAuth flow
    codeVerifier:  string
  }
}
