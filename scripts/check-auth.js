const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables. Root .env.local must be loaded.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers(email) {
    console.log(`Checking Supabase Auth users...`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error.message);
        return;
    }

    if (!users || users.length === 0) {
        console.log('No users found in Supabase Auth.');
        return;
    }

    if (email) {
        const user = users.find(u => u.email === email);
        if (!user) {
            console.log(`❌ User with email ${email} not found.`);
        } else {
            printUser(user);
        }
    } else {
        console.log(`Found ${users.length} users:`);
        users.forEach(printUser);
    }
}

function printUser(user) {
    console.log(`-------------------------`);
    console.log(`Email: ${user.email}`);
    console.log(`Confirmed: ${user.email_confirmed_at ? '✅ Yes' : '⚠️ No'}`);
    console.log(`Last Login: ${user.last_sign_in_at || 'Never'}`);
}

const email = process.argv[2];
checkUsers(email);
