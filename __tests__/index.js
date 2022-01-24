const { AvailabilityDescriptor } = require('../lib')

const nowDate = new Date(Date.now())

describe("Testing with random setup: Look at test to know more", () => {
    const userDescriptor = AvailabilityDescriptor(
        // description
        {
            highLevel: {
                timeAvailable: { end: "1800" },  // 24 hours      
                daysAvailable: [ 0, 1, 2, 3, 4 ], // days
                monthsAvailable: [ 0, 1, 2, 3, 5, 7 ], // months
                yearsAvailable: { skip: [ 2023 ]}
            }, 
            skipInfo: [
                { skipDate: nowDate }
            ]
        },
    )
    
    test("Is July 24, 2021 00:00:00 available? It's a saturday. So no.", () => {
        expect(userDescriptor.available(new Date("July 24, 2021"))).toBe(false) // Saturday -> false
    })

    
    test(`Is ${nowDate.toUTCString()} available? Shouldn't work since it's added to skip date.`, () => {
        expect(userDescriptor.available(nowDate)).toBe(false)
    })
    // Testing time

    test(`Is 1300 available? Yes`, () => {
        expect(userDescriptor.available24hhmm("1300")).toBe(true)
    })
    test(`Is 2000 available? No`, () => {
        expect(userDescriptor.available24hhmm("2000")).toBe(false)
    })
    
    // Testing day:
    test("Is Monday available? Yes", () => {
        expect(userDescriptor.availableDay(1)).toBe(true) // Monday -> true
    }) 

    test("Is Friday available? No", () => {
        expect(userDescriptor.availableDay(5)).toBe(false) // Friday -> false
    })

    
    // Testing Month
    test("Is December available? No", () => {
        expect(userDescriptor.availableMonth(11)).toBe(false) // December -> false
    }) 
    test("Is March available? Yes", () => {
        expect(userDescriptor.availableMonth(2)).toBe(true) // March -> true
    }) 

    // Testing Year
    test("Is 2021 available? Yes", () => {
        expect(userDescriptor.availableYear(2021)).toBe(true) // March -> true
    }) 
    test("Is 2023 available? No", () => {
        expect(userDescriptor.availableYear(2023)).toBe(false) // March -> true
    }) 
})