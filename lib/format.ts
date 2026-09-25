export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function invoiceBalance(invoice: {
  totalAmount: number;
  concessionAmount: number;
  lateFeeApplied: number;
  amountPaid: number;
}) {
  return (
    invoice.totalAmount -
    invoice.concessionAmount +
    invoice.lateFeeApplied -
    invoice.amountPaid
  );
}
