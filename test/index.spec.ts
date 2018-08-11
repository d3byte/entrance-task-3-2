import { expect } from 'chai'
import createSchedule from '../src'
import { correctData, dataWithNonUniqueIds, dataWithWrongFormat } from './data'

describe('При правильном датасете', () => {
    const result = createSchedule(correctData)

    it('Должны присутствовать нужные поля', () => {
        expect(result).to.have.property('schedule')
        expect(result).to.have.property('consumedEnergy')
        expect(result).property('consumedEnergy').to.have.property('value')
        expect(result).property('consumedEnergy').to.have.property('devices')

    })

    it('Потраченная энергия не должна равняться 0, если есть приборы и наоборот', () => {
        if (Object.keys(result.consumedEnergy.devices).length > 0) {
            expect(result.consumedEnergy.value).not.to.equal(0)
            for (let device in result.consumedEnergy.devices) {
                expect(result.consumedEnergy.devices[device]).not.to.equal(0)
            }
        } else {
            expect(result.consumedEnergy.value).not.to.equal(0)
        }
    })

    it ('Пункты расписания должны быть массивами строк', () => {
        for (let hour in result.schedule) {
            expect(result.schedule[hour]).to.be.an('array')

            if (result.schedule[hour].length > 0) {
                result.schedule[hour].map(item => expect(item).to.be.a('string'))
            }
        }
    })
     
})

describe('При датасете с неуникальными ID приборов', () => {

    it('Должен выбрасывать ошибку', () => {
        expect(() => createSchedule(dataWithNonUniqueIds)).to.throw()
    })
     
})

describe('При датасете с неправильным форматом', () => {

    it('Должен выбрасывать ошибку', () => {
        expect(() => createSchedule(dataWithWrongFormat)).to.throw()
    })
     
})
