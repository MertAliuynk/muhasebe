import React, { useRef } from "react";
import { type RouterOutputs } from "@/trpc/react";
import { Printer } from "lucide-react";

import { formatCurrencyWithSymbol } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function PrintPatients({
	patients,
}: {
	patients: RouterOutputs["patient"]["getFilteredPatients"];
}) {
	const printRef = useRef<HTMLDivElement>(null);

	const handlePrint = () => {
		if (!printRef.current) return;

		const originalDisplay = printRef.current.style.display;
		printRef.current.style.display = "block";

		const style = document.createElement("style");
		style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-content, #print-content * {
          visibility: visible;
        }
        #print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
      #print-content {
        display: none;
      }
      @media print {
        #print-content {
          display: block !important;
        }
      }
    `;
		document.head.appendChild(style);

		window.print();

		document.head.removeChild(style);
		printRef.current.style.display = originalDisplay;
	};

	return (
		<div>
			<Button variant="outline" size="sm" onClick={handlePrint}>
				<Printer className="size-4 mr-2" />
				Yazdır
			</Button>

			<div ref={printRef} className="hidden">
				<div id="print-content" className="p-8">
					<h1 className="text-2xl font-bold mb-6">Hasta Listesi</h1>
					<table className="w-full border-collapse">
						<thead>
							<tr>
								<th className="border border-gray-300 p-2 text-left bg-gray-100">
									Ad Soyad
								</th>
								<th className="border border-gray-300 p-2 text-left bg-gray-100">
									Telefon
								</th>
								<th className="border border-gray-300 p-2 text-left bg-gray-100">
									Kalan Tutar
								</th>
								<th className="border border-gray-300 p-2 text-left bg-gray-100">
									Kalan Taksit Sayısı
								</th>
							</tr>
						</thead>
						<tbody>
							{patients.map((patient) => (
								<tr key={patient.id}>
									<td className="border border-gray-300 p-2">{patient.name}</td>
									<td className="border border-gray-300 p-2">
										{patient.phone || "-"}
									</td>
									<td className="border border-gray-300 p-2">
										{formatCurrencyWithSymbol(
											patient.totalRemainingAmount || 0,
										)}
									</td>
									<td className="border border-gray-300 p-2">
										{patient.remainingInstallmentCount || "-"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
