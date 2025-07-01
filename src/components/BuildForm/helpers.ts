import { RoflMarketOffer } from '../../nexus/api'

export const sortOffersByPaymentTerms = (a: RoflMarketOffer, b: RoflMarketOffer) => {
  const aPayment = a.payment?.native as { terms?: Record<string, string> }
  const bPayment = b.payment?.native as { terms?: Record<string, string> }

  const aTermValue = aPayment?.terms?.['1']
  const bTermValue = bPayment?.terms?.['1']

  if (aTermValue && bTermValue) {
    return BigInt(aTermValue) < BigInt(bTermValue) ? -1 : 1
  }

  if (aTermValue && !bTermValue) return -1
  if (!aTermValue && bTermValue) return 1

  return 0
}
