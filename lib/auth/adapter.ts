import type { PrismaClient, Prisma } from "@prisma/client"
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from "@auth/core/adapters"

export function PrismaAdapter(
  prisma: PrismaClient | ReturnType<PrismaClient["$extends"]>
): Adapter {
  const p = prisma as PrismaClient
  return {
    // We need to let Prisma generate the ID because our default UUID is incompatible with MongoDB
    createUser: ({ id: _id, ...data }) => {
      return p.user.create({ data })
    },
    getUser: (id) => p.user.findUnique({ where: { id } }),
    getUserByEmail: (email) => p.user.findUnique({ where: { email } }),
    async getUserByAccount(provider_providerAccountId) {
      const account = await p.userAccount.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      })
      return (account?.user as AdapterUser) ?? null
    },
    updateUser: ({ id, ...data }) =>
      p.user.update({ where: { id }, data }) as Promise<AdapterUser>,
    deleteUser: (id) =>
      p.user.delete({ where: { id } }) as Promise<AdapterUser>,
    linkAccount: (data) =>
      p.userAccount.create({ data }) as unknown as Promise<AdapterAccount>,
    unlinkAccount: (provider_providerAccountId) =>
      p.userAccount.delete({
        where: { provider_providerAccountId },
      }) as unknown as Promise<AdapterAccount>,
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (!userAndSession) return null
      const { user, ...session } = userAndSession
      return { user, session } as { user: AdapterUser; session: AdapterSession }
    },
    createSession: (data) => p.session.create({ data }),
    updateSession: (data) =>
      p.session.update({ where: { sessionToken: data.sessionToken }, data }),
    deleteSession: (sessionToken) =>
      p.session.delete({ where: { sessionToken } }),
    async createVerificationToken(data) {
      const verificationToken = await p.verificationToken.create({ data })
      if (verificationToken.id) delete verificationToken.id
      return verificationToken
    },
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await p.verificationToken.delete({
          where: { identifier_token },
        })
        if (verificationToken.id) delete verificationToken.id
        return verificationToken
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
          return null
        throw error
      }
    },
    async getAccount(providerAccountId, provider) {
      return p.userAccount.findFirst({
        where: { providerAccountId, provider },
      }) as unknown as Promise<AdapterAccount | null>
    },
    async createAuthenticator(authenticator) {
      return p.authenticator.create({
        data: authenticator,
      })
    },
    async getAuthenticator(credentialID) {
      return p.authenticator.findUnique({
        where: { credentialID },
      })
    },
    async listAuthenticatorsByUserId(userId) {
      return p.authenticator.findMany({
        where: { userId },
      })
    },
    async updateAuthenticatorCounter(credentialID, counter) {
      return p.authenticator.update({
        where: { credentialID },
        data: { counter },
      })
    },
  }
}

// https://github.com/honeinc/is-iso-date/blob/8831e79b5b5ee615920dcb350a355ffc5cbf7aed/index.js#L5
const isoDateRE =
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/
 
const isDate = (val: any): val is ConstructorParameters<typeof Date>[0] =>
  !!(val && isoDateRE.test(val) && !isNaN(Date.parse(val)))
 
const format = {
  /** Takes an object that's coming from a database and converts it to plain JavaScript. */
  from<T>(object: Record<string, any> = {}): T {
    const newObject: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(object))
      if (isDate(value)) newObject[key] = new Date(value)
      else newObject[key] = value
    return newObject as T
  },
  /** Takes an object that's coming from Auth.js and prepares it to be written to the database. */
  to<T>(object: Record<string, any>): T {
    const newObject: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(object))
      if (value instanceof Date) newObject[key] = value.toISOString()
      else newObject[key] = value
    return newObject as T
  },
}