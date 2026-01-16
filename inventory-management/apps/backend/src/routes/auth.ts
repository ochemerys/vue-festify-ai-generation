import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// JWT secret - in production this should come from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '24h'

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'VIEWER']).default('STAFF'),
})

const UpdateUserRequestSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
})

export async function authRoutes(app: FastifyInstance) {
  // Import entities inside the function to ensure reflect-metadata is loaded first
  const { getAppDataSource, User } = await import('@inventory/db')
  const AppDataSource = getAppDataSource()
  // POST /auth/login - User login
  app.post('/auth/login', {
    schema: {
      description: 'User login with email and password',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                tokenType: { type: 'string' },
                expiresIn: { type: 'number' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password } = LoginRequestSchema.parse(request.body)

      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({
        where: { email },
      })

      if (!user || !user.isActive) {
        reply.status(401)
        return { success: false, error: 'Invalid credentials' }
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        reply.status(401)
        return { success: false, error: 'Invalid credentials' }
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      return {
        success: true,
        data: {
          accessToken: token,
          tokenType: 'Bearer',
          expiresIn: 86400, // 24 hours in seconds
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // POST /auth/logout - User logout
  app.post('/auth/logout', {
    schema: {
      description: 'User logout',
      tags: ['Authentication'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // In a stateless JWT system, logout is handled client-side by discarding the token
    // In a production system, you might want to implement token blacklisting
    return { success: true, message: 'Logged out successfully' }
  })

  // POST /auth/refresh - Refresh access token
  app.post('/auth/refresh', {
    schema: {
      description: 'Refresh access token using refresh token',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' },
        },
        required: ['refreshToken'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                tokenType: { type: 'string' },
                expiresIn: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body as any

      if (!refreshToken) {
        reply.status(400)
        return { success: false, error: 'Refresh token required' }
      }

      // Verify refresh token and issue new access token
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any

      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
      })

      if (!user || !user.isActive) {
        reply.status(401)
        return { success: false, error: 'Invalid refresh token' }
      }

      const newToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      return {
        success: true,
        data: {
          accessToken: newToken,
          tokenType: 'Bearer',
          expiresIn: 86400,
        },
      }
    } catch (error) {
      reply.status(401)
      return { success: false, error: 'Invalid refresh token' }
    }
  })

  // GET /auth/permissions - Get user permissions
  app.get('/auth/permissions', {
    schema: {
      description: 'Get user permissions based on role',
      tags: ['Authentication'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                role: { type: 'string' },
                permissions: { type: 'object' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // In a real app, you'd get user from JWT token
      // For now, return mock permissions
      const user = { role: 'ADMIN' } // Mock user

      const permissions = getPermissionsForRole(user.role)

      return {
        success: true,
        data: {
          role: user.role,
          permissions,
        },
      }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // POST /users - Create new user
  app.post('/users', {
    schema: {
      description: 'Create a new user',
      tags: ['Users'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'] },
        },
        required: ['email', 'password', 'firstName', 'lastName'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userData = CreateUserRequestSchema.parse(request.body)

      // Check if email already exists
      const userRepository = AppDataSource.getRepository(User)
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      })

      if (existingUser) {
        reply.status(409)
        return { success: false, error: 'Email already exists' }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
      })
      await userRepository.save(user)

      // Return user without password
      const { password, ...userResponse } = user

      reply.status(201)
      return { success: true, data: userResponse }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /users - List all users
  app.get('/users', {
    schema: {
      description: 'Get list of all users',
      tags: ['Users'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userRepository = AppDataSource.getRepository(User)
      const users = await userRepository.find({
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
        order: { createdAt: 'DESC' },
      })

      return { success: true, data: users }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // GET /users/:id - Get user by ID
  app.get<{ Params: { id: string } }>('/users/:id', {
    schema: {
      description: 'Get user by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'User ID' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({
        where: { id: request.params.id },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'],
      })

      if (!user) {
        reply.status(404)
        return { success: false, error: 'User not found' }
      }

      return { success: true, data: user }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // PUT /users/:id - Update user
  app.put<{ Params: { id: string } }>('/users/:id', {
    schema: {
      description: 'Update user information',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'User ID' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          password: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'] },
          isActive: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const updateData = UpdateUserRequestSchema.parse(request.body)

      // If updating password, hash it
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10)
      }

      // Build update payload without undefined properties
      const data: any = {}
      if (updateData.firstName !== undefined) data.firstName = updateData.firstName
      if (updateData.lastName !== undefined) data.lastName = updateData.lastName
      if (updateData.password !== undefined) data.password = updateData.password
      if (updateData.role !== undefined) data.role = updateData.role
      if (updateData.isActive !== undefined) data.isActive = updateData.isActive

      const userRepository = AppDataSource.getRepository(User)
      await userRepository.update(request.params.id, data)

      const user = await userRepository.findOne({
        where: { id: request.params.id },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'updatedAt'],
      })

      if (!user) {
        reply.status(404)
        return { success: false, error: 'User not found' }
      }

      return { success: true, data: user }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400)
        return { success: false, error: 'Validation failed', details: error.issues }
      }
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // PATCH /users/:id/deactivate - Deactivate user
  app.patch<{ Params: { id: string } }>('/users/:id/deactivate', {
    schema: {
      description: 'Deactivate a user account',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'User ID' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userRepository = AppDataSource.getRepository(User)
      await userRepository.update(request.params.id, { isActive: false })

      const user = await userRepository.findOne({
        where: { id: request.params.id },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'updatedAt'],
      })

      if (!user) {
        reply.status(404)
        return { success: false, error: 'User not found' }
      }

      return { success: true, data: user }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })

  // PATCH /users/:id/reactivate - Reactivate user
  app.patch<{ Params: { id: string } }>('/users/:id/reactivate', {
    schema: {
      description: 'Reactivate a user account',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'User ID' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userRepository = AppDataSource.getRepository(User)
      await userRepository.update(request.params.id, { isActive: true })

      const user = await userRepository.findOne({
        where: { id: request.params.id },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'updatedAt'],
      })

      if (!user) {
        reply.status(404)
        return { success: false, error: 'User not found' }
      }

      return { success: true, data: user }
    } catch (error) {
      reply.status(500)
      return { success: false, error: 'Internal server error' }
    }
  })
}

// Helper function to get permissions based on role
function getPermissionsForRole(role: string) {
  const basePermissions = {
    VIEW_PRODUCTS: true,
    VIEW_INVENTORY: true,
  }

  switch (role) {
    case 'ADMIN':
      return {
        ...basePermissions,
        MANAGE_PRODUCTS: true,
        MANAGE_INVENTORY: true,
        MANAGE_ORDERS: true,
        MANAGE_PURCHASE_ORDERS: true,
        MANAGE_USERS: true,
        VIEW_REPORTS: true,
        MANAGE_SYSTEM: true,
      }
    case 'MANAGER':
      return {
        ...basePermissions,
        MANAGE_PRODUCTS: true,
        MANAGE_INVENTORY: true,
        MANAGE_ORDERS: true,
        MANAGE_PURCHASE_ORDERS: true,
        VIEW_REPORTS: true,
      }
    case 'STAFF':
      return {
        ...basePermissions,
        MANAGE_INVENTORY: true,
        MANAGE_ORDERS: true,
      }
    case 'VIEWER':
    default:
      return basePermissions
  }
}