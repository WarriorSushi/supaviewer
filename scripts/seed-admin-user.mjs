import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const email = "drsyedirfan93@gmail.com";
const password = "Fra1ni4m";
const displayName = "Dr Syed Irfan";

const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

if (listError) {
  throw listError;
}

const existingUser = existingUsers.users.find((user) => user.email === email);

let userId = existingUser?.id;

if (!userId) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
    },
  });

  if (error) {
    throw error;
  }

  userId = data.user.id;
} else {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
    },
  });

  if (error) {
    throw error;
  }
}

const { error: profileError } = await supabase
  .from("profiles")
  .update({ role: "admin", display_name: displayName, email })
  .eq("id", userId);

if (profileError) {
  throw profileError;
}

console.log(`Seeded admin user: ${email}`);
