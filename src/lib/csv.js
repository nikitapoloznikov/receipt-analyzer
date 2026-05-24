function esc(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function row(values) {
  return values.map(esc).join(',') + '\n';
}

export function receiptsToCsv(receipts) {
  const header = [
    'id', 'datetime', 'merchant', 'merchant_address', 'category',
    'subtotal', 'tax', 'total', 'currency', 'total_usd', 'usd_per_unit', 'usd_per_unit_date',
    'payment_method', 'confidence_overall', 'notes', 'created_at', 'user_edited',
    'item_id', 'item_name', 'item_qty', 'item_unit_price', 'item_total_price', 'item_health'
  ];
  let csv = row(header);
  for (const r of receipts) {
    const base = [
      r.id, r.datetime, r.merchant, r.merchant_address, r.category,
      r.subtotal, r.tax, r.total, r.currency, r.total_usd, r.usd_per_unit, r.usd_per_unit_date,
      r.payment_method, r.confidence?.overall, r.notes,
      new Date(r.createdAt).toISOString(), r.user_edited
    ];
    if (!r.items || r.items.length === 0) {
      csv += row([...base, '', '', '', '', '', '']);
    } else {
      for (const it of r.items) {
        csv += row([
          ...base,
          it.id, it.name, it.qty, it.unit_price, it.total_price, it.health_rating
        ]);
      }
    }
  }
  return csv;
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
