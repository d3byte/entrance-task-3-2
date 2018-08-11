import data from './data'

const checkDeviceUniqueness = devices => {
    let ids = []
    devices.map(device => {
        if (ids.includes(device.id)) {
            throw new Error('ID приборов должны быть уникальны')
        }
        ids.push(device.id)
    })
}

export default function createSchedule(data) {
    if (!data.devices || !data.rates || !data.maxPower) {
        throw new Error('Входные данные не соответствуют необходимой структуре')
    }

    checkDeviceUniqueness(data.devices)

    const schedule = {
        "0": [],
        "1": [],
        "2": [],
        "3": [],
        "4": [],
        "5": [],
        "6": [],
        "7": [],
        "8": [],
        "9": [],
        "10": [],
        "11": [],
        "12": [],
        "13": [],
        "14": [],
        "15": [],
        "16": [],
        "17": [],
        "18": [],
        "19": [],
        "20": [],
        "21": [],
        "22": [],
        "23": []
    }
    const scheduleInPower = new Array(24).fill(0)

    const consumedEnergy = {
        "value": 0,
        "devices": {},
    }

    const sortField = (array: any[], key) => array.sort((a, b) => {
        if (a[key] > b[key]) {
            return -1
        } else if (a[key] === b[key]) {
            return 0
        } else {
            return 1
        }
    })

    const fixFloat = (number: number, n = 4) => {
        const string = number.toFixed(n).toString()
        if (string[string.length - 1] === '0') {
            return fixFloat(number, n - 1)
        } else {
            return parseFloat(string)
        }
    }
        

    let sortedDevices = sortField(data.devices, 'duration')

    const rates = {
        night: [],
        day: []
    }

    data.rates.map(rate => {
        if ((rate.from >= 21 || rate.from <= 7) && (rate.to >= 21 || rate.to <= 7)) {
            rates.night.push(rate)
        } else {
            rates.day.push(rate)
        }
    })

    rates.night = sortField(rates.night, 'value').reverse()
    rates.day = sortField(rates.day, 'value').reverse()

    sortedDevices.map(device => {
        let hoursScheduled = 0
        consumedEnergy.devices[device.id] = 0
        if (device.mode === 'night') {
            rates.night.map(rate => {
                let hour = rate.from
                if (rate.to < rate.from && hoursScheduled < device.duration) {
                    while (hoursScheduled < device.duration) {
                        if (hoursScheduled >= device.duration) {
                            break
                        }
                        if (hour === 24) {
                            hour = 0
                        }
                        
                        const hasEnoughPower = scheduleInPower[hour] + device.power <= data.maxPower

                        if (hasEnoughPower && (hour >= rate.to || hour < rate.to) && !schedule[hour].includes(device.id)) {
                            hoursScheduled++
                            scheduleInPower[hour] += device.power
                            schedule[hour].push(device.id)
                            consumedEnergy.value += rate.value * (device.power / 1000)
                            consumedEnergy.devices[device.id] += rate.value * (device.power / 1000)
                        }
                        hour++
                    }
                } else if (rate.to > rate.from && hoursScheduled < device.duration) {
                    
                    while (hoursScheduled < device.duration) {
                        if (hoursScheduled >= device.duration) {
                            break
                        }
                        
                        const hasEnoughPower = scheduleInPower[hour] + device.power <= data.maxPower

                        if (hasEnoughPower && (hour >= rate.from && hour < rate.to) && !schedule[hour].includes(device.id)) {
                            hoursScheduled++
                            scheduleInPower[hour] += device.power
                            schedule[hour].push(device.id)
                            consumedEnergy.value += rate.value * (device.power / 1000)
                            consumedEnergy.devices[device.id] += rate.value * (device.power / 1000)
                        }
                        hour++
                    }
                }
                
            })
        } else if (device.mode === 'day') {
            rates.day.map(rate => {
                for (let hour = rate.from hour < rate.to hour++) {
                    if (hoursScheduled >= device.duration) {
                        break
                    }

                    const hasEnoughPower = scheduleInPower[hour] + device.power <= data.maxPower

                    if (hasEnoughPower && hour >= rate.from && hour < rate.to && !schedule[hour].includes(device.id)) {
                        hoursScheduled++
                        scheduleInPower[hour] += device.power
                        schedule[hour].push(device.id)
                        consumedEnergy.value += rate.value * (device.power / 1000)
                        consumedEnergy.devices[device.id] += rate.value * (device.power / 1000)
                    }
                }
            })
        } else if (!device.mode) {
            sortField(data.rates, 'value').reverse().map(rate => {
                let hour = rate.from
                if (rate.to < rate.from && hoursScheduled < device.duration) {
                    while (hoursScheduled < device.duration) {
                        if (hoursScheduled >= device.duration) {
                            break
                        }
                        if (hour === 24) {
                            hour = 0
                        }
                        
                        const hasEnoughPower = scheduleInPower[hour] + device.power <= data.maxPower

                        if (hasEnoughPower && (hour >= rate.from || hour < rate.to) && !schedule[hour].includes(device.id)) {
                            hoursScheduled++
                            scheduleInPower[hour] += device.power
                            schedule[hour].push(device.id)
                            consumedEnergy.value += rate.value * (device.power / 1000)
                            consumedEnergy.devices[device.id] += rate.value * (device.power / 1000)
                        } else {
                            break
                        }
                        hour++
                    }
                } else if (rate.to > rate.from && hoursScheduled < device.duration) {
                    while (hoursScheduled < device.duration) {
                        if (hoursScheduled >= device.duration) {
                            break
                        }
                        
                        const hasEnoughPower = scheduleInPower[hour] + device.power <= data.maxPower

                        if (hasEnoughPower && (hour >= rate.from && hour < rate.to) && !schedule[hour].includes(device.id)) {
                            hoursScheduled++
                            scheduleInPower[hour] += device.power
                            schedule[hour].push(device.id)
                            consumedEnergy.value += rate.value * (device.power / 1000)
                            consumedEnergy.devices[device.id] += rate.value * (device.power / 1000)
                        } else {
                            break
                        }

                        hour++
                    }
                }
            })
        }

        consumedEnergy.devices[device.id] = fixFloat(consumedEnergy.devices[device.id])
// 
        return device
    })

    consumedEnergy.value = fixFloat(consumedEnergy.value)
    
    return {
        schedule,
        consumedEnergy
    }
}

const result = createSchedule(data)