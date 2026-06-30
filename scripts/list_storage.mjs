import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const distContent = fs.readFileSync('dist/assets/siteDataService-2h6K0Da4.js', 'utf8');
const match = distContent.match(/const .="https:\/\/xuicjydgtoltdhkbqoju\.supabase\.co",[A-Z]="(eyJ[A-Za-z0-9_\-\.]+)"/);
if (!match) { console.log('Key not found'); process.exit(1); }

const KEY = match[1];
const supabase = createClient(SUPABASE_URL, KEY);

// List uploads folder
supabase.storage.from('product-images').list('uploads', { limit: 200 })
  .then(({ data, error }) => {
    if (error) { console.log('Error:', error.message); return; }
    const homeFiles = data.filter(f => f.name.includes('home-') || f.name.includes('series'));
    fs.writeFileSync('/tmp/storage_files.json', JSON.stringify(homeFiles, null, 2));
    console.log('Found', homeFiles.length, 'home-related files');
  });
