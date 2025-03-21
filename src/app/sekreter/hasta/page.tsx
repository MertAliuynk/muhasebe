"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { api } from "@/trpc/react"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import Spinner from "@/components/spinner"

import patientColumns from "./_components/patient-columns"
import PatientTableFilters from "./_components/patient-table-filters"
import { usePatientFilters } from "./_hooks/usePatientFilters"

export default function Page() {
  const { selectedFilters, apiFilters, toggleFilter } = usePatientFilters()

  const [searchTerm, setSearchTerm] = useState("")
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")

  let startDate: string | undefined
  let endDate: string | undefined

  if (dateParam) {
    const dates = dateParam.split(",")
    startDate = dates[0] || undefined
    endDate = dates[1] || undefined
  }

  const { data: patients, isLoading } =
    api.patient.getFilteredPatients.useQuery({
      filters: apiFilters,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

  const filteredPatients = useMemo(() => {
    if (!patients) return []

    if (!searchTerm.trim()) return patients

    const searchLower = searchTerm.toLowerCase().trim()

    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchLower) ||
        (patient.phone?.toLowerCase().includes(searchLower) ?? false) ||
        (patient.tcNo?.toLowerCase().includes(searchLower) ?? false)
    )
  }, [patients, searchTerm])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hastalar</h1>
          <p className="text-sm text-muted-foreground">
            Hastaları bu ekranda görüntüleyebilir ve yönetebilirsiniz.
          </p>
        </div>
        <Link href="/sekreter/hasta/ekle">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Yeni Hasta Ekle
          </Button>
        </Link>
      </div>
      <PatientTableFilters
        filteredPatients={filteredPatients}
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <DataTable
          columns={patientColumns}
          data={filteredPatients}
          pagination
        />
      )}
    </div>
  )
}
