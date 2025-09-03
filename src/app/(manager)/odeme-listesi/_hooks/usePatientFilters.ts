import { useEffect, useState } from "react"
import { useQueryState } from "nuqs"

export type FilterType = "ALL" | "PENDING_PAYMENT" | "OVERDUE_PAYMENT"

export function usePatientFilters() {
  const [filtersParam, setFiltersParam] = useQueryState("filters")

  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([])

  useEffect(() => {
    if (filtersParam) {
      try {
        const parsedFilters = JSON.parse(
          decodeURIComponent(filtersParam)
        ) as FilterType[]
        setSelectedFilters(parsedFilters)
      } catch (error) {
        console.error("Filtre parametresi ayrıştırılamadı:", error)
        setSelectedFilters([])
      }
    } else {
      setSelectedFilters([])
    }
  }, [filtersParam])

  const toggleFilter = (filter: FilterType) => {
    let newFilters: FilterType[]

    if (selectedFilters.includes(filter)) {
      newFilters = selectedFilters.filter((f) => f !== filter)
    } else {
      newFilters = [...selectedFilters, filter]
    }

    const encodedFilters = encodeURIComponent(JSON.stringify(newFilters))
    void setFiltersParam(newFilters.length > 0 ? encodedFilters : null)

    setSelectedFilters(newFilters)
  }

  const filters = selectedFilters.length > 0 ? selectedFilters : ["ALL"]

  const apiFilters = filters as unknown as Array<
    "ALL" | "PENDING_PAYMENT" | "OVERDUE_PAYMENT"
  >

  return {
    selectedFilters,
    apiFilters,
    toggleFilter,
  }
}
