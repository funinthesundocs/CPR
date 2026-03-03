import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lcthxjtcicbtirsxkxbh.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkStorage() {
  try {
    console.log('1. Listing all buckets...');
    const { data: buckets, error: bucketsError } = await admin.storage.listBuckets();
    if (bucketsError) {
      console.error('  Error listing buckets:', bucketsError);
      return;
    }
    console.log('  Found buckets:', buckets.map(b => b.name));

    // Check case-evidence bucket
    const BUCKET_NAME = 'case-evidence';
    const bucket = buckets?.find(b => b.name === BUCKET_NAME);
    
    if (!bucket) {
      console.log(`\n  Bucket "${BUCKET_NAME}" does NOT exist`);
      return;
    }

    console.log(`\n2. Listing files in "${BUCKET_NAME}"...`);
    const { data: files, error: filesError } = await admin.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (filesError) {
      console.error('  Error listing files:', filesError);
      return;
    }

    if (!files || files.length === 0) {
      console.log('  Bucket exists but is EMPTY');
      return;
    }

    console.log(`\n  Found ${files.length} items:`);
    files.forEach(f => {
      const type = f.id ? 'FOLDER' : 'FILE';
      const size = f.metadata?.size ? ` (${(f.metadata.size / 1024 / 1024).toFixed(2)} MB)` : '';
      console.log(`    [${type}] ${f.name}${size}`);
      if (f.id) {
        console.log(`      └─ ID: ${f.id}`);
      }
    });

  } catch (err) {
    console.error('Unexpected error:', err.message);
    console.error(err);
  }
}

checkStorage();
