
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay
type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6 // Sunday | Monday | ... | Saturday

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth
type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11   // January | ... | December

type Time24hString = string // hhmm or hh:mm
/**
 * Adding information for creating
 * description
 */
export interface HighLevelDescription {
    timeAvailable: 
        | 'all' // All day every 
        // string
        | { start: Time24hString } | { end: Time24hString } | { start: Time24hString, end: Time24hString }
    daysAvailable: Day[]
    monthsAvailable: Month[]
    yearsAvailable:
        | 'all'
        | { start: number } | { end: number } | { start: number, end: number }
        | { skip: number[] }
}

/**
 * Skip information
 */
type SkipInfo =
    | { skipDate: Date }

const convertTimeStringToHHMM = (_24hTimeString: Time24hString): [number, number] => {
    const t = _24hTimeString.trim()
    
    let hours: string
    let minutes: string

    if (t.indexOf(":") > -1) {
        const contents = t.split(":")
        if (contents.length !== 2) throw new Error("Format of data must be hh:mm")

        hours = contents[0]
        minutes = contents[1]
    } else {
        if (t.length !== 4) {
            throw new Error("Invalid 24h time string: > 4 numbers")
        }

        hours = t.slice(0, 1)
        minutes = t.slice(2, 3)
    } 
    
    try {
        const hh = parseInt(hours)
        const mm = parseInt(minutes)

        // 24 -> 00 | 60 -> 00
        return [hh % 24, mm % 60]
    } catch (err) {
        throw new Error("Failed to convert time to [hh, mm]")
    }
} 

/**
 * Function that determines what selected time is available
 * @param props properties that define how the function should behave
 * @returns a function
 */
export function AvailabilityDescriptor(props: {
    highLevel?: HighLevelDescription,
    skipInfo?: SkipInfo[]
}, options?: any) {
    if (options !== undefined) {
        throw new Error('`options` are currently unsupported. Dont add any values here')
    }

    /**
     * Checks if there is availablity expressed from the time
     * @param _24hTimeString Hours in 24h format
     */
    const available24hhmm = (_24hTimeString: Time24hString): boolean => {
        // If no high level, default to true
        if (props.highLevel === undefined) return true
        if (props.highLevel.timeAvailable === 'all') return true

        try {
            const [hh, mm] = convertTimeStringToHHMM(_24hTimeString)

            const tse = props.highLevel.timeAvailable as { start?: Time24hString, end?: Time24hString }
            let start = true
            let end = true

            if (tse.start !== undefined) {
                let [shh, smm] = convertTimeStringToHHMM(tse.start)
                start = ((shh * 60) + smm) <=  ((hh * 60) + mm)
            }

            if (tse.end !== undefined) {
                let [ehh, emm] = convertTimeStringToHHMM(tse.end)
                end = ((ehh * 60) + emm) >= ((hh * 60) + mm)
            }

            return start && end
        } catch (err) {
            // default to time NOT being available to due invalid input
            console.warn(`Error: ${err.message}. Defaulting to NOT AVAILABLE`)
            return false
        }
    }

    const availableDay = (day: Day): boolean => {
        // If no high level, default to true
        if (props.highLevel === undefined) return true

        return props.highLevel.daysAvailable.includes(day)
    }

    const availableMonth = (month: Month): boolean => {
        // If no high level, default to true
        if (props.highLevel === undefined) return true

        return props.highLevel.monthsAvailable.includes(month)
    }

    const availableYear = (year: number): boolean => {
        // If no high level, default to true
        if (props.highLevel === undefined) return true

        const { yearsAvailable } = props.highLevel
        // Return true if all year is available
        if (yearsAvailable === 'all') return true

        // check skip years
        const sy = yearsAvailable as { skip: number[] }
        if (sy.skip.includes(year)) return false 

        // Check as start end times
        const ft = yearsAvailable as { start?: number, end?: number }
        let start = true
        let end = true

        if (ft["start"] !== undefined) { start = year >= ft.start }
        if (ft["end"] !== undefined) { end = year <= ft.end }

        return start && end
    }


    return ({
        /**
         * Determines if the date is available
         * NOTE: This DOESN'T consider UTC time.
         * You MUST set this on your own
         */
        available: function (date: Date): boolean {
            const { skipInfo } = props

            // Using the low level information to 
            //  check if the time is available
            if (skipInfo !== undefined) {
                //  check for availability 
                for (let sd of skipInfo) {
                    let { skipDate } = sd
                    if (skipDate.getTime() === date.getTime()) {
                        // Check availability
                        return false
                    }
                }
            }
            
            // no low level matching.
            // Check in a higher level
            // ----------------------------

            // Check if it fits in hours
            const day = date.getDay() as Day
            const month = date.getMonth() as Month
            const year = date.getFullYear()

            const hh = date.getHours()
            const mm = date.getMinutes()

            return (
                available24hhmm(`${hh}:${mm}`) &&
                availableDay(day) && 
                availableMonth(month) && 
                availableYear(year)
            )


        },

        // For the availableXXX
        availableDay,
        availableMonth,
        availableYear,
        available24hhmm,
    })
}

