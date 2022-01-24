# Availablity Descriptor

This tool describes the availability of a user

> BUGGY!! / POSSIBLY DEPRECATED

## Overview

This repository contains the source code needed to use a component that, based on a certain availability description, identifies the `Date`, `time` (in 24hr), `day`, `month` and `year` that a user is available for.

Please refer to the tests to see how the descriptor would work.

## How to use

### Create desciption object

By either copy-pasting the `ts` version of the code to your project, or running `yarn build` to get the `js` (typed version). You can begin by, 

Creating a description object the following shape:

```ts
interface {
    highLevel: {
        timeAvailable: 
            | 'all' // all hours in the day
            // timerange
            | { start: Time24hString } 
            | { end: Time24hString } 
            | { start: Time24hString, end: Time24hString }
        daysAvailable: Day[]
        monthsAvailable: Month[]
        yearsAvailable:
            | 'all' // All years in your existance
            | { skip: number[] } // years to skip

            // year range
            | { start: number } 
            | { end: number } 
            | { start: number, end: number }
    },
    skipInfo: [
        { skipDate: Date }
    ]
}
```
> The `Time24hString` is a string but must be in with `hh:mm` or `hhmm` format. 

### Use the `AvailabilityDescriptor` ...
...and take advantage of the underlying funtions

After describing the object, begin, usinging function as `available[24hhmm | Day | Month | Year ]` to begin validating certain times

Refer to the [tests](/__tests__/index.js) for examples


## DISCLAIMER

Almost little to no efforts are made to make the overhead in checking if the year is valid or if a time is valid. The assumption is that we are using this package with common sense. 

The package will `warn` if it can't do something, and default to `false` (not available)

