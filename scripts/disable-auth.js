const fs = require('fs');
const path = require('path');

// Liste des fichiers API admin à modifier
const adminApiFiles = [
  'app/api/admin/dashboard/route.ts',
  'app/api/admin/courses/route.ts',
  'app/api/admin/courses/[id]/route.ts',
  'app/api/admin/activities/route.ts',
  'app/api/admin/activities/[id]/route.ts',
  'app/api/admin/bookings/route.ts',
  'app/api/admin/bookings/[id]/route.ts',
  'app/api/admin/contacts/route.ts',
  'app/api/admin/contacts/[id]/route.ts',
  'app/api/admin/gallery/route.ts',
  'app/api/admin/gallery/[id]/route.ts'
];

// Fonction pour commenter les vérifications d'authentification
function disableAuthInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Commenter les vérifications d'authentification
    content = content.replace(
      /\/\/ Verify admin authentication\n\s*const token = request\.cookies\.get\("auth-token"\)\?\.value\n\s*if \(!token\) \{\n\s*return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\)\n\s*\}\n\n\s*const user = verifyToken\(token\)\n\s*if \(!user \|\| user\.role !== "admin"\) \{\n\s*return NextResponse\.json\(\{ error: "Forbidden" \}, \{ status: 403 \}\)\n\s*\}/g,
      `// Désactiver temporairement la vérification d'authentification pour le développement
    // const token = request.cookies.get("auth-token")?.value
    // if (!token) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // const user = verifyToken(token)
    // if (!user || user.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }`
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Auth disabled in ${filePath}`);
  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Traiter tous les fichiers
console.log('🚀 Désactivation de l\'authentification pour les APIs admin...\n');

adminApiFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    disableAuthInFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✅ Authentification désactivée pour toutes les APIs admin!');
console.log('🔓 Vous pouvez maintenant accéder à /admin sans connexion');

