import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckInUseCase } from './check-in'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'
import { MaxDistanceError } from './errors/max-distance-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check-in Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    await gymsRepository.create({
      id: '01',
      title: 'Gym',
      latitude: 0,
      longitude: 0,
      description: '',
      phone: '',
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      userId: '01',
      gymId: '01',
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice on the same day', async () => {
    vi.setSystemTime(new Date(2021, 0, 20, 8, 0, 0))

    await sut.execute({
      userId: '01',
      gymId: '01',
      userLatitude: 0,
      userLongitude: 0,
    })

    await expect(
      sut.execute({
        userId: '01',
        gymId: '01',
        userLatitude: 0,
        userLongitude: 0,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should be able to check in twice on different days', async () => {
    vi.setSystemTime(new Date(2021, 0, 20, 8, 0, 0))

    await sut.execute({
      userId: '01',
      gymId: '01',
      userLatitude: 0,
      userLongitude: 0,
    })

    vi.setSystemTime(new Date(2021, 0, 21, 8, 0, 0))

    const { checkIn } = await sut.execute({
      userId: '01',
      gymId: '01',
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in a too far gym', async () => {
    gymsRepository.items.push({
      id: '02',
      title: 'Gym',
      latitude: new Decimal(43.0070594),
      longitude: new Decimal(-79.2530005),
      description: '',
      phone: '',
    })

    await expect(
      sut.execute({
        gymId: '02',
        userId: '01',
        userLatitude: 43.0786888,
        userLongitude: -79.1820659,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
