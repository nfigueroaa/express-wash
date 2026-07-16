#!/usr/bin/env node

/**
 * Agrega un email como admin en Firestore.
 * Uso: npx ts-node scripts/add-admin.ts <email> [role]
 * Ejemplo: npx ts-node scripts/add-admin.ts admin@example.com admin
 */

import * as admin from 'firebase-admin';

admin.initializeApp({ projectId: 'expresswash-prod-202605112332' });
const db = admin.firestore();

async function addAdmin(email: string, role: 'admin' | 'supervisor' | 'operario' = 'admin') {
  try {
    // Crear o actualizar el documento del admin
    await db.collection('admins').doc(email).set(
      {
        email,
        nombre: email.split('@')[0],
        role,
        activo: true,
        creadoEn: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    console.log(`✅ ${email} agregado como ${role}`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error:`, err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

const email = process.argv[2];
const role = (process.argv[3] || 'admin') as 'admin' | 'supervisor' | 'operario';

if (!email || !email.includes('@')) {
  console.error('❌ Email inválido. Uso: npx ts-node scripts/add-admin.ts <email> [role]');
  process.exit(1);
}

addAdmin(email, role);
