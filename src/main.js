import './styles.css';
import { mountRouter } from './router.js';
import { allReceipts } from './lib/db.js';
import { enqueue } from './lib/queue.js';

async function bootstrap() {
  mountRouter(document.getElementById('app'));

  // Re-enqueue any receipts that were mid-parse when the app last closed
  const all = await allReceipts();
  for (const r of all) {
    if (r.status === 'parsing') enqueue(r.id);
  }
}

bootstrap();
