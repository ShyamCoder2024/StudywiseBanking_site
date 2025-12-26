/**
 * AUDIT SCRIPT: Extract all backend routes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, '../routes');

async function auditRoutes() {
    console.log('🔍 BACKEND ROUTE AUDIT\n');
    console.log('='.repeat(60));

    const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

    const allRoutes = {};

    for (const file of routeFiles) {
        const filePath = path.join(routesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Extract route definitions
        const routePattern = /router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g;
        const routes = [];

        let match;
        while ((match = routePattern.exec(content)) !== null) {
            routes.push({
                method: match[1].toUpperCase(),
                path: match[2]
            });
        }

        allRoutes[file] = routes;
    }

    // Display results
    for (const [file, routes] of Object.entries(allRoutes)) {
        console.log(`\n📄 ${file}`);
        console.log('-'.repeat(60));
        routes.forEach(route => {
            console.log(`   ${route.method.padEnd(7)} ${route.path}`);
        });
        console.log(`   Total: ${routes.length} routes`);
    }

    // Summary
    const totalRoutes = Object.values(allRoutes).reduce((sum, routes) => sum + routes.length, 0);
    console.log('\n' + '='.repeat(60));
    console.log(`📊 TOTAL ROUTES: ${totalRoutes}`);
    console.log('='.repeat(60));
}

auditRoutes();
