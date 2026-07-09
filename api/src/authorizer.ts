import { createRemoteJWKSet, jwtVerify } from 'jose'

interface AuthorizerEvent {
  type: 'TOKEN'
  authorizationToken: string
  methodArn: string
}

interface AuthResponse {
  principalId: string
  policyDocument: {
    Version: '2012-10-17'
    Statement: {
      Action: string
      Effect: 'Allow' | 'Deny'
      Resource: string
    }[]
  }
  context: {
    sub: string
    email?: string
    name?: string
    picture?: string
  }
}

const USER_POOL_ID = process.env.USER_POOL_ID ?? ''
const REGION = process.env.REGION ?? 'us-east-1'

const jwksUrl = new URL(
  `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
)

const jwks = createRemoteJWKSet(jwksUrl)

const extractToken = (authHeader: string): string | null => {
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null
  return parts[1]
}

const generatePolicy = (
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context: { sub: string; email?: string; name?: string; picture?: string },
): AuthResponse => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [{
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource,
    }],
  },
  context,
})

export const handler = async (event: AuthorizerEvent): Promise<AuthResponse> => {
  const token = extractToken(event.authorizationToken)

  if (!token) {
    return generatePolicy('guest', 'Allow', event.methodArn, { sub: '' })
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
    })

    return generatePolicy(
      payload.sub as string,
      'Allow',
      event.methodArn,
      {
        sub: payload.sub as string,
        email: payload.email as string | undefined,
        name: payload.name as string | undefined,
        picture: payload.picture as string | undefined,
      },
    )
  } catch {
    return generatePolicy('invalid', 'Deny', event.methodArn, { sub: '' })
  }
}
