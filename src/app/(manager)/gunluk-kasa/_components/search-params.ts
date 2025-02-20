import { createLoader, parseAsIsoDate } from "nuqs/server"

export const dateSearchParams = {
  date: parseAsIsoDate.withDefault(new Date()),
}

export const loadSearchParams = createLoader(dateSearchParams)
