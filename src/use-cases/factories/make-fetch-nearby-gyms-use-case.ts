import { FetchNearbyGymsUseCase } from '../fetch-nearby-gyms'
import { PrismaGymsRepository } from '@/repositories/prisma/prisma-gyms-repository'

export function makeFetchNearbyGymsUseCase() {
  const gymssRepository = new PrismaGymsRepository()
  const useCase = new FetchNearbyGymsUseCase(gymssRepository)

  return useCase
}
