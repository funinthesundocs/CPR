import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lcthxjtcicbtirsxkxbh.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkStorage() {
  try {
    const BUCKET_NAME = 'case-evidence';

    console.log('Checking root level files...');
    const { data: files } = await admin.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1000 });

    console.log(`Found ${files.length} items at root:\n`);
    
    for (const f of files) {
      console.log(`Name: ${f.name}`);
      console.log(`  Is folder: ${!!f.id}`);
      console.log(`  Created: ${f.created_at}`);
      console.log(`  Updated: ${f.updated_at}`);
      if (f.metadata?.size) {
        console.log(`  Size: ${(f.metadata.size / 1024).toFixed(2)} KB`);
      }
      
      // If it's a folder, list its contents
      if (f.id) {
        const { data: subfolder } = await admin.storage
          .from(BUCKET_NAME)
          .list(f.name, { limit: 100 });
        if (subfolder && subfolder.length > 0) {
          console.log(`  Contains ${subfolder.length} items:`);
          subfolder.forEach(sub => {
            const subType = sub.id ? 'FOLDER' : 'FILE';
            const size = sub.metadata?.size ? ` (${(sub.metadata.size / 1024 / 1024).toFixed(2)} MB)` : '';
            console.log(`    • [${subType}] ${sub.name}${size}`);
          });
        }
      }
      console.log();
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkStorage();
