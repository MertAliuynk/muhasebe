import { useEffect, useState } from "react"
import { useQueryState } from "nuqs"

// Filtre tipleri
export type FilterType = "ALL" | "PENDING_PAYMENT" | "OVERDUE_PAYMENT"

export function usePatientFilters() {
  // URL parametresi olarak filtreleri yönet
  const [filtersParam, setFiltersParam] = useQueryState("filters")

  // Seçili filtreleri state olarak tut
  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([])

  // URL parametresinden filtreleri yükle
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

  // Filtre değiştirme fonksiyonu
  const toggleFilter = (filter: FilterType) => {
    let newFilters: FilterType[]

    if (selectedFilters.includes(filter)) {
      // Filtreyi kaldır
      newFilters = selectedFilters.filter((f) => f !== filter)
    } else {
      // Filtreyi ekle
      newFilters = [...selectedFilters, filter]
    }

    // URL parametresini güncelle
    const encodedFilters = encodeURIComponent(JSON.stringify(newFilters))
    void setFiltersParam(newFilters.length > 0 ? encodedFilters : null)

    // State'i güncelle
    setSelectedFilters(newFilters)
  }

  // Eğer hiç filtre seçilmemişse, varsayılan olarak ALL filtresi kullan
  const filters = selectedFilters.length > 0 ? selectedFilters : ["ALL"]

  // API'ye gönderilecek filtreleri tip güvenli hale getir
  const apiFilters = filters as unknown as Array<
    "ALL" | "PENDING_PAYMENT" | "OVERDUE_PAYMENT"
  >

  return {
    selectedFilters,
    apiFilters,
    toggleFilter,
  }
}
