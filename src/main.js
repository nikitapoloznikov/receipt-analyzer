import './styles.css';
import { mountRouter } from './router.js';
import { allReceipts } from './lib/db.js';
import { enqueue } from './lib/queue.js';
import { saveReceiptWithConversion } from './lib/receipt.js';

function lc(v) { return String(v || '').toLowerCase(); }

function eligibleForAutoSave(r) {
  if (r.status !== 'parsed') return false;
  if (r.user_edited) return false;
  if (!r.merchant || !r.currency) return false;
  if (!(r.total > 0)) return false;
  const c = r.confidence || {};
  if (lc(c.overall) === 'low') return false;
  if (lc(c.merchant) === 'low') return false;
  if (lc(c.total) === 'low') return false;
  return true;
}

async function bootstrap() {
  mountRouter(document.getElementById('app'));

  const all = await allReceipts();
  for (const r of all) {
    if (r.status === 'parsing') {
      enqueue(r.id);
    } else if (eligibleForAutoSave(r)) {
      saveReceiptWithConversion(r).catch(err =>
        console.warn('Startup auto-save failed for', r.id, err)
      );
    }
  }
}

bootstrap();
