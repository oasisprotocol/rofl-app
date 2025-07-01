import * as oasisRT from '@oasisprotocol/client-rt'

type DurationInput = {
  duration: 'months' | 'days' | 'hours'
  number: number
}

type DurationResult = {
  term: oasisRT.types.RoflmarketTerm
  term_count: number
}

export const convertToDurationTerms = (input: DurationInput): DurationResult => {
  const { duration, number } = input

  switch (duration) {
    case 'months':
      return {
        term: oasisRT.types.RoflmarketTerm.MONTH,
        term_count: number,
      }
    case 'days':
      return {
        term: oasisRT.types.RoflmarketTerm.HOUR,
        term_count: number * 24,
      }
    case 'hours':
      return {
        term: oasisRT.types.RoflmarketTerm.HOUR,
        term_count: number,
      }
    default:
      throw new Error(`Invalid duration: ${duration}`)
  }
}
