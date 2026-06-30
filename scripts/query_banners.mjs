import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const KEY = 'eyJhbG...V5ng'; // placeholder, will be replaced

// Try to read the actual key from the dist file
const distContent = fs.readFileSync('/Users/EricMac/.qclaw/workspace/dist/assets/siteDataService-2h6K0Da4.js', 'utf8');
const match = distContent.match(/const .="https:\/\/xuicjydgtoltdhkbqoju\.supabase\.co",[A-Z]="(eyJ[A-Za-z0-9_\-\.]+)"/);
if (match) {
  const actualKey = match[1];
  const supabase = createClient(SUPABASE_URL, actualKey);
  
  supabase.from('banners').select('name,image_url').eq('is_active', true).order('name').then(({ data, error }) => {
    if (error) {
      fs.writeFileSync('/tmp/banners_result.json', JSON.stringify({ error: error.message }));
    } else {
      fs.writeFileSync('/tmp/banners_result.json', JSON.stringify(data, null, 2));
    }
    console.log('Done');
  });
} else {
  fs.writeFileSync('/tmp/banners_result.json', JSON.stringify({ error: 'Key not found' }));
  console.log('Key not found');
}
