import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const distContent = fs.readFileSync('dist/assets/siteDataService-2h6K0Da4.js', 'utf8');
const keyMatch = distContent.match(/const .="https:\/\/xuicjydgtoltdhkbqoju\.supabase\.co",[A-Z]="(eyJ[A-Za-z0-9_\-\.]+)"/);
if (!keyMatch) { console.error('No key'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, keyMatch[1]);

async function main() {
  const { data } = await supabase.from('banners').select('name,image_url').in('name', ['home_hero','home_series_yuan','home_series_he','home_series_sheng','home_series_jing']).eq('is_active', true);
  console.log(JSON.stringify(data, null, 2));
}
main();
