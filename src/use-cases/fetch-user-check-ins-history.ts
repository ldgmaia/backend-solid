import { CheckInsRepository } from '@/repositories/check-ins-repositories'
import { CheckIn } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found'

interface FetchUserCheckInsHistoryUseCaseRequest {
  userId: string
  page: number
}

interface CheckInUseCaseResponse {
  checkIns: CheckIn[]
}

export class FetchUserCheckInsHistoryUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    userId,
    page,
  }: FetchUserCheckInsHistoryUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const checkIns = await this.checkInsRepository.findManyByUserId(
      userId,
      page,
    )

    if (!checkIns) {
      throw new ResourceNotFoundError()
    }

    return { checkIns }
  }
}
