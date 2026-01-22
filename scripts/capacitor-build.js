/**
 * Capacitor Build Script
 * 
 * This script temporarily moves the API folder outside of src during static export
 * to exclude API routes (which are not compatible with static export).
 * 
 * The mobile app will call the deployed Vercel backend instead.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_DIR = path.join(__dirname, '..', 'src', 'app', 'api');
const API_BACKUP_DIR = path.join(__dirname, '..', '.api_backup'); // Outside src
const NEXT_DIR = path.join(__dirname, '..', '.next');

function moveDir(from, to) {
    if (fs.existsSync(from)) {
        fs.renameSync(from, to);
        console.log(`Moved ${from} -> ${to}`);
        return true;
    }
    return false;
}

function cleanDir(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`Cleaned ${dir}`);
    }
}

async function build() {
    console.log('🚀 Starting Capacitor build...\n');

    try {
        // Step 1: Clean .next cache
        console.log('📦 Step 1: Cleaning .next cache...');
        cleanDir(NEXT_DIR);

        // Step 2: Move API routes OUTSIDE of src (so Next.js won't scan it)
        console.log('\n📦 Step 2: Moving API routes outside src...');
        moveDir(API_DIR, API_BACKUP_DIR);

        // Step 3: Generate Prisma client
        console.log('\n📦 Step 3: Generating Prisma client...');
        execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

        // Step 4: Build Next.js with static export
        console.log('\n📦 Step 4: Building Next.js static export...');
        execSync('npx next build', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            env: { ...process.env, CAPACITOR_BUILD: 'true' }
        });

        console.log('\n✅ Static build completed successfully!');
        console.log('📁 Output directory: out/');

    } catch (error) {
        console.error('\n❌ Build failed:', error.message);
        throw error;
    } finally {
        // Always restore API routes
        console.log('\n🔄 Restoring API routes...');
        moveDir(API_BACKUP_DIR, API_DIR);
    }
}

build().catch(() => process.exit(1));
