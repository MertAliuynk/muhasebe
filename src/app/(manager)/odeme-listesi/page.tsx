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
import { getLastPaidInstallment } from "./_components/patient-columns";

import PatientTableFilters from "./_components/patient-table-filters"
import { usePatientFilters } from "./_hooks/usePatientFilters"


export default function Page() {
  const { selectedFilters, apiFilters, toggleFilter } = usePatientFilters()

  const [searchTerm, setSearchTerm] = useState("")
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")

  const [sortKey, setSortKey] = useState<"name" | "totalRemainingAmount" | "lastPaymentDate">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

    // Önce kalan tutarı 0 olmayanları filtrele
    const nonZeroPatients = patients.filter(
      (patient) => (patient.totalRemainingAmount ?? 0) > 0
    )

    if (!searchTerm.trim()) return nonZeroPatients

    const searchLower = searchTerm.toLowerCase().trim()

    return nonZeroPatients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchLower) ||
        (patient.phone?.toLowerCase().includes(searchLower) ?? false) ||
        (patient.tcNo?.toLowerCase().includes(searchLower) ?? false)
    )
  }, [patients, searchTerm])


{/*sıralamalar için ekledim*/}
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      if (sortKey === "name") {
        aValue = a.name?.toLowerCase() || "";
        bValue = b.name?.toLowerCase() || "";
      } else if (sortKey === "totalRemainingAmount") {
        aValue = a.totalRemainingAmount ?? 0;
        bValue = b.totalRemainingAmount ?? 0;
      } else if (sortKey === "lastPaymentDate") {
        const aPlan = a.paymentPlans?.find(plan => plan.isApproved) || a.paymentPlans?.[0];
        const bPlan = b.paymentPlans?.find(plan => plan.isApproved) || b.paymentPlans?.[0];
        const aLast = getLastPaidInstallment(aPlan)?.lastPaymentDate;
        const bLast = getLastPaidInstallment(bPlan)?.lastPaymentDate;
        aValue = aLast ? new Date(aLast).getTime() : 0;
        bValue = bLast ? new Date(bLast).getTime() : 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredPatients, sortKey, sortOrder]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ödeme Listesi</h1>
          <p className="text-sm text-muted-foreground">
            Hastaları bu ekranda görüntüleyebilir ve yönetebilirsiniz.
            Borcu Kalmayan Hastalar Listeye Dahil Edilmez!!
          </p>
        </div>
        <Link href="/hasta/ekle">
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
      <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md shadow-sm mb-4">
        <label className="text-sm font-medium text-muted-foreground">Sırala:</label>
        <select
          className="border border-input bg-background rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={sortKey}
          onChange={e => setSortKey(e.target.value as any)}
        >
          <option value="name">İsme Göre</option>
          <option value="totalRemainingAmount">Toplam Kalan Tutar</option>
          <option value="lastPaymentDate">Son Ödeme Tarihi</option>
        </select>
        <select
          className="border border-input bg-background rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as any)}
        >
          <option value="asc">Artan (A-Z / Küçükten Büyüğe)</option>
          <option value="desc">Azalan (Z-A / Büyükten Küçüğe)</option>
        </select>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <DataTable
          columns={patientColumns}
          data={sortedPatients}
          pagination
        />
      )}
    </div>
  )
}
