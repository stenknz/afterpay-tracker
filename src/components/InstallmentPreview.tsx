import { generateInstallments } from "@/lib/generate-installments";

interface InstallmentPreviewProps {
  totalAmount: number;
  installmentAmount: number;
  frequency: string;
  startDate: string;
}

export function InstallmentPreview({ totalAmount, installmentAmount, frequency, startDate }: InstallmentPreviewProps) {
  if (!totalAmount || !installmentAmount || !frequency || !startDate) {
    return <p className="text-sm text-neutral-400">Fill in the fields above to preview installments.</p>;
  }

  const installments = generateInstallments(totalAmount, installmentAmount, frequency, new Date(startDate));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            <th className="text-left py-2 font-medium text-neutral-500">#</th>
            <th className="text-left py-2 font-medium text-neutral-500">Due Date</th>
            <th className="text-right py-2 font-medium text-neutral-500">Amount</th>
          </tr>
        </thead>
        <tbody>
          {installments.map((inst, i) => (
            <tr key={i} className="border-b border-neutral-100 dark:border-neutral-800/50">
              <td className="py-2">{i + 1}</td>
              <td className="py-2">{inst.dueDate.toLocaleDateString()}</td>
              <td className="py-2 text-right">${inst.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <td className="py-2" colSpan={2}>Total</td>
            <td className="py-2 text-right">${installments.reduce((s, i) => s + i.amount, 0).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
