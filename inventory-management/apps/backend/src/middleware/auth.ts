import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string
      email: string
      role: string
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization
    
    if (!authHeader) {
      reply.status(401)
      return reply.send({ 
        success: false, 
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    if (!token) {
      reply.status(401)
      return reply.send({ 
        success: false, 
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    request.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    reply.status(401)
    return reply.send({ 
      success: false, 
      error: 'Invalid token',
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Authorization middleware factory
 * Checks if user has required role
 */
export function authorize(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      reply.status(401)
      return reply.send({ 
        success: false, 
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      })
    }

    if (!roles.includes(request.user.role)) {
      reply.status(403)
      return reply.send({ 
        success: false, 
        error: 'Forbidden',
        timestamp: new Date().toISOString()
      })
    }
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't fail if missing
 */
export async function optionalAuthenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization
    
    if (!authHeader) {
      return
    }

    const token = authHeader.replace('Bearer ', '')
    
    if (!token) {
      return
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    request.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    // Silently fail for optional auth
    return
  }
}
